import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { TransformResponseInterceptor } from '../../../../common/interceptors/transform-response.interceptor';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { SessionAuthGuard } from '../../../identity/presentation/guards/session-auth.guard';
import { AcademicCatalogService } from '../../application/academic-catalog.service';
import { AcademicCatalogController } from './academic-catalog.controller';

describe('AcademicCatalogController (HTTP contract)', () => {
  let app: INestApplication;
  const academicCatalog = {
    listUniversities: jest.fn(),
    getUniversity: jest.fn(),
    listColleges: jest.fn(),
    getCollege: jest.fn(),
    listCredentialLevels: jest.fn(),
    listDepartments: jest.fn(),
    getDepartment: jest.fn(),
    listPrograms: jest.fn(),
    getProgram: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AcademicCatalogController],
      providers: [{ provide: AcademicCatalogService, useValue: academicCatalog }],
    })
      .overrideGuard(SessionAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

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
  });

  it('returns paginated catalog reads using the standard success envelope', async () => {
    academicCatalog.listColleges.mockResolvedValue({
      data: [],
      meta: {
        page: 1,
        pageSize: 20,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/academic/colleges?page=1&pageSize=20')
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      data: [],
      meta: {
        page: 1,
        pageSize: 20,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
    });
    expect(academicCatalog.listColleges).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 20 }),
    );
  });

  it('rejects invalid pagination, unknown flags, and malformed catalog identifiers', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/academic/colleges?pageSize=101')
      .expect(400);
    await request(app.getHttpServer())
      .get('/api/v1/academic/colleges?includeInactive=true')
      .expect(400);
    await request(app.getHttpServer())
      .get('/api/v1/academic/programs/not-a-uuid')
      .expect(400);
    expect(academicCatalog.listColleges).not.toHaveBeenCalled();
    expect(academicCatalog.getProgram).not.toHaveBeenCalled();
  });

  it('serves university and catalog detail routes through the response envelope', async () => {
    const universityId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    academicCatalog.listUniversities.mockResolvedValue({
      data: [],
      meta: {
        page: 1,
        pageSize: 20,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
    });
    academicCatalog.listColleges.mockResolvedValue({
      data: [],
      meta: {
        page: 1,
        pageSize: 20,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
    });
    academicCatalog.getUniversity.mockResolvedValue({
      id: universityId,
      code: 'TEST',
      nameAr: 'اختبار',
      nameEn: 'Test',
      status: 'active',
    });

    await request(app.getHttpServer())
      .get('/api/v1/academic/universities')
      .expect(200);
    await request(app.getHttpServer())
      .get(`/api/v1/academic/universities/${universityId}/colleges`)
      .expect(200);
    const response = await request(app.getHttpServer())
      .get(`/api/v1/academic/universities/${universityId}`)
      .expect(200);

    expect(response.body.data.id).toBe(universityId);
    expect(academicCatalog.listUniversities).toHaveBeenCalled();
    expect(academicCatalog.listColleges).toHaveBeenCalledWith(
      expect.objectContaining({ universityId }),
    );
    expect(academicCatalog.getUniversity).toHaveBeenCalledWith(universityId);
  });
});
