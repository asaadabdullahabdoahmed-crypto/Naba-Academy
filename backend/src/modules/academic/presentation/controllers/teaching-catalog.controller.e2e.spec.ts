import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { TransformResponseInterceptor } from '../../../../common/interceptors/transform-response.interceptor';
import { SessionService } from '../../../identity/application/services/session.service';
import { SessionRevokedException } from '../../../identity/domain/identity.errors';
import { UserRoleAssignmentEntity } from '../../../identity/infrastructure/persistence/entities/user-role-assignment.entity';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { SessionAuthGuard } from '../../../identity/presentation/guards/session-auth.guard';
import { TeachingCatalogService } from '../../application/teaching-catalog.service';
import { TeachingCatalogController } from './teaching-catalog.controller';

describe('Teaching catalog HTTP authorization (real session and role guards)', () => {
  let app: INestApplication;
  const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const meta = { page: 1, pageSize: 20, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false };
  const catalog = { listCourses: jest.fn(), getCourse: jest.fn(), listTerms: jest.fn(), getTerm: jest.fn(), listCourseOfferings: jest.fn() };
  const sessions = { validateSession: jest.fn() };
  const assignments = { find: jest.fn() };
  const paths = ['/academic/courses', `/academic/courses/${id}`, `/academic/courses/${id}/offerings`, '/academic/terms', `/academic/terms/${id}`];

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [TeachingCatalogController],
      providers: [SessionAuthGuard, RolesGuard,
        { provide: SessionService, useValue: sessions },
        { provide: getRepositoryToken(UserRoleAssignmentEntity), useValue: assignments },
        { provide: TeachingCatalogService, useValue: catalog }],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalInterceptors(new TransformResponseInterceptor());
    await app.init();
  });
  afterAll(async () => { await app.close(); });
  beforeEach(() => {
    jest.resetAllMocks();
    for (const method of Object.values(catalog)) method.mockResolvedValue({ data: [], meta });
    sessions.validateSession.mockResolvedValue({ session: { id: 'session-id' }, user: { id: 'server-user' } });
    assignments.find.mockResolvedValue([{ role: { code: 'instructor' } }]);
  });

  it('rejects anonymous access to every route before reaching the catalog', async () => {
    for (const path of paths) await request(app.getHttpServer()).get(`/api/v1${path}`).expect(403);
    expect(sessions.validateSession).not.toHaveBeenCalled();
    expect(assignments.find).not.toHaveBeenCalled();
    for (const method of Object.values(catalog)) expect(method).not.toHaveBeenCalled();
  });

  it.each(['system_admin', 'department_head', 'instructor'])('permits %s reference reads with no-store envelopes', async (role) => {
    assignments.find.mockResolvedValue([{ role: { code: role } }]);
    for (const path of paths) {
      const response = await request(app.getHttpServer()).get(`/api/v1${path}`).set('Cookie', 'naba_session=opaque').expect(200);
      expect(response.headers['cache-control']).toBe('no-store');
      expect(response.body).toEqual({ success: true, data: [], meta });
    }
    const where = assignments.find.mock.calls[0][0].where;
    expect(where.userId).toBe('server-user');
    expect(where.revokedAt.type).toBe('isNull');
    expect(where.assignedAt.type).toBe('lessThanOrEqual');
    expect(where.assignedAt.value).toBeInstanceOf(Date);
  });

  it.each(['student', 'applicant', 'support'])('denies %s even when role/owner headers are spoofed', async (role) => {
    assignments.find.mockResolvedValue([{ role: { code: role } }]);
    for (const path of paths) await request(app.getHttpServer()).get(`/api/v1${path}`)
      .set('Cookie', 'naba_session=opaque').set('X-Role', 'system_admin').set('X-User-Id', 'admin').expect(403);
    for (const method of Object.values(catalog)) expect(method).not.toHaveBeenCalled();
  });

  it('denies absent/revoked assignments and invalid sessions', async () => {
    assignments.find.mockResolvedValue([]);
    await request(app.getHttpServer()).get('/api/v1/academic/courses').set('Cookie', 'naba_session=opaque').expect(403);
    sessions.validateSession.mockRejectedValue(new SessionRevokedException());
    await request(app.getHttpServer()).get('/api/v1/academic/courses').set('Cookie', 'naba_session=expired').expect(403);
    expect(catalog.listCourses).not.toHaveBeenCalled();
  });

  it('rejects malformed IDs, unbounded pages, owner spoofing and unapproved flags', async () => {
    for (const path of [
      '/academic/courses/not-a-uuid', '/academic/terms/not-a-uuid',
      '/academic/courses?pageSize=101', '/academic/courses?page=0', '/academic/terms?page=10001',
      '/academic/courses?departmentId=bad', `/academic/courses/${id}/offerings?termId=bad`,
      '/academic/courses?userId=another', '/academic/terms?includeInactive=true',
      '/academic/courses?search=' + 'x'.repeat(101), '/academic/terms?search[x]=bad',
    ]) await request(app.getHttpServer()).get(`/api/v1${path}`).set('Cookie', 'naba_session=opaque').expect(400);
    for (const method of Object.values(catalog)) expect(method).not.toHaveBeenCalled();
  });

  it('transforms bounded queries and binds nested course and term identifiers', async () => {
    await request(app.getHttpServer()).get(`/api/v1/academic/courses/${id}/offerings?page=2&pageSize=5&termId=${id}&search=%20Fall%20`)
      .set('Cookie', 'naba_session=opaque').expect(200);
    expect(catalog.listCourseOfferings).toHaveBeenCalledWith(id, expect.objectContaining({ page: 2, pageSize: 5, termId: id, search: 'Fall' }));
  });

  it('exposes no academic mutation routes', async () => {
    for (const method of ['post', 'put', 'patch', 'delete'] as const) {
      await request(app.getHttpServer())[method]('/api/v1/academic/courses').set('Cookie', 'naba_session=opaque').send({ code: 'unauthorized' }).expect(404);
    }
  });
});
