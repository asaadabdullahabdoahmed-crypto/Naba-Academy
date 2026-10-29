import { ServiceUnavailableException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  AcademicProgramEntity,
  CollegeEntity,
  CredentialLevelEntity,
  DepartmentEntity,
} from '../infrastructure/persistence/academic-catalog.entity';
import { AcademicCatalogQueryDto } from '../presentation/dto/academic-catalog-query.dto';
import { AcademicCatalogService } from './academic-catalog.service';

function createQueryBuilder<T extends object>() {
  const builder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
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
  const service = new AcademicCatalogService(
    configService,
    colleges,
    departments,
    programs,
    credentialLevels,
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
        },
      ],
      meta: { page: 2, pageSize: 10, total: 21 },
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
});
