import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import {
  AcademicProgramEntity,
  CollegeEntity,
  CredentialLevelEntity,
  DepartmentEntity,
} from '../infrastructure/persistence/academic-catalog.entity';
import { AcademicCatalogQueryDto } from '../presentation/dto/academic-catalog-query.dto';

interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface CatalogPage<T> {
  data: T[];
  meta: PageMeta;
}

export interface CollegeSummary {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  status: string;
}

export interface DepartmentSummary extends CollegeSummary {
  collegeId: string;
}

export interface CredentialLevelSummary {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  status: string;
}

export interface ProgramSummary extends CollegeSummary {
  departmentId: string;
  credentialLevel: CredentialLevelSummary;
}

export interface ProgramDetail extends ProgramSummary {
  department: DepartmentSummary & { college: CollegeSummary };
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
  ) {}

  async listColleges(query: AcademicCatalogQueryDto): Promise<CatalogPage<CollegeSummary>> {
    this.assertEnabled();
    const builder = this.colleges
      .createQueryBuilder('college')
      .where('college.status = :active', { active: 'active' })
      .andWhere('college.deletedAt IS NULL');
    this.applySearch(builder, 'college', query.search);

    const [rows, total] = await builder
      .orderBy('college.nameEn', 'ASC')
      .addOrderBy('college.id', 'ASC')
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize)
      .getManyAndCount();

    return this.page(rows.map((college) => this.toCollegeSummary(college)), query, total);
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
      where: { id: collegeId, status: 'active' },
    });
    if (!college) {
      throw new NotFoundException('College not found');
    }

    const builder = this.departments
      .createQueryBuilder('department')
      .innerJoin('department.college', 'college')
      .where('department.collegeId = :collegeId', { collegeId })
      .andWhere('department.status = :active', { active: 'active' })
      .andWhere('department.deletedAt IS NULL')
      .andWhere('college.status = :active', { active: 'active' })
      .andWhere('college.deletedAt IS NULL');
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
      where: { id: departmentId, status: 'active' },
      relations: { college: true },
    });
    if (!department || !department.college || department.college.status !== 'active') {
      throw new NotFoundException('Department not found');
    }

    const builder = this.programs
      .createQueryBuilder('program')
      .innerJoin('program.department', 'department')
      .innerJoin('department.college', 'college')
      .innerJoinAndSelect('program.credentialLevel', 'credentialLevel')
      .where('program.departmentId = :departmentId', { departmentId })
      .andWhere('program.status = :active', { active: 'active' })
      .andWhere('program.deletedAt IS NULL')
      .andWhere('department.status = :active', { active: 'active' })
      .andWhere('department.deletedAt IS NULL')
      .andWhere('college.status = :active', { active: 'active' })
      .andWhere('college.deletedAt IS NULL')
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
      .innerJoinAndSelect('program.credentialLevel', 'credentialLevel')
      .where('program.id = :programId', { programId })
      .andWhere('program.deletedAt IS NULL')
      .andWhere('department.deletedAt IS NULL')
      .andWhere('college.deletedAt IS NULL')
      .andWhere('credentialLevel.deletedAt IS NULL')
      .getOne();

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    const credentialLevel = this.toCredentialLevelSummary(program.credentialLevel);
    const college = this.toCollegeSummary(program.department.college);
    const department = {
      ...this.toDepartmentSummary(program.department),
      college,
    };

    return {
      ...this.toProgramSummary(program),
      department,
      credentialLevel,
    };
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
    return {
      data,
      meta: { page: query.page, pageSize: query.pageSize, total },
    };
  }

  private toCollegeSummary(college: CollegeEntity): CollegeSummary {
    return {
      id: college.id,
      code: college.code,
      nameAr: college.nameAr,
      nameEn: college.nameEn,
      status: college.status,
    };
  }

  private toDepartmentSummary(department: DepartmentEntity): DepartmentSummary {
    return {
      ...this.toCollegeSummary(department),
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
      ...this.toCollegeSummary(program),
      departmentId: program.departmentId,
      credentialLevel: this.toCredentialLevelSummary(program.credentialLevel),
    };
  }
}
