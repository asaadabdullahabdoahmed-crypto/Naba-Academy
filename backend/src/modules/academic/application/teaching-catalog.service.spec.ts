import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TeachingCatalogService } from './teaching-catalog.service';
import { CourseCatalogQueryDto, CourseOfferingQueryDto, TeachingCatalogQueryDto } from '../presentation/dto/teaching-catalog-query.dto';

function builder() {
  return {
    where: jest.fn().mockReturnThis(), andWhere: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(), innerJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(), leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(), addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(), take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]), getOne: jest.fn(),
  };
}

describe('TeachingCatalogService reference boundary', () => {
  let courseQuery: ReturnType<typeof builder>;
  let termQuery: ReturnType<typeof builder>;
  let offeringQuery: ReturnType<typeof builder>;
  let service: TeachingCatalogService;
  const config = { get: jest.fn() };
  const courses = { createQueryBuilder: jest.fn() };
  const terms = { createQueryBuilder: jest.fn() };
  const offerings = { createQueryBuilder: jest.fn() };
  const course = {
    id: 'course-id', code: 'C1', nameAr: 'مقرر', nameEn: 'Course', status: 'active',
    createdAt: new Date(), sensitive: 'must not leak',
    department: { id: 'dept-id', code: 'D', nameAr: 'قسم', nameEn: 'Department',
      college: { id: 'college-id', code: 'COL', nameAr: 'كلية', nameEn: 'College', university: null } },
  };
  const term = { id: 'term-id', code: 'T1', nameAr: 'فصل', nameEn: 'Term', status: 'completed',
    startsOn: '2026-01-01', endsOn: '2026-06-01', deletedAt: null };

  beforeEach(() => {
    jest.clearAllMocks();
    courseQuery = builder(); termQuery = builder(); offeringQuery = builder();
    courses.createQueryBuilder.mockReturnValue(courseQuery);
    terms.createQueryBuilder.mockReturnValue(termQuery);
    offerings.createQueryBuilder.mockReturnValue(offeringQuery);
    config.get.mockReturnValue(true);
    service = new TeachingCatalogService(config as unknown as ConfigService, courses as never, terms as never, offerings as never);
  });

  it('fails closed on every new read before any repository query', async () => {
    config.get.mockReturnValue(false);
    for (const run of [
      () => service.listCourses(new CourseCatalogQueryDto()), () => service.getCourse('id'),
      () => service.listTerms(new TeachingCatalogQueryDto()), () => service.getTerm('id'),
      () => service.listCourseOfferings('id', new CourseOfferingQueryDto()),
    ]) await expect(run()).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(config.get).toHaveBeenCalledWith('academicCatalog.readsEnabled', false);
    for (const repository of [courses, terms, offerings]) expect(repository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('binds search and department filters, escapes wildcard literals, and uses stable bounded pages', async () => {
    courseQuery.getManyAndCount.mockResolvedValue([[course], 41]);
    const query = Object.assign(new CourseCatalogQueryDto(), { page: 2, pageSize: 20, search: "50%_\\'", departmentId: 'dept-id' });
    const result = await service.listCourses(query);
    expect(result.meta).toEqual({ page: 2, pageSize: 20, totalItems: 41, totalPages: 3, hasNext: true, hasPrevious: true });
    expect(courseQuery.skip).toHaveBeenCalledWith(20);
    expect(courseQuery.take).toHaveBeenCalledWith(20);
    expect(courseQuery.addOrderBy).toHaveBeenCalledWith('course.id', 'ASC');
    expect(courseQuery.andWhere).toHaveBeenCalledWith('course.departmentId = :departmentId', { departmentId: 'dept-id' });
    expect(courseQuery.andWhere).toHaveBeenCalledWith(expect.stringContaining('ILIKE :search'), { search: "%50\\%\\_\\\\'%" });
    expect(result.data[0]).not.toHaveProperty('sensitive');
    expect(result.data[0]).not.toHaveProperty('createdAt');
    expect(result.data[0].university).toBeNull();
  });

  it('excludes inactive/deleted ancestry consistently on list, details, and offering queries', async () => {
    courseQuery.getOne.mockResolvedValue(course);
    await service.listCourses(new CourseCatalogQueryDto());
    await service.getCourse(course.id);
    await service.listCourseOfferings(course.id, new CourseOfferingQueryDto());
    for (const query of [courseQuery, offeringQuery]) {
      for (const alias of ['course', 'department', 'college']) {
        expect(query.andWhere).toHaveBeenCalledWith(`${alias}.deletedAt IS NULL`);
        expect(query.andWhere).toHaveBeenCalledWith(`${alias}.status = :active`, { active: 'active' });
      }
      expect(query.andWhere).toHaveBeenCalledWith(expect.stringContaining('university.deletedAt IS NULL'), { active: 'active' });
    }
    expect(offeringQuery.andWhere).toHaveBeenCalledWith('offering.deletedAt IS NULL');
    expect(offeringQuery.andWhere).toHaveBeenCalledWith('term.deletedAt IS NULL');
  });

  it('returns 404 for an invisible course and never queries its offerings', async () => {
    courseQuery.getOne.mockResolvedValue(null);
    await expect(service.listCourseOfferings('missing', new CourseOfferingQueryDto())).rejects.toBeInstanceOf(NotFoundException);
    expect(offerings.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('returns recorded term dates/status without inventing a current-term policy', async () => {
    termQuery.getManyAndCount.mockResolvedValue([[term], 1]);
    const result = await service.listTerms(new TeachingCatalogQueryDto());
    expect(result.data[0]).toEqual({ id: 'term-id', code: 'T1', nameAr: 'فصل', nameEn: 'Term', status: 'completed', startsOn: '2026-01-01', endsOn: '2026-06-01' });
    expect(termQuery.where).toHaveBeenCalledWith('term.deletedAt IS NULL');
    expect(termQuery.orderBy).toHaveBeenCalledWith('term.startsOn', 'DESC');
    expect(termQuery.addOrderBy).toHaveBeenCalledWith('term.id', 'ASC');
    expect(result.meta.hasNext).toBe(false);
  });

  it('filters offerings by visible term and returns reference fields only', async () => {
    courseQuery.getOne.mockResolvedValue(course); termQuery.getOne.mockResolvedValue(term);
    offeringQuery.getManyAndCount.mockResolvedValue([[{
      id: 'offering-id', code: 'O1', courseId: course.id, status: 'closed', term,
      teacherId: 'do-not-expose', roster: ['private'],
    }], 1]);
    const result = await service.listCourseOfferings(course.id, Object.assign(new CourseOfferingQueryDto(), { termId: term.id, search: 'T1' }));
    expect(offeringQuery.where).toHaveBeenCalledWith('offering.courseId = :courseId', { courseId: course.id });
    expect(offeringQuery.andWhere).toHaveBeenCalledWith('offering.academicTermId = :termId', { termId: term.id });
    expect(offeringQuery.addOrderBy).toHaveBeenCalledWith('offering.id', 'ASC');
    expect(result.data[0]).not.toHaveProperty('teacherId');
    expect(result.data[0]).not.toHaveProperty('roster');
    expect(result.data[0].term.status).toBe('completed');
  });

  it('rejects missing terms and preserves a successful empty result', async () => {
    await expect(service.getTerm('missing')).rejects.toBeInstanceOf(NotFoundException);
    expect((await service.listTerms(new TeachingCatalogQueryDto())).meta.totalItems).toBe(0);
    courseQuery.getOne.mockResolvedValue(course);
    await expect(service.listCourseOfferings(course.id, Object.assign(new CourseOfferingQueryDto(), { termId: 'missing' }))).rejects.toBeInstanceOf(NotFoundException);
    expect(offerings.createQueryBuilder).not.toHaveBeenCalled();
  });
});
