import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { TransformResponseInterceptor } from '../../../../common/interceptors/transform-response.interceptor';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { SessionAuthGuard } from '../../../identity/presentation/guards/session-auth.guard';
import { AcademicOperationsService } from '../../application/academic-operations.service';
import { AcademicOperationsController } from './academic-operations.controller';

describe('AcademicOperationsController (HTTP validation)', () => {
  let app: INestApplication;
  const operations = {
    enrollStudent: jest.fn().mockResolvedValue({ enrollmentId: 'enrollment-1', status: 'active' }),
    cancelMyEnrollment: jest.fn().mockResolvedValue({ enrollmentId: 'enrollment-1', status: 'cancelled' }),
    listSections: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AcademicOperationsController],
      providers: [{ provide: AcademicOperationsService, useValue: operations }],
    })
      .overrideGuard(SessionAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use((req: { user?: { id: string } }, _res: unknown, next: () => void) => {
      req.user = { id: 'authenticated-student' };
      next();
    });
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    app.useGlobalInterceptors(new TransformResponseInterceptor());
    await app.init();
  });

  afterAll(async () => app.close());

  beforeEach(() => jest.clearAllMocks());

  it('derives student identity from the session and rejects user-supplied ownership fields', async () => {
    const sectionId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    await request(app.getHttpServer())
      .post('/api/v1/students/me/academic-enrollments')
      .send({ sectionId, studentUserId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' })
      .expect(400);
    expect(operations.enrollStudent).not.toHaveBeenCalled();

    await request(app.getHttpServer())
      .post('/api/v1/students/me/academic-enrollments')
      .send({ sectionId })
      .expect(201);
    expect(operations.enrollStudent).toHaveBeenCalledWith(
      sectionId,
      expect.objectContaining({ id: 'authenticated-student' }),
    );
  });

  it('rejects unbounded pagination and unknown filters before querying sections', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/academic/sections?departmentId=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa&pageSize=101')
      .expect(400);
    await request(app.getHttpServer())
      .get('/api/v1/academic/sections?departmentId=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa&includeClosed=true')
      .expect(400);
    expect(operations.listSections).not.toHaveBeenCalled();
  });

  it('allows student cancellation without an optional request body', async () => {
    const enrollmentId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    await request(app.getHttpServer())
      .delete(`/api/v1/students/me/academic-enrollments/${enrollmentId}`)
      .expect(200);

    expect(operations.cancelMyEnrollment).toHaveBeenCalledWith(
      enrollmentId,
      undefined,
      expect.objectContaining({ id: 'authenticated-student' }),
    );
  });
});
