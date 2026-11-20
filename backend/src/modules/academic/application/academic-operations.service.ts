import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, EntityManager, In, IsNull, LessThanOrEqual } from 'typeorm';
import { UserEntity } from '../../identity/infrastructure/persistence/entities/user.entity';
import { UserRoleAssignmentEntity } from '../../identity/infrastructure/persistence/entities/user-role-assignment.entity';
import {
  AcademicProgramEntity,
  CourseOfferingEntity,
  StudentAcademicPlacementEntity,
} from '../infrastructure/persistence/academic-catalog.entity';
import { AcademicCatalogQueryDto } from '../presentation/dto/academic-catalog-query.dto';
import {
  AcademicOperationAuditEventEntity,
  AcademicOperationAuditDetails,
  AcademicSectionEntity,
  AcademicSectionMeeting,
  AcademicStudentEnrollmentEntity,
  AcademicTeacherSectionAssignmentEntity,
} from '../infrastructure/persistence/academic-operations.entity';
import { AcademicAuthorizationService } from './academic-authorization.service';
import {
  AcademicOperationsQueryDto,
  AvailableSectionsQueryDto,
  CreateAcademicSectionDto,
  UpdateAcademicSectionDto,
} from '../presentation/dto/academic-operations.dto';

const ADMIN_ROLES = ['system_admin', 'department_head'] as const;
const ACTIVE_ENROLLMENT = 'active';

@Injectable()
export class AcademicOperationsService {
  constructor(
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
    private readonly authorization: AcademicAuthorizationService,
  ) {}

  async listSections(query: AcademicOperationsQueryDto, principal: UserEntity) {
    this.assertEnabled();
    await this.assertManager(
      principal,
      query.departmentId,
      'academic.sections.manage',
    );
    const builder = this.sectionQuery()
      .where('department.id = :departmentId', { departmentId: query.departmentId });
    if (query.status) builder.andWhere('section.status = :status', { status: query.status });
    this.applySearch(builder, query.search);

    const [sections, total] = await builder
      .orderBy('section.code', 'ASC')
      .addOrderBy('section.id', 'ASC')
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize)
      .getManyAndCount();
    const counts = await this.activeEnrollmentCounts(sections.map(({ id }) => id));
    return this.page(
      sections.map((section) => this.sectionSummary(section, counts.get(section.id) ?? 0)),
      query,
      total,
    );
  }

  async listAvailableSections(query: AvailableSectionsQueryDto, principal: UserEntity) {
    this.assertEnabled();
    await this.authorization.assertStudentOwns(principal, principal.id);
    const placement = await this.currentPlacement(principal.id);
    if (!placement) {
      throw new ForbiddenException('An active academic placement is required for section discovery');
    }
    if (
      !(await this.hasRoleInInstitution(
        principal.id,
        'student',
        placement.program.departmentId,
        placement.program.id,
      ))
    ) {
      throw new ForbiddenException('An active student role in this institution is required');
    }

    const builder = this.sectionQuery()
      .where('department.id = :departmentId', {
        departmentId: placement.program.departmentId,
      })
      .andWhere('section.status = :sectionStatus', { sectionStatus: 'open' })
      .andWhere('offering.status = :offeringStatus', { offeringStatus: 'open' })
      .andWhere('term.status <> :cancelled', { cancelled: 'cancelled' });
    this.applySearch(builder, query.search);
    const [sections, total] = await builder
      .orderBy('section.code', 'ASC')
      .addOrderBy('section.id', 'ASC')
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize)
      .getManyAndCount();

    const counts = await this.activeEnrollmentCounts(sections.map(({ id }) => id));
    const existingOfferings = await this.activeOfferingEnrollments(
      principal.id,
      sections.map(({ courseOfferingId }) => courseOfferingId),
    );
    const now = new Date();
    return this.page(
      sections.map((section) => {
        const enrolled = counts.get(section.id) ?? 0;
        const windowOpen = this.isWindowOpen(section, now);
        const alreadyInOffering = existingOfferings.has(section.courseOfferingId);
        return {
          ...this.sectionSummary(section, enrolled),
          canEnroll:
            windowOpen &&
            enrolled < section.capacity &&
            !alreadyInOffering,
          eligibilityMessage: alreadyInOffering
            ? 'already_enrolled_in_offering'
            : !windowOpen
              ? 'enrollment_window_closed'
              : enrolled >= section.capacity
                ? 'section_full'
                : null,
        };
      }),
      query,
      total,
    );
  }

  async listMySections(query: AcademicCatalogQueryDto, principal: UserEntity) {
    this.assertEnabled();
    const [assignments, totalItems] = await this.dataSource
      .getRepository(AcademicTeacherSectionAssignmentEntity)
      .createQueryBuilder('assignment')
      .innerJoinAndSelect('assignment.section', 'section')
      .innerJoinAndSelect('section.courseOffering', 'offering')
      .innerJoinAndSelect('offering.course', 'course')
      .innerJoinAndSelect('course.department', 'department')
      .innerJoinAndSelect('offering.term', 'term')
      .where('assignment.teacherUserId = :userId', { userId: principal.id })
      .andWhere('assignment.status = :active', { active: 'active' })
      .orderBy('section.code', 'ASC')
      .addOrderBy('section.id', 'ASC')
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize)
      .getManyAndCount();

    for (const assignment of assignments) {
      await this.assertInstructorSectionAccess(principal, assignment.section);
    }
    const counts = await this.activeEnrollmentCounts(
      assignments.map(({ section }) => section.id),
    );
    return this.page(
      assignments.map(({ section }) =>
        this.sectionSummary(section, counts.get(section.id) ?? 0),
      ),
      query,
      totalItems,
    );
  }

  async getSection(sectionId: string, principal: UserEntity) {
    this.assertEnabled();
    const section = await this.requireSection(sectionId);
    const departmentId = section.courseOffering.course.departmentId;
    if (await this.hasManagerRole(principal, departmentId, 'academic.sections.manage')) {
      return this.sectionSummary(
        section,
        await this.countActiveEnrollments(section.id),
      );
    }

    const assignments = await this.dataSource
      .getRepository(UserRoleAssignmentEntity)
      .find({
        where: {
          userId: principal.id,
          revokedAt: IsNull(),
          assignedAt: LessThanOrEqual(new Date()),
        },
        relations: { role: true },
      });
    if (assignments.some(({ role }) => role?.code === 'instructor')) {
      await this.assertInstructorSectionAccess(principal, section);
      return this.sectionSummary(
        section,
        await this.countActiveEnrollments(section.id),
      );
    }

    await this.assertStudentForSection(principal, section);
    if (section.status !== 'open' || section.courseOffering.status !== 'open') {
      const activeEnrollment = await this.dataSource
        .getRepository(AcademicStudentEnrollmentEntity)
        .findOne({
          where: {
            sectionId,
            studentUserId: principal.id,
            status: ACTIVE_ENROLLMENT,
          },
        });
      if (!activeEnrollment) {
        throw new ForbiddenException('Students may view only open sections or their own enrollments');
      }
    }
    return this.sectionSummary(
      section,
      await this.countActiveEnrollments(section.id),
    );
  }

  async createSection(input: CreateAcademicSectionDto, principal: UserEntity) {
    this.assertEnabled();
    this.assertWindowPair(input.enrollmentOpensAt, input.enrollmentClosesAt);
    this.assertSchedule(input.schedule);
    const offering = await this.requireOffering(input.courseOfferingId);
    await this.assertManager(
      principal,
      offering.course.departmentId,
      'academic.sections.manage',
    );
    if (offering.status === 'cancelled' || offering.deletedAt) {
      throw new ConflictException('A section cannot be created for a cancelled offering');
    }
    let section: AcademicSectionEntity;
    try {
      section = await this.dataSource.transaction(async (manager) => {
        const created = await manager.getRepository(AcademicSectionEntity).save({
          courseOfferingId: offering.id,
          code: input.code,
          capacity: input.capacity,
          status: 'planned',
          schedule: input.schedule,
          enrollmentOpensAt: this.toDate(input.enrollmentOpensAt),
          enrollmentClosesAt: this.toDate(input.enrollmentClosesAt),
          createdByUserId: principal.id,
          updatedByUserId: principal.id,
        });
        await this.audit(manager, {
          sectionId: created.id,
          departmentId: offering.course.departmentId,
          actorUserId: principal.id,
          eventType: 'section_created',
          details: { code: created.code, capacity: created.capacity },
        });
        return created;
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Section code already exists within this course offering');
      }
      throw error;
    }
    return this.getSection(section.id, principal);
  }

  async updateSection(
    sectionId: string,
    input: UpdateAcademicSectionDto,
    principal: UserEntity,
  ) {
    this.assertEnabled();
    if (input.schedule) this.assertSchedule(input.schedule);
    const existing = await this.requireSection(sectionId);
    const departmentId = existing.courseOffering.course.departmentId;
    await this.assertManager(principal, departmentId, 'academic.sections.manage');

    try {
      await this.dataSource.transaction(async (manager) => {
        const section = await this.lockSection(manager, sectionId);
        if (!section) throw new NotFoundException('Academic section not found');
        this.assertWindowPair(
          input.enrollmentOpensAt === undefined
            ? section.enrollmentOpensAt?.toISOString() ?? null
            : input.enrollmentOpensAt,
          input.enrollmentClosesAt === undefined
            ? section.enrollmentClosesAt?.toISOString() ?? null
            : input.enrollmentClosesAt,
        );
        const activeCount = await manager
          .getRepository(AcademicStudentEnrollmentEntity)
          .count({
            where: { sectionId, status: ACTIVE_ENROLLMENT },
          });
        if (input.capacity !== undefined && input.capacity < activeCount) {
          throw new ConflictException('Capacity cannot be lower than current active enrollment');
        }

        const details: AcademicOperationAuditDetails = {};
        if (input.code !== undefined) {
          section.code = input.code;
          details.code = input.code;
        }
        if (input.capacity !== undefined) {
          section.capacity = input.capacity;
          details.capacity = input.capacity;
        }
        if (input.schedule !== undefined) {
          section.schedule = input.schedule;
          details.scheduleUpdated = true;
        }
        if (input.enrollmentOpensAt !== undefined) {
          section.enrollmentOpensAt = this.toDate(input.enrollmentOpensAt);
          details.enrollmentOpensAt = input.enrollmentOpensAt;
        }
        if (input.enrollmentClosesAt !== undefined) {
          section.enrollmentClosesAt = this.toDate(input.enrollmentClosesAt);
          details.enrollmentClosesAt = input.enrollmentClosesAt;
        }
        section.updatedByUserId = principal.id;
        await manager.getRepository(AcademicSectionEntity).save(section);
        await this.audit(manager, {
          sectionId,
          departmentId,
          actorUserId: principal.id,
          eventType: 'section_updated',
          details,
        });
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Section code already exists within this course offering');
      }
      throw error;
    }
    return this.getSection(sectionId, principal);
  }

  async setSectionStatus(
    sectionId: string,
    status: 'open' | 'closed',
    principal: UserEntity,
  ) {
    this.assertEnabled();
    const existing = await this.requireSection(sectionId);
    const departmentId = existing.courseOffering.course.departmentId;
    await this.assertManager(principal, departmentId, 'academic.sections.manage');

    await this.dataSource.transaction(async (manager) => {
      const section = await this.lockSection(manager, sectionId);
      if (!section) throw new NotFoundException('Academic section not found');
      if (section.status === status) return;
      if (status === 'open') {
        const offering = await manager.getRepository(CourseOfferingEntity).findOne({
          where: { id: section.courseOfferingId },
          relations: {
            course: { department: { college: { university: true } } },
            term: true,
          },
        });
        if (
          !offering ||
          offering.status !== 'open' ||
          offering.deletedAt ||
          offering.course.status !== 'active' ||
          offering.course.deletedAt ||
          offering.course.department.status !== 'active' ||
          offering.course.department.deletedAt ||
          offering.course.department.college.status !== 'active' ||
          offering.course.department.college.deletedAt ||
          (offering.course.department.college.universityId !== null &&
            (!offering.course.department.college.university ||
              offering.course.department.college.university.status !== 'active' ||
              offering.course.department.college.university.deletedAt)) ||
          offering.term.deletedAt ||
          offering.term.status === 'completed'
        ) {
          throw new ConflictException('Only a valid open course offering can have an open section');
        }
      }
      section.status = status;
      section.updatedByUserId = principal.id;
      await manager.getRepository(AcademicSectionEntity).save(section);
      await this.audit(manager, {
        sectionId,
        departmentId,
        actorUserId: principal.id,
        eventType: status === 'open' ? 'section_opened' : 'section_closed',
        details: { status },
      });
    });
    return this.getSection(sectionId, principal);
  }

  async listSectionTeachers(
    sectionId: string,
    query: AcademicCatalogQueryDto,
    principal: UserEntity,
  ) {
    this.assertEnabled();
    const section = await this.requireSection(sectionId);
    await this.assertManager(
      principal,
      section.courseOffering.course.departmentId,
      'academic.teacher_assignments.manage',
    );
    const [assignments, totalItems] = await this.dataSource
      .getRepository(AcademicTeacherSectionAssignmentEntity)
      .findAndCount({
        where: { sectionId },
        relations: { teacher: true },
        order: { assignedAt: 'DESC' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      });
    return this.page(
      assignments.map((assignment) => ({
        id: assignment.id,
        teacherUserId: assignment.teacherUserId,
        teacherNameAr: assignment.teacher.nameAr,
        teacherNameEn: assignment.teacher.nameEn,
        status: assignment.status,
        assignedAt: assignment.assignedAt.toISOString(),
        revokedAt: assignment.revokedAt?.toISOString() ?? null,
      })),
      query,
      totalItems,
    );
  }

  async assignTeacher(
    sectionId: string,
    teacherUserId: string,
    principal: UserEntity,
  ) {
    this.assertEnabled();
    const section = await this.requireSection(sectionId);
    const departmentId = section.courseOffering.course.departmentId;
    await this.assertManager(
      principal,
      departmentId,
      'academic.teacher_assignments.manage',
    );
    if (section.status === 'closed') {
      throw new ConflictException('A teacher cannot be assigned to a closed section');
    }
    await this.assertActiveTeacher(teacherUserId, departmentId);

    try {
      return await this.dataSource.transaction(async (manager) => {
        const sectionForUpdate = await this.lockSection(manager, sectionId);
        if (!sectionForUpdate || sectionForUpdate.status === 'closed') {
          throw new ConflictException('A teacher cannot be assigned to a closed section');
        }
        const active = await manager.getRepository(AcademicTeacherSectionAssignmentEntity).findOne({
          where: { sectionId, teacherUserId, status: 'active' },
        });
        if (active) throw new ConflictException('Teacher is already assigned to this section');
        const assignment = await manager
          .getRepository(AcademicTeacherSectionAssignmentEntity)
          .save({
            sectionId,
            teacherUserId,
            assignedByUserId: principal.id,
            status: 'active',
            revokedAt: null,
            revokedByUserId: null,
          });
        await this.audit(manager, {
          sectionId,
          departmentId,
          targetUserId: teacherUserId,
          actorUserId: principal.id,
          eventType: 'teacher_assigned',
          details: { assignmentId: assignment.id },
        });
        return assignment;
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Teacher is already assigned to this section');
      }
      throw error;
    }
  }

  async unassignTeacher(
    sectionId: string,
    teacherUserId: string,
    principal: UserEntity,
  ) {
    this.assertEnabled();
    const section = await this.requireSection(sectionId);
    const departmentId = section.courseOffering.course.departmentId;
    await this.assertManager(
      principal,
      departmentId,
      'academic.teacher_assignments.manage',
    );
    return this.dataSource.transaction(async (manager) => {
      const assignment = await manager
        .getRepository(AcademicTeacherSectionAssignmentEntity)
        .findOne({
          where: { sectionId, teacherUserId, status: 'active' },
          lock: { mode: 'pessimistic_write' },
        });
      if (!assignment) throw new NotFoundException('Active teacher assignment not found');
      assignment.status = 'revoked';
      assignment.revokedAt = new Date();
      assignment.revokedByUserId = principal.id;
      await manager.getRepository(AcademicTeacherSectionAssignmentEntity).save(assignment);
      await this.audit(manager, {
        sectionId,
        departmentId,
        targetUserId: teacherUserId,
        actorUserId: principal.id,
        eventType: 'teacher_unassigned',
        details: { assignmentId: assignment.id },
      });
      return { id: assignment.id, status: assignment.status, revokedAt: assignment.revokedAt };
    });
  }

  async listEnrolledStudents(
    sectionId: string,
    query: AcademicCatalogQueryDto,
    principal: UserEntity,
  ) {
    this.assertEnabled();
    const section = await this.requireSection(sectionId);
    const departmentId = section.courseOffering.course.departmentId;
    if (await this.hasManagerRole(principal, departmentId, 'academic.enrollments.manage')) {
      // Authorized administrator; scope was checked against the exact section department.
    } else {
      await this.assertInstructorSectionAccess(principal, section);
    }
    const [enrollments, totalItems] = await this.dataSource
      .getRepository(AcademicStudentEnrollmentEntity)
      .createQueryBuilder('enrollment')
      .innerJoinAndSelect('enrollment.student', 'student')
      .where('enrollment.sectionId = :sectionId', { sectionId })
      .andWhere('enrollment.status = :status', { status: ACTIVE_ENROLLMENT })
      .orderBy('student.nameEn', 'ASC')
      .addOrderBy('student.id', 'ASC')
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize)
      .getManyAndCount();
    return this.page(
      enrollments.map((enrollment) => ({
        enrollmentId: enrollment.id,
        studentUserId: enrollment.studentUserId,
        nameAr: enrollment.student.nameAr,
        nameEn: enrollment.student.nameEn,
        enrolledAt: enrollment.enrolledAt.toISOString(),
      })),
      query,
      totalItems,
    );
  }

  async enrollStudent(sectionId: string, principal: UserEntity) {
    this.assertEnabled();
    const section = await this.requireSection(sectionId);
    await this.assertStudentForSection(principal, section);
    return this.enroll(sectionId, principal.id, principal.id);
  }

  async adminEnrollStudent(
    sectionId: string,
    studentUserId: string,
    principal: UserEntity,
  ) {
    this.assertEnabled();
    const section = await this.requireSection(sectionId);
    const departmentId = section.courseOffering.course.departmentId;
    await this.assertManager(principal, departmentId, 'academic.enrollments.manage');
    await this.assertStudentForSection(
      await this.requireUser(studentUserId),
      section,
    );
    return this.enroll(sectionId, studentUserId, principal.id);
  }

  async listMyEnrollments(query: AcademicCatalogQueryDto, principal: UserEntity) {
    this.assertEnabled();
    await this.authorization.assertStudentOwns(principal, principal.id);
    const [enrollments, totalItems] = await this.dataSource
      .getRepository(AcademicStudentEnrollmentEntity)
      .createQueryBuilder('enrollment')
      .innerJoinAndSelect('enrollment.section', 'section')
      .innerJoinAndSelect('section.courseOffering', 'offering')
      .innerJoinAndSelect('offering.course', 'course')
      .innerJoinAndSelect('course.department', 'department')
      .innerJoinAndSelect('offering.term', 'term')
      .where('enrollment.studentUserId = :userId', { userId: principal.id })
      .orderBy('enrollment.enrolledAt', 'DESC')
      .addOrderBy('enrollment.id', 'DESC')
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize)
      .getManyAndCount();
    return this.page(
      enrollments.map((enrollment) => ({
        enrollmentId: enrollment.id,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt.toISOString(),
        cancelledAt: enrollment.cancelledAt?.toISOString() ?? null,
        section: this.sectionSummary(enrollment.section),
      })),
      query,
      totalItems,
    );
  }

  async cancelMyEnrollment(
    enrollmentId: string,
    reason: string | undefined,
    principal: UserEntity,
  ) {
    this.assertEnabled();
    await this.authorization.assertStudentOwns(principal, principal.id);
    const enrollment = await this.requireEnrollment(enrollmentId);
    if (enrollment.studentUserId !== principal.id) {
      throw new ForbiddenException('Students may cancel only their own enrollment');
    }
    return this.cancelEnrollment(enrollmentId, principal.id, principal.id, reason);
  }

  async adminCancelEnrollment(
    enrollmentId: string,
    reason: string | undefined,
    principal: UserEntity,
  ) {
    this.assertEnabled();
    const enrollment = await this.requireEnrollment(enrollmentId);
    const departmentId = enrollment.section.courseOffering.course.departmentId;
    await this.assertManager(principal, departmentId, 'academic.enrollments.manage');
    return this.cancelEnrollment(
      enrollmentId,
      enrollment.studentUserId,
      principal.id,
      reason,
    );
  }

  private async enroll(
    sectionId: string,
    studentUserId: string,
    actorUserId: string,
  ) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const sectionRepository = manager.getRepository(AcademicSectionEntity);
        const initial = await sectionRepository.findOne({ where: { id: sectionId } });
        if (!initial) throw new NotFoundException('Academic section not found');
        const offering = await this.lockOffering(manager, initial.courseOfferingId);
        const section = await this.lockSection(manager, sectionId);
        if (!offering || !section) throw new NotFoundException('Academic section not found');
        this.assertOpenForEnrollment(section, offering);

        const duplicate = await manager.getRepository(AcademicStudentEnrollmentEntity).findOne({
          where: { sectionId, studentUserId, status: ACTIVE_ENROLLMENT },
        });
        if (duplicate) throw new ConflictException('Student is already enrolled in this section');
        const sameOffering = await manager
          .getRepository(AcademicStudentEnrollmentEntity)
          .createQueryBuilder('enrollment')
          .innerJoin('enrollment.section', 'enrolledSection')
          .where('enrollment.studentUserId = :studentUserId', { studentUserId })
          .andWhere('enrollment.status = :status', { status: ACTIVE_ENROLLMENT })
          .andWhere('enrolledSection.courseOfferingId = :offeringId', {
            offeringId: section.courseOfferingId,
          })
          .getOne();
        if (sameOffering) {
          throw new ConflictException('Student is already enrolled in another section of this offering');
        }
        const activeCount = await manager.getRepository(AcademicStudentEnrollmentEntity).count({
          where: { sectionId, status: ACTIVE_ENROLLMENT },
        });
        if (activeCount >= section.capacity) {
          throw new ConflictException('Academic section has no remaining capacity');
        }

        const enrollment = await manager.getRepository(AcademicStudentEnrollmentEntity).save({
          sectionId,
          studentUserId,
          enrolledByUserId: actorUserId,
          status: ACTIVE_ENROLLMENT,
          cancelledAt: null,
          cancelledByUserId: null,
        });
        await this.audit(manager, {
          sectionId,
          departmentId: offering.course.departmentId,
          targetUserId: studentUserId,
          actorUserId,
          eventType: 'student_enrolled',
          details: { enrollmentId: enrollment.id },
        });
        return {
          enrollmentId: enrollment.id,
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt.toISOString(),
        };
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Duplicate active enrollment or assignment is not allowed');
      }
      throw error;
    }
  }

  private async cancelEnrollment(
    enrollmentId: string,
    expectedStudentId: string,
    actorUserId: string,
    reason?: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const enrollmentRepository = manager.getRepository(AcademicStudentEnrollmentEntity);
      const initialEnrollment = await enrollmentRepository.findOne({
        where: { id: enrollmentId },
      });
      if (!initialEnrollment || initialEnrollment.studentUserId !== expectedStudentId) {
        throw new NotFoundException('Active enrollment not found');
      }
      const initialSection = await manager
        .getRepository(AcademicSectionEntity)
        .findOne({ where: { id: initialEnrollment.sectionId } });
      if (!initialSection) throw new NotFoundException('Academic section not found');
      const offering = await this.lockOffering(
        manager,
        initialSection.courseOfferingId,
      );
      const section = await this.lockSection(manager, initialSection.id);
      if (!section) throw new NotFoundException('Academic section not found');
      const enrollment = await enrollmentRepository.findOne({
        where: { id: enrollmentId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!offering) throw new NotFoundException('Course offering not found');
      if (!enrollment || enrollment.studentUserId !== expectedStudentId) {
        throw new NotFoundException('Active enrollment not found');
      }
      if (enrollment.status !== ACTIVE_ENROLLMENT) {
        throw new ConflictException('Enrollment is already cancelled');
      }
      this.assertWindowOpen(section);

      enrollment.status = 'cancelled';
      enrollment.cancelledAt = new Date();
      enrollment.cancelledByUserId = actorUserId;
      await enrollmentRepository.save(enrollment);
      await this.audit(manager, {
        sectionId: section.id,
        departmentId: offering.course.departmentId,
        targetUserId: expectedStudentId,
        actorUserId,
        eventType: 'enrollment_cancelled',
        details: { enrollmentId, reason: reason ?? null },
      });
      return {
        enrollmentId,
        status: enrollment.status,
        cancelledAt: enrollment.cancelledAt.toISOString(),
      };
    });
  }

  private async assertStudentForSection(student: UserEntity, section: AcademicSectionEntity) {
    await this.authorization.assertStudentOwns(student, student.id);
    const placement = await this.currentPlacement(student.id);
    if (
      !placement ||
      placement.program.departmentId !== section.courseOffering.course.departmentId
    ) {
      throw new ForbiddenException('An active placement in this section department is required');
    }
    const hasStudentScope = await this.hasRoleInInstitution(
      student.id,
      'student',
      section.courseOffering.course.departmentId,
      placement.program.id,
    );
    if (!hasStudentScope) {
      throw new ForbiddenException('An active student role in this institution is required');
    }
  }

  private async assertActiveTeacher(teacherUserId: string, departmentId: string) {
    const teacher = await this.requireUser(teacherUserId);
    const assignments = await this.dataSource.getRepository(UserRoleAssignmentEntity).find({
      where: {
        userId: teacher.id,
        revokedAt: IsNull(),
        assignedAt: LessThanOrEqual(new Date()),
      },
      relations: { role: true },
    });
    if (
      teacher.accountStatus !== 'active' ||
      !teacher.emailVerifiedAt ||
      !assignments.some(
        (assignment) =>
          assignment.role?.code === 'instructor' &&
          assignment.scopeType === 'department' &&
          assignment.scopeId === departmentId,
      )
    ) {
      throw new ForbiddenException('Teacher must have an active instructor role in this department');
    }
  }

  private async assertInstructorSectionAccess(
    principal: UserEntity,
    section: AcademicSectionEntity,
  ) {
    const departmentId = section.courseOffering.course.departmentId;
    await this.authorization.assertScopedPermission(principal, {
      permissionCode: 'academic.sections.read',
      roleCodes: ['instructor'],
      scopeType: 'department',
      scopeId: departmentId,
    });
    const assigned = await this.dataSource
      .getRepository(AcademicTeacherSectionAssignmentEntity)
      .findOne({
        where: {
          sectionId: section.id,
          teacherUserId: principal.id,
          status: 'active',
        },
      });
    if (!assigned) {
      throw new ForbiddenException('An active teacher assignment to this section is required');
    }
  }

  private async assertManager(
    principal: UserEntity,
    departmentId: string,
    permissionCode: string,
  ) {
    await this.authorization.assertScopedPermission(principal, {
      permissionCode,
      roleCodes: ADMIN_ROLES,
      scopeType: 'department',
      scopeId: departmentId,
    });
  }

  private async hasManagerRole(
    principal: UserEntity,
    departmentId: string,
    permissionCode: string,
  ): Promise<boolean> {
    try {
      await this.assertManager(principal, departmentId, permissionCode);
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) return false;
      throw error;
    }
  }

  private async hasRoleInInstitution(
    userId: string,
    roleCode: 'student',
    departmentId: string,
    programId: string,
  ) {
    const assignments = await this.dataSource.getRepository(UserRoleAssignmentEntity).find({
      where: {
        userId,
        revokedAt: IsNull(),
        assignedAt: LessThanOrEqual(new Date()),
      },
      relations: { role: true },
    });
    return assignments.some(
      (assignment) =>
        assignment.role?.code === roleCode &&
        ((assignment.scopeType === 'global' && assignment.scopeId === null) ||
          (assignment.scopeType === 'department' && assignment.scopeId === departmentId) ||
          (assignment.scopeType === 'program' && assignment.scopeId === programId)),
    );
  }

  private async currentPlacement(userId: string) {
    return this.dataSource
      .getRepository(AcademicProgramEntity)
      .manager.getRepository(StudentAcademicPlacementEntity)
      .createQueryBuilder('placement')
      .innerJoinAndSelect('placement.program', 'program')
      .innerJoinAndSelect('program.department', 'department')
      .innerJoinAndSelect('department.college', 'college')
      .leftJoinAndSelect('college.university', 'university')
      .innerJoin('program.credentialLevel', 'credentialLevel')
      .where('placement.userId = :userId', { userId })
      .andWhere('placement.effectiveTo IS NULL')
      .andWhere('program.status = :active', { active: 'active' })
      .andWhere('program.deletedAt IS NULL')
      .andWhere('department.status = :active', { active: 'active' })
      .andWhere('department.deletedAt IS NULL')
      .andWhere('college.status = :active', { active: 'active' })
      .andWhere('college.deletedAt IS NULL')
      .andWhere(
        '(college.universityId IS NULL OR (university.status = :active AND university.deletedAt IS NULL))',
        { active: 'active' },
      )
      .andWhere('credentialLevel.status = :active', { active: 'active' })
      .andWhere('credentialLevel.deletedAt IS NULL')
      .getOne();
  }

  private async requireUser(userId: string) {
    const user = await this.dataSource.getRepository(UserEntity).findOne({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async requireOffering(offeringId: string) {
    const offering = await this.dataSource.getRepository(CourseOfferingEntity).findOne({
      where: { id: offeringId },
      relations: {
        course: { department: { college: { university: true } } },
        term: true,
      },
    });
    if (
      !offering ||
      offering.deletedAt ||
      offering.course.status !== 'active' ||
      offering.course.deletedAt ||
      offering.course.department.status !== 'active' ||
      offering.course.department.deletedAt ||
      offering.course.department.college.status !== 'active' ||
      offering.course.department.college.deletedAt ||
      (offering.course.department.college.universityId !== null &&
        (!offering.course.department.college.university ||
          offering.course.department.college.university.status !== 'active' ||
          offering.course.department.college.university.deletedAt)) ||
      offering.term.deletedAt
    ) {
      throw new NotFoundException('Active course offering not found');
    }
    return offering;
  }

  private async requireSection(sectionId: string) {
    const section = await this.dataSource
      .getRepository(AcademicSectionEntity)
      .findOne({
        where: { id: sectionId },
        relations: {
          courseOffering: {
            course: { department: { college: { university: true } } },
            term: true,
          },
        },
      });
    if (!section) throw new NotFoundException('Academic section not found');
    return section;
  }

  private async requireEnrollment(enrollmentId: string) {
    const enrollment = await this.dataSource
      .getRepository(AcademicStudentEnrollmentEntity)
      .findOne({
        where: { id: enrollmentId },
        relations: {
          section: {
            courseOffering: {
              course: { department: { college: { university: true } } },
              term: true,
            },
          },
        },
      });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    return enrollment;
  }

  private sectionQuery() {
    return this.dataSource
      .getRepository(AcademicSectionEntity)
      .createQueryBuilder('section')
      .innerJoinAndSelect('section.courseOffering', 'offering')
      .innerJoinAndSelect('offering.course', 'course')
      .innerJoinAndSelect('course.department', 'department')
      .innerJoinAndSelect('department.college', 'college')
      .leftJoinAndSelect('college.university', 'university')
      .innerJoinAndSelect('offering.term', 'term')
      .andWhere('offering.deletedAt IS NULL')
      .andWhere('course.status = :courseActive', { courseActive: 'active' })
      .andWhere('course.deletedAt IS NULL')
      .andWhere('department.status = :departmentActive', {
        departmentActive: 'active',
      })
      .andWhere('department.deletedAt IS NULL')
      .andWhere('college.status = :collegeActive', { collegeActive: 'active' })
      .andWhere('college.deletedAt IS NULL')
      .andWhere(
        '(college.universityId IS NULL OR (university.status = :universityActive AND university.deletedAt IS NULL))',
        { universityActive: 'active' },
      )
      .andWhere('term.deletedAt IS NULL');
  }

  private applySearch(builder: ReturnType<AcademicOperationsService['sectionQuery']>, search?: string) {
    if (!search) return;
    const pattern = `%${search.replace(/[\\%_]/g, '\\$&')}%`;
    builder.andWhere(
      '(section.code ILIKE :search OR offering.code ILIKE :search OR course.code ILIKE :search OR course.nameAr ILIKE :search OR course.nameEn ILIKE :search)',
      { search: pattern },
    );
  }

  private async lockSection(manager: EntityManager, sectionId: string) {
    return manager
      .getRepository(AcademicSectionEntity)
      .createQueryBuilder('section')
      .leftJoinAndSelect('section.courseOffering', 'courseOffering')
      .leftJoinAndSelect('courseOffering.course', 'course')
      .leftJoinAndSelect('course.department', 'department')
      .leftJoinAndSelect('department.college', 'college')
      .leftJoinAndSelect('college.university', 'university')
      .leftJoinAndSelect('courseOffering.term', 'term')
      .where('section.id = :sectionId', { sectionId })
      .setLock('pessimistic_write', undefined, ['section'])
      .getOne();
  }

  private async lockOffering(manager: EntityManager, offeringId: string) {
    return manager
      .getRepository(CourseOfferingEntity)
      .createQueryBuilder('offering')
      .leftJoinAndSelect('offering.course', 'course')
      .leftJoinAndSelect('course.department', 'department')
      .leftJoinAndSelect('department.college', 'college')
      .leftJoinAndSelect('college.university', 'university')
      .leftJoinAndSelect('offering.term', 'term')
      .where('offering.id = :offeringId', { offeringId })
      .setLock('pessimistic_write', undefined, ['offering'])
      .getOne();
  }

  private async activeEnrollmentCounts(sectionIds: string[]) {
    if (sectionIds.length === 0) return new Map<string, number>();
    const rows = await this.dataSource
      .getRepository(AcademicStudentEnrollmentEntity)
      .createQueryBuilder('enrollment')
      .select('enrollment.sectionId', 'section_id')
      .addSelect('COUNT(*)', 'active_count')
      .where('enrollment.sectionId IN (:...sectionIds)', { sectionIds })
      .andWhere('enrollment.status = :status', { status: ACTIVE_ENROLLMENT })
      .groupBy('enrollment.sectionId')
      .getRawMany<{ section_id: string; active_count: string }>();
    return new Map(rows.map((row) => [row.section_id, Number(row.active_count)]));
  }

  private async countActiveEnrollments(sectionId: string) {
    return this.dataSource.getRepository(AcademicStudentEnrollmentEntity).count({
      where: { sectionId, status: ACTIVE_ENROLLMENT },
    });
  }

  private async activeOfferingEnrollments(studentUserId: string, offeringIds: string[]) {
    if (!offeringIds.length) return new Set<string>();
    const rows = await this.dataSource
      .getRepository(AcademicStudentEnrollmentEntity)
      .createQueryBuilder('enrollment')
      .innerJoin('enrollment.section', 'section')
      .select('DISTINCT section.courseOfferingId', 'offering_id')
      .where('enrollment.studentUserId = :studentUserId', { studentUserId })
      .andWhere('enrollment.status = :status', { status: ACTIVE_ENROLLMENT })
      .andWhere('section.courseOfferingId IN (:...offeringIds)', { offeringIds })
      .getRawMany<{ offering_id: string }>();
    return new Set(rows.map(({ offering_id }) => offering_id));
  }

  private sectionSummary(section: AcademicSectionEntity, activeEnrollmentCount?: number) {
    const offering = section.courseOffering;
    const course = offering.course;
    const term = offering.term;
    return {
      id: section.id,
      courseOfferingId: section.courseOfferingId,
      code: section.code,
      capacity: section.capacity,
      activeEnrollmentCount,
      seatsAvailable:
        activeEnrollmentCount === undefined
          ? undefined
          : Math.max(0, section.capacity - activeEnrollmentCount),
      status: section.status,
      schedule: section.schedule,
      enrollmentOpensAt: section.enrollmentOpensAt?.toISOString() ?? null,
      enrollmentClosesAt: section.enrollmentClosesAt?.toISOString() ?? null,
      course: {
        id: course.id,
        code: course.code,
        nameAr: course.nameAr,
        nameEn: course.nameEn,
        departmentId: course.departmentId,
      },
      term: {
        id: term.id,
        code: term.code,
        nameAr: term.nameAr,
        nameEn: term.nameEn,
        startsOn: term.startsOn,
        endsOn: term.endsOn,
        status: term.status,
      },
    };
  }

  private page<T>(
    data: T[],
    query: Pick<AcademicOperationsQueryDto, 'page' | 'pageSize'>,
    totalItems: number,
  ) {
    const totalPages = Math.ceil(totalItems / query.pageSize);
    return {
      data,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages,
        hasNext: query.page < totalPages,
        hasPrevious: query.page > 1,
      },
    };
  }

  private async audit(
    manager: EntityManager,
    event: {
      sectionId?: string;
      departmentId: string;
      targetUserId?: string;
      actorUserId: string;
      eventType: string;
      details: AcademicOperationAuditDetails;
    },
  ) {
    await manager.getRepository(AcademicOperationAuditEventEntity).insert({
      sectionId: event.sectionId ?? null,
      departmentId: event.departmentId,
      targetUserId: event.targetUserId ?? null,
      actorUserId: event.actorUserId,
      eventType: event.eventType,
      details: event.details,
    });
  }

  private assertOpenForEnrollment(
    section: AcademicSectionEntity,
    offering: CourseOfferingEntity,
  ) {
    if (
      section.status !== 'open' ||
      offering.status !== 'open' ||
      offering.deletedAt ||
      offering.course.status !== 'active' ||
      offering.course.deletedAt ||
      offering.course.department.status !== 'active' ||
      offering.course.department.deletedAt ||
      offering.course.department.college.status !== 'active' ||
      offering.course.department.college.deletedAt ||
      (offering.course.department.college.universityId !== null &&
        (!offering.course.department.college.university ||
          offering.course.department.college.university.status !== 'active' ||
          offering.course.department.college.university.deletedAt)) ||
      offering.term.status === 'cancelled' ||
      offering.term.deletedAt
    ) {
      throw new ConflictException('Section is not open for enrollment');
    }
    this.assertWindowOpen(section);
  }

  private assertWindowOpen(
    section: Pick<AcademicSectionEntity, 'enrollmentOpensAt' | 'enrollmentClosesAt'>,
    now = new Date(),
  ) {
    if (!this.isWindowOpen(section, now)) {
      throw new ConflictException('Enrollment window is not open');
    }
  }

  private isWindowOpen(
    section: Pick<AcademicSectionEntity, 'enrollmentOpensAt' | 'enrollmentClosesAt'>,
    now: Date,
  ) {
    return Boolean(
      section.enrollmentOpensAt &&
        section.enrollmentClosesAt &&
        now >= section.enrollmentOpensAt &&
        now < section.enrollmentClosesAt,
    );
  }

  private assertWindowPair(opensAt?: string | null, closesAt?: string | null) {
    if ((opensAt == null) !== (closesAt == null)) {
      throw new ConflictException('Both enrollment window boundaries must be configured together');
    }
    if (opensAt && closesAt && new Date(closesAt) <= new Date(opensAt)) {
      throw new ConflictException('Enrollment window closing time must be after its opening time');
    }
  }

  private assertSchedule(schedule: AcademicSectionMeeting[]) {
    for (const meeting of schedule) {
      if (meeting.endsAt <= meeting.startsAt) {
        throw new ConflictException('Each meeting must end after it starts on the same day');
      }
    }
  }

  private toDate(value?: string | null) {
    return value == null ? null : new Date(value);
  }

  private assertEnabled() {
    if (!this.config.get<boolean>('academicOperations.enabled', false)) {
      throw new ServiceUnavailableException(
        'Academic operations are disabled until explicitly enabled in this environment',
      );
    }
  }

  private isUniqueViolation(error: unknown) {
    if (typeof error !== 'object' || error === null) return false;
    if ('code' in error && error.code === '23505') return true;
    if ('driverError' in error) {
      const driverError = error.driverError;
      return (
        typeof driverError === 'object' &&
        driverError !== null &&
        'code' in driverError &&
        driverError.code === '23505'
      );
    }
    return false;
  }
}
