import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import {
  AcademicProgramEntity,
  CollegeEntity,
  CredentialLevelEntity,
  DepartmentEntity,
  StudentAcademicPlacementEntity,
  UniversityEntity,
} from '../infrastructure/persistence/academic-catalog.entity';
import { AcademicCatalogQueryDto } from '../presentation/dto/academic-catalog-query.dto';

interface PageMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CatalogPage<T> {
  data: T[];
  meta: PageMeta;
}

interface CatalogSummary {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  status: string;
}

export interface CollegeSummary extends CatalogSummary {
  universityId: string | null;
}

export interface UniversitySummary {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  status: string;
}

export interface CollegeDetail extends CollegeSummary {
  university: UniversitySummary | null;
}

export interface DepartmentSummary extends CatalogSummary {
  collegeId: string;
}

export interface DepartmentDetail extends DepartmentSummary {
  college: CollegeDetail;
}

export interface CredentialLevelSummary {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  status: string;
}

export interface ProgramSummary extends CatalogSummary {
  departmentId: string;
  credentialLevel: CredentialLevelSummary;
}

export interface ProgramDetail extends ProgramSummary {
  department: DepartmentDetail;
}

export interface StudentAcademicPlacementSummary {
  id: string;
  effectiveFrom: string;
  program: ProgramSummary & {
    department: DepartmentSummary & {
      college: CollegeDetail;
    };
  };
}

export interface RecordedStudentAcademicPlacementSummary extends StudentAcademicPlacementSummary {
  effectiveTo: string | null;
  recordedAt: string;
}

@Injectable()
export class AcademicCatalogService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(CollegeEntity)
    private readonly colleges: Repository<CollegeEntity>,
    @InjectRepository(DepartmentEntity)
    private readonly departments: Repository<DepartmentEntity>,
    @InjectRepository(AcademicProgramEntity)
    private readonly programs: Repository<AcademicProgramEntity>,
    @InjectRepository(CredentialLevelEntity)
    private readonly credentialLevels: Repository<CredentialLevelEntity>,
    @InjectRepository(UniversityEntity)
    private readonly universities: Repository<UniversityEntity>,
    @InjectRepository(StudentAcademicPlacementEntity)
    private readonly placements: Repository<StudentAcademicPlacementEntity>,
  ) {}

  async listUniversities(
    query: AcademicCatalogQueryDto,
  ): Promise<CatalogPage<UniversitySummary>> {
    this.assertEnabled();
    const builder = this.universities
      .createQueryBuilder('university')
      .where('university.status = :active', { active: 'active' })
      .andWhere('university.deletedAt IS NULL');
    this.applySearch(builder, 'university', query.search);

    const [rows, total] = await builder
      .orderBy('university.nameEn', 'ASC')
      .addOrderBy('university.id', 'ASC')
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize)
      .getManyAndCount();

    return this.page(rows.map((university) => this.toUniversitySummary(university)), query, total);
  }

  async getUniversity(universityId: string): Promise<UniversitySummary> {
    this.assertEnabled();
    const university = await this.universities.findOne({
      where: { id: universityId, deletedAt: IsNull() },
    });
    if (!university) throw new NotFoundException('University not found');
    return this.toUniversitySummary(university);
  }

  async listColleges(query: AcademicCatalogQueryDto): Promise<CatalogPage<CollegeSummary>> {
    this.assertEnabled();
    const builder = this.colleges
      .createQueryBuilder('college')
      .leftJoinAndSelect('college.university', 'university')
      .where('college.status = :active', { active: 'active' })
      .andWhere('college.deletedAt IS NULL')
      .andWhere(
        '(college.universityId IS NULL OR (university.status = :active AND university.deletedAt IS NULL))',
        { active: 'active' },
      );
    if (query.universityId) {
      builder.andWhere('college.universityId = :universityId', {
        universityId: query.universityId,
      });
    }
    this.applySearch(builder, 'college', query.search);

    const [rows, total] = await builder
      .orderBy('college.nameEn', 'ASC')
      .addOrderBy('college.id', 'ASC')
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize)
      .getManyAndCount();

    if (query.universityId && total === 0) {
      const university = await this.universities.findOne({
        where: {
          id: query.universityId,
          status: 'active',
          deletedAt: IsNull(),
        },
      });
      if (!university) throw new NotFoundException('University not found');
    }

    return this.page(rows.map((college) => this.toCollegeSummary(college)), query, total);
  }

  async getCollege(collegeId: string): Promise<CollegeDetail> {
    this.assertEnabled();
    const college = await this.colleges
      .createQueryBuilder('college')
      .leftJoinAndSelect('college.university', 'university')
      .where('college.id = :collegeId', { collegeId })
      .andWhere('college.deletedAt IS NULL')
      .andWhere(
        '(college.universityId IS NULL OR (university.id IS NOT NULL AND university.deletedAt IS NULL))',
      )
      .getOne();
    if (!college) throw new NotFoundException('College not found');
    return this.toCollegeDetail(college);
  }

  async getDepartment(departmentId: string): Promise<DepartmentDetail> {
    this.assertEnabled();
    const department = await this.departments
      .createQueryBuilder('department')
      .innerJoinAndSelect('department.college', 'college')
      .leftJoinAndSelect('college.university', 'university')
      .where('department.id = :departmentId', { departmentId })
      .andWhere('department.deletedAt IS NULL')
      .andWhere('college.deletedAt IS NULL')
      .andWhere(
        '(college.universityId IS NULL OR (university.id IS NOT NULL AND university.deletedAt IS NULL))',
      )
      .getOne();
    if (!department) throw new NotFoundException('Department not found');
    return {
      ...this.toDepartmentSummary(department),
      college: this.toCollegeDetail(department.college),
    };
  }

  async listCredentialLevels(
    query: AcademicCatalogQueryDto,
  ): Promise<CatalogPage<CredentialLevelSummary>> {
    this.assertEnabled();
    const builder = this.credentialLevels
      .createQueryBuilder('credentialLevel')
      .where('credentialLevel.status = :active', { active: 'active' })
      .andWhere('credentialLevel.deletedAt IS NULL');
    this.applySearch(builder, 'credentialLevel', query.search);

    const [rows, total] = await builder
      .orderBy('credentialLevel.sortOrder', 'ASC')
      .addOrderBy('credentialLevel.nameEn', 'ASC')
      .addOrderBy('credentialLevel.id', 'ASC')
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize)
      .getManyAndCount();

    return this.page(
      rows.map(({ id, code, nameAr, nameEn, status }) => ({
        id,
        code,
        nameAr,
        nameEn,
        status,
      })),
      query,
      total,
    );
  }

  async listDepartments(
    collegeId: string,
    query: AcademicCatalogQueryDto,
  ): Promise<CatalogPage<DepartmentSummary>> {
    this.assertEnabled();
    const college = await this.colleges.findOne({
      where: { id: collegeId, status: 'active', deletedAt: IsNull() },
      relations: { university: true },
    });
    if (
      !college ||
      (college.universityId !== null &&
        (!college.university ||
          college.university.status !== 'active' ||
          Boolean(college.university.deletedAt)))
    ) {
      throw new NotFoundException('College not found');
    }

    const builder = this.departments
      .createQueryBuilder('department')
      .innerJoin('department.college', 'college')
      .leftJoin('college.university', 'university')
      .where('department.collegeId = :collegeId', { collegeId })
      .andWhere('department.status = :active', { active: 'active' })
      .andWhere('department.deletedAt IS NULL')
      .andWhere('college.status = :active', { active: 'active' })
      .andWhere('college.deletedAt IS NULL')
      .andWhere(
        '(college.universityId IS NULL OR (university.id IS NOT NULL AND university.status = :active AND university.deletedAt IS NULL))',
        { active: 'active' },
      );
    this.applySearch(builder, 'department', query.search);

    const [rows, total] = await builder
      .orderBy('department.nameEn', 'ASC')
      .addOrderBy('department.id', 'ASC')
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize)
      .getManyAndCount();

    return this.page(
      rows.map((department) => this.toDepartmentSummary(department)),
      query,
      total,
    );
  }

  async listPrograms(
    departmentId: string,
    query: AcademicCatalogQueryDto,
  ): Promise<CatalogPage<ProgramSummary>> {
    this.assertEnabled();
    const department = await this.departments.findOne({
      where: { id: departmentId, status: 'active', deletedAt: IsNull() },
      relations: { college: { university: true } },
    });
    if (
      !department ||
      !department.college ||
      Boolean(department.college.deletedAt) ||
      department.college.status !== 'active' ||
      (department.college.universityId !== null &&
        (!department.college.university ||
          department.college.university.status !== 'active' ||
          Boolean(department.college.university.deletedAt)))
    ) {
      throw new NotFoundException('Department not found');
    }

    const builder = this.programs
      .createQueryBuilder('program')
      .innerJoin('program.department', 'department')
      .innerJoin('department.college', 'college')
      .leftJoin('college.university', 'university')
      .innerJoinAndSelect('program.credentialLevel', 'credentialLevel')
      .where('program.departmentId = :departmentId', { departmentId })
      .andWhere('program.status = :active', { active: 'active' })
      .andWhere('program.deletedAt IS NULL')
      .andWhere('department.status = :active', { active: 'active' })
      .andWhere('department.deletedAt IS NULL')
      .andWhere('college.status = :active', { active: 'active' })
      .andWhere('college.deletedAt IS NULL')
      .andWhere(
        '(college.universityId IS NULL OR (university.id IS NOT NULL AND university.status = :active AND university.deletedAt IS NULL))',
        { active: 'active' },
      )
      .andWhere('credentialLevel.status = :active', { active: 'active' })
      .andWhere('credentialLevel.deletedAt IS NULL');
    this.applySearch(builder, 'program', query.search);

    const [rows, total] = await builder
      .orderBy('program.nameEn', 'ASC')
      .addOrderBy('program.id', 'ASC')
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize)
      .getManyAndCount();

    return this.page(rows.map((program) => this.toProgramSummary(program)), query, total);
  }

  async getProgram(programId: string): Promise<ProgramDetail> {
    this.assertEnabled();
    const program = await this.programs
      .createQueryBuilder('program')
      .innerJoinAndSelect('program.department', 'department')
      .innerJoinAndSelect('department.college', 'college')
      .leftJoinAndSelect('college.university', 'university')
      .innerJoinAndSelect('program.credentialLevel', 'credentialLevel')
      .where('program.id = :programId', { programId })
      .andWhere('program.deletedAt IS NULL')
      .andWhere('department.deletedAt IS NULL')
      .andWhere('college.deletedAt IS NULL')
      .andWhere(
        '(college.universityId IS NULL OR (university.id IS NOT NULL AND university.deletedAt IS NULL))',
      )
      .andWhere('credentialLevel.deletedAt IS NULL')
      .getOne();

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    const credentialLevel = this.toCredentialLevelSummary(program.credentialLevel);
    const college = this.toCollegeSummary(program.department.college);
    const department = {
      ...this.toDepartmentSummary(program.department),
      college: {
        ...college,
        university: program.department.college.university
          ? this.toUniversitySummary(program.department.college.university)
          : null,
      },
    };

    return {
      ...this.toProgramSummary(program),
      department,
      credentialLevel,
    };
  }

  async getCurrentPlacement(
    userId: string,
  ): Promise<{ current: StudentAcademicPlacementSummary | null }> {
    this.assertEnabled();
    const placement = await this.placements
      .createQueryBuilder('placement')
      .innerJoinAndSelect('placement.program', 'program')
      .innerJoinAndSelect('program.department', 'department')
      .innerJoinAndSelect('department.college', 'college')
      .leftJoinAndSelect('college.university', 'university')
      .innerJoinAndSelect('program.credentialLevel', 'credentialLevel')
      .where('placement.userId = :userId', { userId })
      .andWhere('placement.effectiveTo IS NULL')
      .andWhere('program.deletedAt IS NULL')
      .andWhere('department.deletedAt IS NULL')
      .andWhere('college.deletedAt IS NULL')
      .andWhere(
        '(college.universityId IS NULL OR (university.id IS NOT NULL AND university.deletedAt IS NULL))',
      )
      .andWhere('credentialLevel.deletedAt IS NULL')
      .getOne();

    if (!placement) return { current: null };
    const program = placement.program;
    const college = this.toCollegeDetail(program.department.college);
    const department = {
      ...this.toDepartmentSummary(program.department),
      college,
    };
    return {
      current: {
        id: placement.id,
        effectiveFrom: placement.effectiveFrom,
        program: {
          ...this.toProgramSummary(program),
          department,
        },
      },
    };
  }

  async listMyPlacementHistory(
    userId: string,
    query: AcademicCatalogQueryDto,
  ): Promise<CatalogPage<RecordedStudentAcademicPlacementSummary>> {
    this.assertEnabled();
    const builder = this.placements
      .createQueryBuilder('placement')
      .innerJoinAndSelect('placement.program', 'program')
      .innerJoinAndSelect('program.department', 'department')
      .innerJoinAndSelect('department.college', 'college')
      .leftJoinAndSelect('college.university', 'university')
      .innerJoinAndSelect('program.credentialLevel', 'credentialLevel')
      .where('placement.userId = :userId', { userId })
      .andWhere('program.deletedAt IS NULL')
      .andWhere('department.deletedAt IS NULL')
      .andWhere('college.deletedAt IS NULL')
      .andWhere(
        '(college.universityId IS NULL OR (university.id IS NOT NULL AND university.deletedAt IS NULL))',
      )
      .andWhere('credentialLevel.deletedAt IS NULL');

    const [rows, total] = await builder
      .orderBy('placement.effectiveFrom', 'DESC')
      .addOrderBy('placement.recordedAt', 'DESC')
      .addOrderBy('placement.id', 'DESC')
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize)
      .getManyAndCount();

    return this.page(
      rows.map((placement) => this.toRecordedPlacementSummary(placement)),
      query,
      total,
    );
  }

  private assertEnabled(): void {
    if (!this.configService.get<boolean>('academicCatalog.readsEnabled', false)) {
      throw new ServiceUnavailableException(
        'Academic catalog reads are disabled until the approved schema is deployed',
      );
    }
  }

  private applySearch<T extends ObjectLiteral>(
    builder: SelectQueryBuilder<T>,
    alias: string,
    search?: string,
  ): void {
    if (!search) return;
    builder.andWhere(
      `(${alias}.code ILIKE :search OR ${alias}.nameAr ILIKE :search OR ${alias}.nameEn ILIKE :search)`,
      { search: `%${search}%` },
    );
  }

  private page<T>(data: T[], query: AcademicCatalogQueryDto, total: number): CatalogPage<T> {
    const totalPages = Math.ceil(total / query.pageSize);
    return {
      data,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems: total,
        totalPages,
        hasNext: query.page < totalPages,
        hasPrevious: query.page > 1,
      },
    };
  }

  private toCollegeSummary(college: CollegeEntity): CollegeSummary {
    return {
      ...this.toCatalogSummary(college),
      universityId: college.universityId ?? null,
    };
  }

  private toCollegeDetail(college: CollegeEntity): CollegeDetail {
    return {
      ...this.toCollegeSummary(college),
      university: college.university
        ? this.toUniversitySummary(college.university)
        : null,
    };
  }

  private toUniversitySummary(university: UniversityEntity): UniversitySummary {
    return {
      id: university.id,
      code: university.code,
      nameAr: university.nameAr,
      nameEn: university.nameEn,
      status: university.status,
    };
  }

  private toDepartmentSummary(department: DepartmentEntity): DepartmentSummary {
    return {
      ...this.toCatalogSummary(department),
      collegeId: department.collegeId,
    };
  }

  private toCredentialLevelSummary(level: CredentialLevelEntity): CredentialLevelSummary {
    return {
      id: level.id,
      code: level.code,
      nameAr: level.nameAr,
      nameEn: level.nameEn,
      status: level.status,
    };
  }

  private toProgramSummary(program: AcademicProgramEntity): ProgramSummary {
    return {
      ...this.toCatalogSummary(program),
      departmentId: program.departmentId,
      credentialLevel: this.toCredentialLevelSummary(program.credentialLevel),
    };
  }

  private toRecordedPlacementSummary(
    placement: StudentAcademicPlacementEntity,
  ): RecordedStudentAcademicPlacementSummary {
    const program = placement.program;
    const college = this.toCollegeDetail(program.department.college);
    const department = {
      ...this.toDepartmentSummary(program.department),
      college,
    };
    return {
      id: placement.id,
      effectiveFrom: placement.effectiveFrom,
      effectiveTo: placement.effectiveTo,
      recordedAt: placement.recordedAt.toISOString(),
      program: {
        ...this.toProgramSummary(program),
        department,
      },
    };
  }

  private toCatalogSummary(
    entity: Pick<CollegeEntity, 'id' | 'code' | 'nameAr' | 'nameEn' | 'status'>,
  ): CatalogSummary {
    return {
      id: entity.id,
      code: entity.code,
      nameAr: entity.nameAr,
      nameEn: entity.nameEn,
      status: entity.status,
    };
  }
}
