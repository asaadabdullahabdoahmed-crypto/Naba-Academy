import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { TransformResponseInterceptor } from '../../common/interceptors/transform-response.interceptor';
import { SessionService } from '../identity/application/services/session.service';
import { RolePermissionEntity } from '../identity/infrastructure/persistence/entities/role-permission.entity';
import { UserRoleAssignmentEntity } from '../identity/infrastructure/persistence/entities/user-role-assignment.entity';
import { UserEntity } from '../identity/infrastructure/persistence/entities/user.entity';
import { RolesGuard } from '../identity/presentation/guards/roles.guard';
import { SessionAuthGuard } from '../identity/presentation/guards/session-auth.guard';
import {
  AcademicProgramEntity,
  CourseOfferingEntity,
  DepartmentEntity,
} from './infrastructure/persistence/academic-catalog.entity';
import { AcademicAuthorizationService } from './application/academic-authorization.service';
import { AcademicCatalogService } from './application/academic-catalog.service';
import { StudentAcademicProfileController } from './student-academic-profile.controller';

describe('StudentAcademicProfileController (HTTP authorization)', () => {
  let app: INestApplication;
  const authenticatedUserId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const forgedUserId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  const sessionService = {
    validateSession: jest.fn(),
  };
  const roleAssignments = {
    find: jest.fn(),
  };
  const academicCatalog = {
    getCurrentPlacement: jest.fn(),
    listMyPlacementHistory: jest.fn(),
  };

  const makeUser = (
    id: string,
    departmentEn: string | null = 'Authenticated Department',
  ) =>
    ({
      id,
      accountStatus: 'active',
      emailVerifiedAt: new Date('2026-01-01T00:00:00Z'),
      departmentId: 'department-1',
      departmentAr: 'القسم المصادق عليه',
      departmentEn,
      collegeAr: 'الكلية المصادق عليها',
      collegeEn: 'Authenticated College',
    }) as UserEntity;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [StudentAcademicProfileController],
      providers: [
        { provide: SessionService, useValue: sessionService },
        { provide: AcademicCatalogService, useValue: academicCatalog },
        AcademicAuthorizationService,
        {
          provide: getRepositoryToken(UserRoleAssignmentEntity),
          useValue: roleAssignments,
        },
        {
          provide: getRepositoryToken(DepartmentEntity),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(AcademicProgramEntity),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(CourseOfferingEntity),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(RolePermissionEntity),
          useValue: { find: jest.fn() },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new TransformResponseInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    sessionService.validateSession.mockResolvedValue({
      session: { id: 'session-1' },
      user: makeUser(authenticatedUserId),
    });
    roleAssignments.find.mockResolvedValue([
      {
        roleId: 'student-role',
        role: { code: 'student' },
        scopeType: 'global',
        scopeId: null,
      } as UserRoleAssignmentEntity,
    ]);
  });

  it('rejects unauthenticated requests before role or resource authorization', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/students/me/academic-profile')
      .expect(403);

    expect(sessionService.validateSession).not.toHaveBeenCalled();
    expect(roleAssignments.find).not.toHaveBeenCalled();
  });

  it('rejects an authenticated user without an active student assignment without exposing academic data', async () => {
    sessionService.validateSession.mockResolvedValue({
      session: { id: 'session-2' },
      user: makeUser(
        'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        'Confidential Other Student Department',
      ),
    });
    roleAssignments.find.mockResolvedValue([
      {
        roleId: 'instructor-role',
        role: { code: 'instructor' },
        scopeType: 'global',
        scopeId: null,
      } as UserRoleAssignmentEntity,
    ]);

    const response = await request(app.getHttpServer())
      .get('/api/v1/students/me/academic-profile')
      .set('Cookie', 'naba_session=valid-session-token')
      .expect(403);

    expect(response.text).not.toContain('Confidential Other Student Department');
  });

  it('allows an active student to read their own academic profile', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/students/me/academic-profile')
      .set('Cookie', 'naba_session=valid-session-token')
      .expect(200);

    expect(response.body.data).toEqual({
      departmentId: 'department-1',
      departmentAr: 'القسم المصادق عليه',
      departmentEn: 'Authenticated Department',
      collegeAr: 'الكلية المصادق عليها',
      collegeEn: 'Authenticated College',
    });
  });

  it('ignores a forged userId in query parameters and headers', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/students/me/academic-profile?userId=${forgedUserId}`)
      .set('Cookie', 'naba_session=valid-session-token')
      .set('x-user-id', forgedUserId)
      .expect(200);

    expect(response.body.data.departmentEn).toBe('Authenticated Department');
    expect(response.body.data).not.toHaveProperty('userId', forgedUserId);
    expect(sessionService.validateSession).toHaveBeenCalledWith(
      'valid-session-token',
    );
    expect(roleAssignments.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: authenticatedUserId }),
      }),
    );
  });

  it('returns only the authenticated student recorded history and rejects owner parameters', async () => {
    const historyPage = {
      data: [
        {
          id: 'placement-1',
          effectiveFrom: '2026-09-01',
          effectiveTo: null,
          recordedAt: '2026-08-20T10:00:00.000Z',
          program: { nameEn: 'Authenticated Student Program' },
        },
      ],
      meta: {
        page: 1,
        pageSize: 20,
        totalItems: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    };
    academicCatalog.listMyPlacementHistory.mockResolvedValue(historyPage);

    await request(app.getHttpServer())
      .get(`/api/v1/students/me/academic-placement-history?userId=${forgedUserId}`)
      .set('Cookie', 'naba_session=valid-session-token')
      .expect(400);

    const response = await request(app.getHttpServer())
      .get('/api/v1/students/me/academic-placement-history?page=1&pageSize=20')
      .set('Cookie', 'naba_session=valid-session-token')
      .set('x-user-id', forgedUserId)
      .expect(200);

    expect(response.headers['cache-control']).toContain('no-store');
    expect(response.body.data).toEqual(historyPage.data);
    expect(response.body.meta).toEqual(historyPage.meta);
    expect(response.body.data).not.toContainEqual(
      expect.objectContaining({ userId: forgedUserId }),
    );
    expect(academicCatalog.listMyPlacementHistory).toHaveBeenCalledWith(
      authenticatedUserId,
      expect.objectContaining({ page: 1, pageSize: 20 }),
    );
  });

  it('does not disclose recorded placement history when the student role is missing', async () => {
    roleAssignments.find.mockResolvedValue([
      {
        roleId: 'instructor-role',
        role: { code: 'instructor' },
        scopeType: 'global',
        scopeId: null,
      } as UserRoleAssignmentEntity,
    ]);

    const response = await request(app.getHttpServer())
      .get('/api/v1/students/me/academic-placement-history')
      .set('Cookie', 'naba_session=valid-session-token')
      .expect(403);

    expect(response.text).not.toContain('Authenticated Student Program');
    expect(academicCatalog.listMyPlacementHistory).not.toHaveBeenCalled();
  });
});
