import { ConfigService } from '@nestjs/config';
import { DataSource, QueryRunner } from 'typeorm';
import { CreateIdentityFoundation1726920000000 } from '../../database/migrations/1726920000000-CreateIdentityFoundation';
import { CreateAcademicFoundation1793299914088 } from '../../database/migrations/1793299914088-CreateAcademicFoundation';
import { AddUniversityCatalog1793362429913 } from '../../database/migrations/1793362429913-AddUniversityCatalog';
import { CreateAcademicOperations1793618000000 } from '../../database/migrations/1793618000000-CreateAcademicOperations';
import {
  ACADEMIC_ENTITIES,
  AcademicProgramEntity,
  AcademicTermEntity,
  CourseOfferingEntity,
  DepartmentEntity,
  StudentAcademicPlacementEntity,
} from './infrastructure/persistence/academic-catalog.entity';
import {
  ACADEMIC_OPERATIONS_ENTITIES,
  AcademicSectionEntity,
  AcademicStudentEnrollmentEntity,
  AcademicTeacherSectionAssignmentEntity,
} from './infrastructure/persistence/academic-operations.entity';
import { UserEntity } from '../identity/infrastructure/persistence/entities/user.entity';
import { UserRoleAssignmentEntity } from '../identity/infrastructure/persistence/entities/user-role-assignment.entity';
import { RolePermissionEntity } from '../identity/infrastructure/persistence/entities/role-permission.entity';
import { RoleEntity } from '../identity/infrastructure/persistence/entities/role.entity';
import { PermissionEntity } from '../identity/infrastructure/persistence/entities/permission.entity';
import { AcademicAuthorizationService } from './application/academic-authorization.service';
import { AcademicOperationsService } from './application/academic-operations.service';
import { AcademicOperationsQueryDto } from './presentation/dto/academic-operations.dto';

const databaseUrl = process.env.ACADEMIC_OPERATIONS_TEST_DATABASE_URL;
if (databaseUrl) {
  const parsedUrl = new URL(databaseUrl);
  if (
    !new Set(['localhost', '127.0.0.1', '::1', '[::1]']).has(parsedUrl.hostname) ||
    parsedUrl.pathname !== '/naba_academic_operations_test' ||
    process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'staging'
  ) {
    throw new Error(
      'Academic operations integration tests require the isolated local naba_academic_operations_test database.',
    );
  }
}

const describeIfLocalDatabase = databaseUrl ? describe : describe.skip;

describeIfLocalDatabase('Academic operations (isolated PostgreSQL)', () => {
  jest.setTimeout(30000);

  let migrationDataSource: DataSource;
  let metadataDataSource: DataSource;
  let queryRunner: QueryRunner;
  let identityApplied = false;
  let academicApplied = false;
  let universityApplied = false;
  let operationsApplied = false;
  let service: AcademicOperationsService;
  let admin: UserEntity;
  let teacher: UserEntity;
  let unassignedTeacher: UserEntity;
  let studentA: UserEntity;
  let studentB: UserEntity;
  let departmentId: string;
  let programId: string;
  let offeringId: string;
  let secondOfferingId: string;

  const identityMigration = new CreateIdentityFoundation1726920000000();
  const academicMigration = new CreateAcademicFoundation1793299914088();
  const universityMigration = new AddUniversityCatalog1793362429913();
  const operationsMigration = new CreateAcademicOperations1793618000000();

  beforeAll(async () => {
    migrationDataSource = new DataSource({
      type: 'postgres',
      url: databaseUrl,
      ssl: false,
      synchronize: false,
      dropSchema: false,
      logging: false,
    });
    await migrationDataSource.initialize();
    queryRunner = migrationDataSource.createQueryRunner();
    await queryRunner.connect();
    const [existing] = (await queryRunner.query(`
      SELECT to_regclass('public.users') AS "users",
             to_regclass('public.academic_sections') AS "sections"
    `)) as Array<{ users: string | null; sections: string | null }>;
    if (existing.users || existing.sections) {
      throw new Error('The isolated academic operations database must be empty before the test runs.');
    }

    await identityMigration.up(queryRunner);
    identityApplied = true;
    await academicMigration.up(queryRunner);
    academicApplied = true;
    await universityMigration.up(queryRunner);
    universityApplied = true;
    await operationsMigration.up(queryRunner);
    operationsApplied = true;

    metadataDataSource = new DataSource({
      type: 'postgres',
      url: databaseUrl,
      ssl: false,
      synchronize: false,
      dropSchema: false,
      logging: false,
      entities: [
        UserEntity,
        RoleEntity,
        PermissionEntity,
        UserRoleAssignmentEntity,
        RolePermissionEntity,
        ...ACADEMIC_ENTITIES,
        ...ACADEMIC_OPERATIONS_ENTITIES,
      ],
    });
    await metadataDataSource.initialize();

    const userIds = {
      admin: '00000000-0000-4000-8000-000000000001',
      teacher: '00000000-0000-4000-8000-000000000002',
      unassignedTeacher: '00000000-0000-4000-8000-000000000003',
      studentA: '00000000-0000-4000-8000-000000000004',
      studentB: '00000000-0000-4000-8000-000000000005',
    };
    const users = [
      [userIds.admin, 'Admin'],
      [userIds.teacher, 'Teacher'],
      [userIds.unassignedTeacher, 'Unassigned Teacher'],
      [userIds.studentA, 'Student A'],
      [userIds.studentB, 'Student B'],
    ];
    for (const [index, [id, name]] of users.entries()) {
      await queryRunner.query(
        `INSERT INTO "users"
          ("id", "national_id", "name_ar", "name_en", "email", "normalized_email",
           "password_hash", "account_status", "email_verified_at")
         VALUES ($1, $2, $3, $4, $5, $5, 'synthetic-test-hash', 'active', now())`,
        [id, `OPS${index}`, `مستخدم ${index}`, name, `${name.toLowerCase().replaceAll(' ', '.')}@example.test`],
      );
    }

    const [university] = (await queryRunner.query(
      `INSERT INTO "universities" ("code", "name_ar", "name_en") VALUES ('OPS-UNI', 'جامعة اختبار', 'Operations University') RETURNING "id"`,
    )) as Array<{ id: string }>;
    const [college] = (await queryRunner.query(
      `INSERT INTO "colleges" ("university_id", "code", "name_ar", "name_en") VALUES ($1, 'OPS-COL', 'كلية اختبار', 'Operations College') RETURNING "id"`,
      [university.id],
    )) as Array<{ id: string }>;
    const [department] = (await queryRunner.query(
      `INSERT INTO "departments" ("college_id", "code", "name_ar", "name_en") VALUES ($1, 'OPS-DEP', 'قسم اختبار', 'Operations Department') RETURNING "id"`,
      [college.id],
    )) as Array<{ id: string }>;
    departmentId = department.id;
    const [secondDepartment] = (await queryRunner.query(
      `INSERT INTO "departments" ("college_id", "code", "name_ar", "name_en") VALUES ($1, 'OPS-DEP2', 'قسم ثان', 'Other Department') RETURNING "id"`,
      [college.id],
    )) as Array<{ id: string }>;
    const [credential] = (await queryRunner.query(
      `INSERT INTO "credential_levels" ("code", "name_ar", "name_en") VALUES ('OPS-LEVEL', 'بكالوريوس', 'Bachelor') RETURNING "id"`,
    )) as Array<{ id: string }>;
    const [program] = (await queryRunner.query(
      `INSERT INTO "academic_programs" ("department_id", "credential_level_id", "code", "name_ar", "name_en") VALUES ($1, $2, 'OPS-PROG', 'برنامج', 'Operations Program') RETURNING "id"`,
      [department.id, credential.id],
    )) as Array<{ id: string }>;
    programId = program.id;
    const [term] = (await queryRunner.query(
      `INSERT INTO "academic_terms" ("code", "name_ar", "name_en", "starts_on", "ends_on", "status") VALUES ('OPS-TERM', 'فصل الاختبار', 'Operations Term', '2026-01-01', '2027-01-01', 'active') RETURNING "id"`,
    )) as Array<{ id: string }>;
    const [course] = (await queryRunner.query(
      `INSERT INTO "courses" ("department_id", "code", "name_ar", "name_en") VALUES ($1, 'OPS-COURSE', 'مقرر', 'Operations Course') RETURNING "id"`,
      [department.id],
    )) as Array<{ id: string }>;
    const [offering] = (await queryRunner.query(
      `INSERT INTO "course_offerings" ("course_id", "academic_term_id", "code", "status") VALUES ($1, $2, 'OPS-OFFERING', 'open') RETURNING "id"`,
      [course.id, term.id],
    )) as Array<{ id: string }>;
    offeringId = offering.id;
    const [secondCourse] = (await queryRunner.query(
      `INSERT INTO "courses" ("department_id", "code", "name_ar", "name_en") VALUES ($1, 'OPS-COURSE2', 'مقرر آخر', 'Other Course') RETURNING "id"`,
      [secondDepartment.id],
    )) as Array<{ id: string }>;
    const [secondOffering] = (await queryRunner.query(
      `INSERT INTO "course_offerings" ("course_id", "academic_term_id", "code", "status") VALUES ($1, $2, 'OPS-OFFERING2', 'open') RETURNING "id"`,
      [secondCourse.id, term.id],
    )) as Array<{ id: string }>;
    secondOfferingId = secondOffering.id;

    await queryRunner.query(
      `INSERT INTO "student_academic_placements" ("user_id", "academic_program_id", "effective_from")
       VALUES ($1, $2, '2026-01-01'), ($3, $2, '2026-01-01')`,
      [userIds.studentA, programId, userIds.studentB],
    );
    await queryRunner.query(`
      INSERT INTO "permissions" ("code", "name_ar", "name_en") VALUES
        ('academic.sections.manage', 'إدارة الشعب', 'Manage sections'),
        ('academic.teacher_assignments.manage', 'إدارة التعيينات', 'Manage teacher assignments'),
        ('academic.enrollments.manage', 'إدارة التسجيل', 'Manage enrollments'),
        ('academic.sections.read', 'قراءة الشعب', 'Read assigned sections')
    `);
    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT role."id", permission."id"
      FROM "roles" role CROSS JOIN "permissions" permission
      WHERE role."code" = 'department_head'
        AND permission."code" IN (
          'academic.sections.manage',
          'academic.teacher_assignments.manage',
          'academic.enrollments.manage'
        )
    `);
    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT role."id", permission."id"
      FROM "roles" role CROSS JOIN "permissions" permission
      WHERE role."code" = 'instructor'
        AND permission."code" = 'academic.sections.read'
    `);
    await queryRunner.query(`
      INSERT INTO "user_role_assignments" ("user_id", "role_id", "scope_type", "scope_id")
      SELECT $1, role."id", 'department', $2 FROM "roles" role WHERE role."code" = 'department_head';
    `, [userIds.admin, departmentId]);
    await queryRunner.query(`
      INSERT INTO "user_role_assignments" ("user_id", "role_id", "scope_type", "scope_id")
      SELECT users."id", role."id", 'department', $1
      FROM (VALUES ($2::uuid), ($3::uuid)) users("id")
      CROSS JOIN "roles" role WHERE role."code" = 'instructor';
    `, [departmentId, userIds.teacher, userIds.unassignedTeacher]);
    await queryRunner.query(`
      INSERT INTO "user_role_assignments" ("user_id", "role_id", "scope_type", "scope_id")
      SELECT users."id", role."id", 'global', NULL
      FROM (VALUES ($1::uuid), ($2::uuid)) users("id")
      CROSS JOIN "roles" role WHERE role."code" = 'student';
    `, [userIds.studentA, userIds.studentB]);

    admin = (await metadataDataSource.getRepository(UserEntity).findOneByOrFail({ id: userIds.admin }));
    teacher = (await metadataDataSource.getRepository(UserEntity).findOneByOrFail({ id: userIds.teacher }));
    unassignedTeacher = (await metadataDataSource.getRepository(UserEntity).findOneByOrFail({ id: userIds.unassignedTeacher }));
    studentA = (await metadataDataSource.getRepository(UserEntity).findOneByOrFail({ id: userIds.studentA }));
    studentB = (await metadataDataSource.getRepository(UserEntity).findOneByOrFail({ id: userIds.studentB }));

    const authorization = new AcademicAuthorizationService(
      metadataDataSource.getRepository(UserRoleAssignmentEntity),
      metadataDataSource.getRepository(RolePermissionEntity),
      metadataDataSource.getRepository(DepartmentEntity),
      metadataDataSource.getRepository(AcademicProgramEntity),
      metadataDataSource.getRepository(CourseOfferingEntity),
    );
    service = new AcademicOperationsService(
      new ConfigService({ academicOperations: { enabled: true } }),
      metadataDataSource,
      authorization,
    );
  });

  afterAll(async () => {
    if (queryRunner && !queryRunner.isReleased) {
      if (operationsApplied) {
        await queryRunner.query(`DELETE FROM "academic_operation_audit_events"`);
        await queryRunner.query(`DELETE FROM "academic_student_enrollments"`);
        await queryRunner.query(`DELETE FROM "academic_teacher_section_assignments"`);
        await queryRunner.query(`DELETE FROM "academic_sections"`);
        await operationsMigration.down(queryRunner);
        operationsApplied = false;
      }
      if (academicApplied) {
        for (const table of [
          'course_offerings',
          'courses',
          'academic_terms',
          'student_academic_placements',
          'academic_programs',
          'credential_levels',
          'departments',
          'colleges',
        ]) {
          await queryRunner.query(`DELETE FROM "${table}"`);
        }
        await queryRunner.query(`DELETE FROM "universities"`);
        if (universityApplied) {
          await universityMigration.down(queryRunner);
          universityApplied = false;
        }
        await academicMigration.down(queryRunner);
        academicApplied = false;
      }
      if (identityApplied) {
        await queryRunner.query(`DELETE FROM "user_role_assignments"`);
        await queryRunner.query(`DELETE FROM "role_permissions"`);
        await queryRunner.query(`DELETE FROM "permissions"`);
        await queryRunner.query(`DELETE FROM "users"`);
        await identityMigration.down(queryRunner);
        identityApplied = false;
      }
    }
    if (metadataDataSource?.isInitialized) await metadataDataSource.destroy();
    if (queryRunner && !queryRunner.isReleased) await queryRunner.release();
    if (migrationDataSource?.isInitialized) await migrationDataSource.destroy();
  });

  it('enforces department and section ownership, atomic capacity, history, and enrollment windows', async () => {
    const window = {
      enrollmentOpensAt: new Date(Date.now() - 60_000).toISOString(),
      enrollmentClosesAt: new Date(Date.now() + 3_600_000).toISOString(),
    };
    const section = await service.createSection(
      {
        courseOfferingId: offeringId,
        code: 'OPS-SEC-1',
        capacity: 1,
        schedule: [],
        ...window,
      },
      admin,
    );
    await service.setSectionStatus(section.id, 'open', admin);
    await expect(
      service.updateSection(section.id, { enrollmentOpensAt: null }, admin),
    ).rejects.toThrow('Both enrollment window boundaries must be configured together');
    const updatedWindow = {
      enrollmentOpensAt: new Date(Date.now() - 120_000).toISOString(),
    };
    await expect(service.updateSection(section.id, updatedWindow, admin)).resolves.toMatchObject({
      enrollmentOpensAt: updatedWindow.enrollmentOpensAt,
      enrollmentClosesAt: window.enrollmentClosesAt,
    });
    await service.assignTeacher(section.id, teacher.id, admin);
    await expect(service.assignTeacher(section.id, teacher.id, admin)).rejects.toThrow(
      'already assigned',
    );
    await expect(
      service.listEnrolledStudents(section.id, new AcademicOperationsQueryDto(), unassignedTeacher),
    ).rejects.toThrow('active teacher assignment');
    await expect(
      service.createSection(
        {
          courseOfferingId: secondOfferingId,
          code: 'CROSS-DEPARTMENT',
          capacity: 2,
          schedule: [],
        },
        admin,
      ),
    ).rejects.toThrow();

    const assigned = await service.listMySections(new AcademicOperationsQueryDto(), teacher);
    expect(assigned.data.map(({ id }) => id)).toContain(section.id);
    await service.unassignTeacher(section.id, teacher.id, admin);
    await expect(service.getSection(section.id, teacher)).rejects.toThrow(
      'active teacher assignment',
    );
    await service.assignTeacher(section.id, teacher.id, admin);
    await queryRunner.query(
      `UPDATE "user_role_assignments" SET "revoked_at" = now()
       WHERE "user_id" = $1 AND "scope_type" = 'department' AND "scope_id" = $2`,
      [teacher.id, departmentId],
    );
    await expect(service.getSection(section.id, teacher)).rejects.toThrow();

    const attempts = await Promise.allSettled([
      service.enrollStudent(section.id, studentA),
      service.enrollStudent(section.id, studentB),
    ]);
    const winners = attempts.flatMap((result, index) =>
      result.status === 'fulfilled'
        ? [{ user: index === 0 ? studentA : studentB, result: result.value }]
        : [],
    );
    const losers = attempts.flatMap((result, index) =>
      result.status === 'rejected'
        ? [index === 0 ? studentA : studentB]
        : [],
    );
    if (winners.length !== 1 || losers.length !== 1) {
      throw new Error(
        `Expected one successful enrollment and one capacity rejection; received ${attempts
          .map((result) =>
            result.status === 'fulfilled' ? 'fulfilled' : result.reason.message,
          )
          .join('; ')}`,
      );
    }
    expect(winners).toHaveLength(1);
    expect(losers).toHaveLength(1);
    const [activeCount] = (await queryRunner.query(
      `SELECT count(*)::int AS "count" FROM "academic_student_enrollments"
       WHERE "section_id" = $1 AND "status" = 'active'`,
      [section.id],
    )) as Array<{ count: number }>;
    expect(activeCount.count).toBe(1);

    await expect(
      service.enrollStudent(section.id, winners[0].user),
    ).rejects.toThrow();
    await expect(
      service.cancelMyEnrollment(winners[0].result.enrollmentId, undefined, losers[0]),
    ).rejects.toThrow();
    const secondSection = await service.createSection(
      {
        courseOfferingId: offeringId,
        code: 'OPS-SEC-2',
        capacity: 1,
        schedule: [],
        ...window,
      },
      admin,
    );
    await service.setSectionStatus(secondSection.id, 'open', admin);
    await expect(service.enrollStudent(secondSection.id, winners[0].user)).rejects.toThrow(
      'another section of this offering',
    );

    await service.cancelMyEnrollment(winners[0].result.enrollmentId, 'synthetic cancellation', winners[0].user);
    const reenrollment = await service.enrollStudent(section.id, winners[0].user);
    expect(reenrollment.enrollmentId).not.toBe(winners[0].result.enrollmentId);
    await expect(
      service.updateSection(
        section.id,
        {
          enrollmentOpensAt: new Date(Date.now() - 3_600_000).toISOString(),
          enrollmentClosesAt: new Date(Date.now() - 1_000).toISOString(),
        },
        admin,
      ),
    ).resolves.toMatchObject({ status: 'open' });
    await expect(service.cancelMyEnrollment(reenrollment.enrollmentId, undefined, winners[0].user))
      .rejects.toThrow('Enrollment window is not open');

    await expect(
      queryRunner.query(
        `INSERT INTO "academic_sections"
          ("course_offering_id", "code", "capacity", "created_by_user_id", "updated_by_user_id")
         VALUES ($1, 'INVALID-CAPACITY', 0, $2, $2)`,
        [offeringId, admin.id],
      ),
    ).rejects.toThrow();
    const [auditCount] = (await queryRunner.query(
      `SELECT count(*)::int AS "count" FROM "academic_operation_audit_events"`,
    )) as Array<{ count: number }>;
    expect(auditCount.count).toBeGreaterThanOrEqual(7);
    expect(programId).toBeTruthy();
  });
});
