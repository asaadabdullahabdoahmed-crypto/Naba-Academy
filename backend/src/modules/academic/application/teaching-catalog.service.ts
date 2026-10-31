import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import {
  AcademicTermEntity,
  CourseEntity,
  CourseOfferingEntity,
} from '../infrastructure/persistence/academic-catalog.entity';
import {
  CourseCatalogQueryDto,
  CourseOfferingQueryDto,
  TeachingCatalogQueryDto,
} from '../presentation/dto/teaching-catalog-query.dto';
import { CatalogPage } from './academic-catalog.service';

/** Shared reference data, never a teacher assignment, roster, or management grant. */
@Injectable()
export class TeachingCatalogService {
  constructor(
    private readonly config: ConfigService,
    @InjectRepository(CourseEntity) private readonly courses: Repository<CourseEntity>,
    @InjectRepository(AcademicTermEntity) private readonly terms: Repository<AcademicTermEntity>,
    @InjectRepository(CourseOfferingEntity) private readonly offerings: Repository<CourseOfferingEntity>,
  ) {}

  async listCourses(query: CourseCatalogQueryDto) {
    this.assertEnabled();
    const builder = this.courseQuery();
    if (query.departmentId) {
      builder.andWhere('course.departmentId = :departmentId', { departmentId: query.departmentId });
    }
    this.search(builder, 'course', query.search);
    const [rows, total] = await builder.orderBy('course.nameEn', 'ASC')
      .addOrderBy('course.id', 'ASC')
      .skip((query.page - 1) * query.pageSize).take(query.pageSize).getManyAndCount();
    return this.page(rows.map((course) => this.courseSummary(course)), query, total);
  }

  async getCourse(courseId: string) {
    this.assertEnabled();
    const course = await this.courseQuery().andWhere('course.id = :courseId', { courseId }).getOne();
    if (!course) throw new NotFoundException('Course not found');
    return this.courseSummary(course);
  }

  async listTerms(query: TeachingCatalogQueryDto) {
    this.assertEnabled();
    const builder = this.termQuery();
    this.search(builder, 'term', query.search);
    const [rows, total] = await builder.orderBy('term.startsOn', 'DESC')
      .addOrderBy('term.id', 'ASC')
      .skip((query.page - 1) * query.pageSize).take(query.pageSize).getManyAndCount();
    return this.page(rows.map((term) => this.termSummary(term)), query, total);
  }

  async getTerm(termId: string) {
    this.assertEnabled();
    const term = await this.termQuery().andWhere('term.id = :termId', { termId }).getOne();
    if (!term) throw new NotFoundException('Academic term not found');
    return this.termSummary(term);
  }

  async listCourseOfferings(courseId: string, query: CourseOfferingQueryDto) {
    // Validate the active, visible course before looking at its offerings.
    await this.getCourse(courseId);
    if (query.termId) await this.getTerm(query.termId);
    const builder = this.offerings.createQueryBuilder('offering')
      .innerJoinAndSelect('offering.term', 'term')
      .innerJoin('offering.course', 'course')
      .innerJoin('course.department', 'department')
      .innerJoin('department.college', 'college')
      .leftJoin('college.university', 'university')
      .where('offering.courseId = :courseId', { courseId })
      .andWhere('offering.deletedAt IS NULL')
      .andWhere('term.deletedAt IS NULL');
    // Recheck ancestry in this query too: retirement can happen between reads.
    this.visibleCourse(builder);
    if (query.termId) builder.andWhere('offering.academicTermId = :termId', { termId: query.termId });
    if (query.search) {
      builder.andWhere('(offering.code ILIKE :search OR term.code ILIKE :search OR term.nameAr ILIKE :search OR term.nameEn ILIKE :search)',
        { search: this.searchPattern(query.search) });
    }
    const [rows, total] = await builder.orderBy('term.startsOn', 'DESC')
      .addOrderBy('offering.code', 'ASC').addOrderBy('offering.id', 'ASC')
      .skip((query.page - 1) * query.pageSize).take(query.pageSize).getManyAndCount();
    return this.page(rows.map((offering) => ({
      id: offering.id,
      courseId: offering.courseId,
      code: offering.code,
      status: offering.status,
      term: this.termSummary(offering.term),
    })), query, total);
  }

  private assertEnabled(): void {
    if (!this.config.get<boolean>('academicCatalog.readsEnabled', false)) {
      throw new ServiceUnavailableException('Academic catalog reads are disabled until the approved schema is deployed');
    }
  }

  private courseQuery() {
    const builder = this.courses.createQueryBuilder('course')
      .innerJoinAndSelect('course.department', 'department')
      .innerJoinAndSelect('department.college', 'college')
      .leftJoinAndSelect('college.university', 'university');
    this.visibleCourse(builder);
    return builder;
  }

  private visibleCourse<T extends ObjectLiteral>(builder: SelectQueryBuilder<T>): void {
    for (const alias of ['course', 'department', 'college']) {
      builder.andWhere(`${alias}.status = :active`, { active: 'active' })
        .andWhere(`${alias}.deletedAt IS NULL`);
    }
    builder.andWhere('(college.universityId IS NULL OR (university.id IS NOT NULL AND university.status = :active AND university.deletedAt IS NULL))', { active: 'active' });
  }

  private termQuery() {
    // Status is returned as stored. No current-term or registration-window policy is inferred.
    return this.terms.createQueryBuilder('term').where('term.deletedAt IS NULL');
  }

  private searchPattern(value: string): string {
    // Treat SQL wildcard characters as literal text, using PostgreSQL's default escape.
    return `%${value.replace(/[\\%_]/g, '\\$&')}%`;
  }

  private search<T extends ObjectLiteral>(builder: SelectQueryBuilder<T>, alias: string, value?: string): void {
    if (!value) return;
    builder.andWhere(`(${alias}.code ILIKE :search OR ${alias}.nameAr ILIKE :search OR ${alias}.nameEn ILIKE :search)`,
      { search: this.searchPattern(value) });
  }

  private courseSummary(course: CourseEntity) {
    const { department } = course;
    const { college } = department;
    const { university } = college;
    return {
      id: course.id, code: course.code, nameAr: course.nameAr, nameEn: course.nameEn, status: course.status,
      department: { id: department.id, code: department.code, nameAr: department.nameAr, nameEn: department.nameEn },
      college: { id: college.id, code: college.code, nameAr: college.nameAr, nameEn: college.nameEn },
      university: university ? { id: university.id, code: university.code, nameAr: university.nameAr, nameEn: university.nameEn } : null,
    };
  }

  private termSummary(term: AcademicTermEntity) {
    return { id: term.id, code: term.code, nameAr: term.nameAr, nameEn: term.nameEn,
      status: term.status, startsOn: term.startsOn, endsOn: term.endsOn };
  }

  private page<T>(data: T[], query: TeachingCatalogQueryDto, totalItems: number): CatalogPage<T> {
    const totalPages = Math.ceil(totalItems / query.pageSize);
    return { data, meta: { page: query.page, pageSize: query.pageSize, totalItems, totalPages,
      hasNext: query.page < totalPages, hasPrevious: query.page > 1 } };
  }
}
