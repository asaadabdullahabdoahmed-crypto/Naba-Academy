import { ServiceUnavailableException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  AcademicProgramEntity,
  CollegeEntity,
  CredentialLevelEntity,
  DepartmentEntity,
  StudentAcademicPlacementEntity,
  UniversityEntity,
} from '../infrastructure/persistence/academic-catalog.entity';
import { AcademicCatalogQueryDto } from '../presentation/dto/academic-catalog-query.dto';
import { AcademicCatalogService } from './academic-catalog.service';

function createQueryBuilder<T extends object>() {
  const builder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getOne: jest.fn(),
  };
  return builder as unknown as SelectQueryBuilder<T> & typeof builder;
}

describe('AcademicCatalogService', () => {
  const configService = {
    get: jest.fn(),
  } as unknown as ConfigService;
  const colleges = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
  } as unknown as jest.Mocked<Repository<CollegeEntity>>;
  const departments = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
  } as unknown as jest.Mocked<Repository<DepartmentEntity>>;
  const programs = {
    createQueryBuilder: jest.fn(),
  } as unknown as jest.Mocked<Repository<AcademicProgramEntity>>;
  const credentialLevels = {
    createQueryBuilder: jest.fn(),
  } as unknown as jest.Mocked<Repository<CredentialLevelEntity>>;
  const universities = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
  } as unknown as jest.Mocked<Repository<UniversityEntity>>;
  const placements = {
    createQueryBuilder: jest.fn(),
  } as unknown as jest.Mocked<Repository<StudentAcademicPlacementEntity>>;
  const service = new AcademicCatalogService(
    configService,
    colleges,
    departments,
    programs,
    credentialLevels,
    universities,
    placements,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps catalog access disabled until explicitly enabled', async () => {
    jest.mocked(configService.get).mockReturnValue(false);

    await expect(service.listColleges(new AcademicCatalogQueryDto())).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(colleges.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('fails closed for normalized student placements when the catalog is disabled', async () => {
    jest.mocked(configService.get).mockReturnValue(false);

    await expect(service.getCurrentPlacement('student-id')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    await expect(
      service.listMyPlacementHistory('student-id', new AcademicCatalogQueryDto()),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(placements.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('returns a stable, bounded page of college summaries', async () => {
    jest.mocked(configService.get).mockReturnValue(true);
    const builder = createQueryBuilder<CollegeEntity>();
    builder.getManyAndCount.mockResolvedValue([
      [
        {
          id: 'college-id',
          code: 'COL',
          nameAr: 'اختبار',
          nameEn: 'Test',
          status: 'active',
        } as CollegeEntity,
      ],
      21,
    ]);
    jest.mocked(colleges.createQueryBuilder).mockReturnValue(builder);

    const query = Object.assign(new AcademicCatalogQueryDto(), { page: 2, pageSize: 10 });
    await expect(service.listColleges(query)).resolves.toEqual({
      data: [
        {
          id: 'college-id',
          code: 'COL',
          nameAr: 'اختبار',
          nameEn: 'Test',
          status: 'active',
          universityId: null,
        },
      ],
      meta: {
        page: 2,
        pageSize: 10,
        totalItems: 21,
        totalPages: 3,
        hasNext: true,
        hasPrevious: true,
      },
    });
    expect(builder.skip).toHaveBeenCalledWith(10);
    expect(builder.take).toHaveBeenCalledWith(10);
    expect(builder.addOrderBy).toHaveBeenCalledWith('college.id', 'ASC');
  });

  it('does not expose departments under an inactive or missing college', async () => {
    jest.mocked(configService.get).mockReturnValue(true);
    jest.mocked(colleges.findOne).mockResolvedValue(null);

    await expect(
      service.listDepartments('college-id', new AcademicCatalogQueryDto()),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(departments.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('returns not found when listing colleges under an inactive or missing university', async () => {
    jest.mocked(configService.get).mockReturnValue(true);
    const builder = createQueryBuilder<CollegeEntity>();
    builder.getManyAndCount.mockResolvedValue([[], 0]);
    jest.mocked(colleges.createQueryBuilder).mockReturnValue(builder);
    jest.mocked(universities.findOne).mockResolvedValue(null);

    await expect(
      service.listColleges(
        Object.assign(new AcademicCatalogQueryDto(), {
          universityId: 'university-id',
        }),
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(colleges.createQueryBuilder).toHaveBeenCalledTimes(1);
    expect(universities.findOne).toHaveBeenCalledWith({
      where: {
        id: 'university-id',
        status: 'active',
        deletedAt: expect.anything(),
      },
    });
  });

  it('avoids a separate university lookup when the filtered college query has results', async () => {
    jest.mocked(configService.get).mockReturnValue(true);
    const builder = createQueryBuilder<CollegeEntity>();
    builder.getManyAndCount.mockResolvedValue([
      [
        {
          id: 'college-id',
          code: 'COL',
          nameAr: 'اختبار',
          nameEn: 'Test',
          status: 'active',
          universityId: 'university-id',
        } as CollegeEntity,
      ],
      1,
    ]);
    jest.mocked(colleges.createQueryBuilder).mockReturnValue(builder);

    await service.listColleges(
      Object.assign(new AcademicCatalogQueryDto(), {
        universityId: 'university-id',
      }),
    );

    expect(universities.findOne).not.toHaveBeenCalled();
  });

  it('preserves empty pages for an active university with no matching colleges', async () => {
    jest.mocked(configService.get).mockReturnValue(true);
    const builder = createQueryBuilder<CollegeEntity>();
    builder.getManyAndCount.mockResolvedValue([[], 0]);
    jest.mocked(colleges.createQueryBuilder).mockReturnValue(builder);
    jest.mocked(universities.findOne).mockResolvedValue({
      id: 'university-id',
      status: 'active',
    } as UniversityEntity);

    await expect(
      service.listColleges(
        Object.assign(new AcademicCatalogQueryDto(), {
          universityId: 'university-id',
        }),
      ),
    ).resolves.toMatchObject({ data: [], meta: { totalItems: 0 } });

    expect(universities.findOne).toHaveBeenCalledTimes(1);
  });

  it('does not return a soft-deleted university by id', async () => {
    jest.mocked(configService.get).mockReturnValue(true);
    jest.mocked(universities.findOne).mockResolvedValue(null);

    await expect(service.getUniversity('university-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );

    const [options] = jest.mocked(universities.findOne).mock.calls[0] ?? [];
    expect(options?.where).toEqual(
      expect.objectContaining({
        id: 'university-id',
        deletedAt: expect.anything(),
      }),
    );
  });

  it('can read inactive non-deleted catalog records by id for historical integrity', async () => {
    jest.mocked(configService.get).mockReturnValue(true);
    const builder = createQueryBuilder<AcademicProgramEntity>();
    builder.getOne.mockResolvedValue({
      id: 'program-id',
      departmentId: 'department-id',
      code: 'OLD',
      nameAr: 'برنامج سابق',
      nameEn: 'Former Program',
      status: 'inactive',
      credentialLevel: {
        id: 'level-id',
        code: 'LEVEL',
        nameAr: 'مستوى سابق',
        nameEn: 'Former Level',
        status: 'inactive',
      },
      department: {
        id: 'department-id',
        collegeId: 'college-id',
        code: 'DEPT',
        nameAr: 'قسم سابق',
        nameEn: 'Former Department',
        status: 'inactive',
        college: {
          id: 'college-id',
          code: 'COL',
          nameAr: 'كلية سابقة',
          nameEn: 'Former College',
          status: 'inactive',
        },
      },
    } as AcademicProgramEntity);
    jest.mocked(programs.createQueryBuilder).mockReturnValue(builder);

    await expect(service.getProgram('program-id')).resolves.toMatchObject({
      id: 'program-id',
      status: 'inactive',
      credentialLevel: { status: 'inactive', nameEn: 'Former Level' },
      department: {
        status: 'inactive',
        college: { status: 'inactive', nameEn: 'Former College' },
      },
    });
  });

  it('scopes current-placement reads to the authenticated user id', async () => {
    jest.mocked(configService.get).mockReturnValue(true);
    const builder = createQueryBuilder<StudentAcademicPlacementEntity>();
    builder.getOne.mockResolvedValue(null);
    jest.mocked(placements.createQueryBuilder).mockReturnValue(builder);

    await expect(service.getCurrentPlacement('authenticated-student-id')).resolves.toEqual({
      current: null,
    });

    expect(builder.where).toHaveBeenCalledWith(
      'placement.userId = :userId',
      { userId: 'authenticated-student-id' },
    );
  });

  it('returns recorded placements newest-first with bounded pagination and owner filtering', async () => {
    jest.mocked(configService.get).mockReturnValue(true);
    const builder = createQueryBuilder<StudentAcademicPlacementEntity>();
    const placement = {
      id: 'placement-new',
      effectiveFrom: '2026-09-01',
      effectiveTo: null,
      recordedAt: new Date('2026-08-20T10:00:00.000Z'),
      program: {
        id: 'program-1',
        code: 'P1',
        nameAr: 'برنامج',
        nameEn: 'Program',
        status: 'inactive',
        departmentId: 'department-1',
        credentialLevel: {
          id: 'credential-1',
          code: 'C1',
          nameAr: 'مؤهل',
          nameEn: 'Credential',
          status: 'active',
        },
        department: {
          id: 'department-1',
          code: 'D1',
          nameAr: 'قسم',
          nameEn: 'Department',
          status: 'active',
          collegeId: 'college-1',
          college: {
            id: 'college-1',
            code: 'COL1',
            nameAr: 'كلية',
            nameEn: 'College',
            status: 'active',
            universityId: null,
            university: null,
          },
        },
      },
    } as StudentAcademicPlacementEntity;
    builder.getManyAndCount.mockResolvedValue([[placement], 1]);
    jest.mocked(placements.createQueryBuilder).mockReturnValue(builder);
    const query = Object.assign(new AcademicCatalogQueryDto(), {
      page: 2,
      pageSize: 10,
    });

    await expect(
      service.listMyPlacementHistory('authenticated-student', query),
    ).resolves.toMatchObject({
      data: [
        {
          id: 'placement-new',
          effectiveFrom: '2026-09-01',
          effectiveTo: null,
          recordedAt: '2026-08-20T10:00:00.000Z',
          program: {
            id: 'program-1',
            department: {
              id: 'department-1',
              college: { id: 'college-1' },
            },
          },
        },
      ],
      meta: {
        page: 2,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: true,
      },
    });
    expect(builder.where).toHaveBeenCalledWith(
      'placement.userId = :userId',
      { userId: 'authenticated-student' },
    );
    expect(builder.orderBy).toHaveBeenCalledWith('placement.effectiveFrom', 'DESC');
    expect(builder.addOrderBy).toHaveBeenNthCalledWith(
      1,
      'placement.recordedAt',
      'DESC',
    );
    expect(builder.addOrderBy).toHaveBeenNthCalledWith(2, 'placement.id', 'DESC');
    expect(builder.skip).toHaveBeenCalledWith(10);
    expect(builder.take).toHaveBeenCalledWith(10);
  });

  it('returns an empty recorded placement page for a student without history', async () => {
    jest.mocked(configService.get).mockReturnValue(true);
    const builder = createQueryBuilder<StudentAcademicPlacementEntity>();
    builder.getManyAndCount.mockResolvedValue([[], 0]);
    jest.mocked(placements.createQueryBuilder).mockReturnValue(builder);

    await expect(
      service.listMyPlacementHistory(
        'authenticated-student',
        new AcademicCatalogQueryDto(),
      ),
    ).resolves.toEqual({
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
  });
});
