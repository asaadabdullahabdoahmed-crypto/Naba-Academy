import { DataSource, QueryRunner } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { TransformResponseInterceptor } from '../../common/interceptors/transform-response.interceptor';
import { CreateIdentityFoundation1726920000000 } from '../../database/migrations/1726920000000-CreateIdentityFoundation';
import { CreateAcademicFoundation1793299914088 } from '../../database/migrations/1793299914088-CreateAcademicFoundation';
import { AddUniversityCatalog1793362429913 } from '../../database/migrations/1793362429913-AddUniversityCatalog';
import {
  ACADEMIC_ENTITIES,
  AcademicProgramEntity,
  CollegeEntity,
  CredentialLevelEntity,
  DepartmentEntity,
  StudentAcademicPlacementEntity,
  UniversityEntity,
} from './infrastructure/persistence/academic-catalog.entity';
import { UserEntity } from '../identity/infrastructure/persistence/entities/user.entity';
import { AcademicCatalogService } from './application/academic-catalog.service';
import { AcademicAuthorizationService } from './application/academic-authorization.service';
import { AcademicCatalogQueryDto } from './presentation/dto/academic-catalog-query.dto';
import { AcademicCatalogController } from './presentation/controllers/academic-catalog.controller';
import { StudentAcademicProfileController } from './student-academic-profile.controller';
import { SessionAuthGuard } from '../identity/presentation/guards/session-auth.guard';
import { RolesGuard } from '../identity/presentation/guards/roles.guard';

const databaseUrl = process.env.ACADEMIC_TEST_DATABASE_URL;

if (databaseUrl) {
  const parsedUrl = new URL(databaseUrl);
  const localHosts = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);
  if (
    !localHosts.has(parsedUrl.hostname) ||
    parsedUrl.pathname !== '/naba_academic_test' ||
    process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'staging'
  ) {
    throw new Error(
      'Academic migration integration tests require the isolated local naba_academic_test database.',
    );
  }
}

const describeIfLocalDatabase = databaseUrl ? describe : describe.skip;

describeIfLocalDatabase('Academic foundation migration (isolated PostgreSQL)', () => {
  jest.setTimeout(30000);

  let dataSource: DataSource;
  let metadataDataSource: DataSource;
  let queryRunner: QueryRunner;
  let migrationApplied = false;
  let identityMigrationApplied = false;
  let universityMigrationApplied = false;
  let fixtureIds: {
    userId: string;
    universityId: string;
    collegeId: string;
    departmentId: string;
    programId: string;
  } | null = null;
  const migration = new CreateAcademicFoundation1793299914088();
  const identityMigration = new CreateIdentityFoundation1726920000000();
  const universityMigration = new AddUniversityCatalog1793362429913();

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      url: databaseUrl,
      ssl: false,
      synchronize: false,
      dropSchema: false,
      logging: false,
    });
    await dataSource.initialize();
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    const [existing] = (await queryRunner.query(`
      SELECT
        to_regclass('public.users') AS "users",
        to_regclass('public.universities') AS "universities",
        to_regclass('public.colleges') AS "colleges",
        to_regclass('public.departments') AS "departments",
        to_regclass('public.academic_programs') AS "programs"
    `)) as Array<Record<string, string | null>>;
    if (Object.values(existing).some(Boolean)) {
      throw new Error('The isolated academic test database must be empty before the test runs.');
    }

    await identityMigration.up(queryRunner);
    identityMigrationApplied = true;
    await queryRunner.query(`
      INSERT INTO "users"
        ("id", "national_id", "name_ar", "name_en", "email", "normalized_email",
         "password_hash", "department_id", "department_ar", "department_en", "college_ar", "college_en")
      VALUES
        ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '1234567890', 'طالب تجريبي', 'Synthetic Student',
         'student@example.test', 'student@example.test', 'synthetic-test-hash',
         'legacy-dept', 'قسم قديم', 'Legacy Department', 'كلية قديمة', 'Legacy College')
    `);
    await migration.up(queryRunner);
    migrationApplied = true;
    await universityMigration.up(queryRunner);
    universityMigrationApplied = true;

    metadataDataSource = new DataSource({
      type: 'postgres',
      url: databaseUrl,
      ssl: false,
      synchronize: false,
      dropSchema: false,
      logging: false,
      entities: [UserEntity, ...ACADEMIC_ENTITIES],
    });
    await metadataDataSource.initialize();
  });

  afterAll(async () => {
    if (migrationApplied && queryRunner?.isReleased === false) {
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
      await queryRunner.query(`DELETE FROM "users"`);
      await universityMigration.down(queryRunner);
      universityMigrationApplied = false;
      await migration.down(queryRunner);
      migrationApplied = false;
    }
    if (identityMigrationApplied && queryRunner?.isReleased === false) {
      await identityMigration.down(queryRunner);
      identityMigrationApplied = false;
    }
    if (metadataDataSource?.isInitialized) await metadataDataSource.destroy();
    if (queryRunner && !queryRunner.isReleased) await queryRunner.release();
    if (dataSource?.isInitialized) await dataSource.destroy();
  });

  it('creates valid TypeORM metadata and an empty catalog without modifying legacy user columns', async () => {
    const [tableInfo] = (await queryRunner.query(`
      SELECT count(*)::int AS "count"
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN (
          'universities', 'colleges', 'departments', 'credential_levels', 'academic_programs',
          'student_academic_placements', 'academic_terms', 'courses', 'course_offerings'
        )
    `)) as Array<{ count: number }>;
    const userColumns = (await queryRunner.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name IN ('department_id', 'department_ar', 'department_en', 'college_ar', 'college_en')
      ORDER BY column_name
    `)) as Array<{ column_name: string }>;
    const [catalogRows] = (await queryRunner.query(`
      SELECT
        (SELECT count(*) FROM "colleges") +
        (SELECT count(*) FROM "departments") +
        (SELECT count(*) FROM "credential_levels") +
        (SELECT count(*) FROM "academic_programs") AS "count"
    `)) as Array<{ count: string }>;

    expect(tableInfo.count).toBe(9);
    expect(userColumns.map(({ column_name }) => column_name)).toEqual([
      'college_ar',
      'college_en',
      'department_ar',
      'department_en',
      'department_id',
    ]);
    expect(Number(catalogRows.count)).toBe(0);
    const [legacyUser] = (await queryRunner.query(`
      SELECT "department_id", "department_ar", "department_en", "college_ar", "college_en"
      FROM "users"
      WHERE "id" = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
    `)) as Array<Record<string, string>>;
    expect(legacyUser).toEqual({
      department_id: 'legacy-dept',
      department_ar: 'قسم قديم',
      department_en: 'Legacy Department',
      college_ar: 'كلية قديمة',
      college_en: 'Legacy College',
    });
    expect(metadataDataSource.entityMetadatas).toHaveLength(ACADEMIC_ENTITIES.length + 1);
  });

  it('enforces stable codes, foreign keys, historical placements, and course/term separation', async () => {
    const firstUserId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const secondUserId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    await queryRunner.query(
      `INSERT INTO "users"
        ("id", "national_id", "name_ar", "name_en", "email", "normalized_email", "password_hash")
      VALUES
        ($1, '1234567891', 'طالب اختبار 1', 'Synthetic Student 1', 'student1@example.test', 'student1@example.test', 'synthetic-test-hash'),
        ($2, '1234567892', 'طالب اختبار 2', 'Synthetic Student 2', 'student2@example.test', 'student2@example.test', 'synthetic-test-hash')`,
      [firstUserId, secondUserId],
    );

    const [university] = (await queryRunner.query(
      `INSERT INTO "universities" ("code", "name_ar", "name_en") VALUES ('UNI', 'جامعة اختبار', 'Test University') RETURNING "id"`,
    )) as Array<{ id: string }>;
    await expect(
      queryRunner.query(
        `INSERT INTO "universities" ("code", "name_ar", "name_en") VALUES ('uni', 'مكرر', 'Duplicate')`,
      ),
    ).rejects.toThrow();

    const [college] = (await queryRunner.query(
      `INSERT INTO "colleges" ("university_id", "code", "name_ar", "name_en") VALUES ($1, 'COL', 'كلية اختبار', 'Test College') RETURNING "id"`,
      [university.id],
    )) as Array<{ id: string }>;
    const [inactiveUniversity] = (await queryRunner.query(
      `INSERT INTO "universities" ("code", "name_ar", "name_en", "status") VALUES ('UNI-OLD', 'جامعة سابقة', 'Former University', 'inactive') RETURNING "id"`,
    )) as Array<{ id: string }>;
    const [inactiveUniversityCollege] = (await queryRunner.query(
      `INSERT INTO "colleges" ("university_id", "code", "name_ar", "name_en") VALUES ($1, 'COL-OLD', 'كلية سابقة', 'Former University College') RETURNING "id"`,
      [inactiveUniversity.id],
    )) as Array<{ id: string }>;
    await expect(
      queryRunner.query(
        `INSERT INTO "colleges" ("code", "name_ar", "name_en") VALUES ('col', 'مكرر', 'Duplicate')`,
      ),
    ).rejects.toThrow();

    const [department] = (await queryRunner.query(
      `INSERT INTO "departments" ("college_id", "code", "name_ar", "name_en") VALUES ($1, 'DEP', 'قسم اختبار', 'Test Department') RETURNING "id"`,
      [college.id],
    )) as Array<{ id: string }>;
    const [credentialLevel] = (await queryRunner.query(
      `INSERT INTO "credential_levels" ("code", "name_ar", "name_en") VALUES ('LEVEL', 'مستوى اختبار', 'Test Level') RETURNING "id"`,
    )) as Array<{ id: string }>;
    const [program] = (await queryRunner.query(
      `INSERT INTO "academic_programs" ("department_id", "credential_level_id", "code", "name_ar", "name_en") VALUES ($1, $2, 'PATH', 'مسار اختبار', 'Test Pathway') RETURNING "id"`,
      [department.id, credentialLevel.id],
    )) as Array<{ id: string }>;
    fixtureIds = {
      userId: firstUserId,
      universityId: university.id,
      collegeId: college.id,
      departmentId: department.id,
      programId: program.id,
    };
    const [term] = (await queryRunner.query(
      `INSERT INTO "academic_terms" ("code", "name_ar", "name_en", "starts_on", "ends_on") VALUES ('TERM', 'فصل اختبار', 'Test Term', '2026-01-01', '2026-06-30') RETURNING "id"`,
    )) as Array<{ id: string }>;
    const [course] = (await queryRunner.query(
      `INSERT INTO "courses" ("department_id", "code", "name_ar", "name_en") VALUES ($1, 'COURSE', 'مقرر اختبار', 'Test Course') RETURNING "id"`,
      [department.id],
    )) as Array<{ id: string }>;
    await queryRunner.query(
      `INSERT INTO "course_offerings" ("course_id", "academic_term_id", "code") VALUES ($1, $2, '01')`,
      [course.id, term.id],
    );

    const catalog = new AcademicCatalogService(
      new ConfigService({ academicCatalog: { readsEnabled: true } }),
      metadataDataSource.getRepository(CollegeEntity),
      metadataDataSource.getRepository(DepartmentEntity),
      metadataDataSource.getRepository(AcademicProgramEntity),
      metadataDataSource.getRepository(CredentialLevelEntity),
      metadataDataSource.getRepository(UniversityEntity),
      metadataDataSource.getRepository(StudentAcademicPlacementEntity),
    );
    const page = new AcademicCatalogQueryDto();
    const collegePage = await catalog.listColleges(page);
    const departmentPage = await catalog.listDepartments(college.id, page);
    const programPage = await catalog.listPrograms(department.id, page);
    const credentialPage = await catalog.listCredentialLevels(page);
    const universityPage = await catalog.listUniversities(page);
    const filteredCollegePage = await catalog.listColleges(
      Object.assign(new AcademicCatalogQueryDto(), { universityId: university.id }),
    );
    expect(collegePage.data[0]?.id).toBe(college.id);
    expect(collegePage.data.map(({ id }) => id)).not.toContain(inactiveUniversityCollege.id);
    expect(collegePage.data[0]?.universityId).toBe(university.id);
    expect(universityPage.data[0]?.id).toBe(university.id);
    expect(filteredCollegePage.data.map(({ id }) => id)).toEqual([college.id]);
    await expect(
      catalog.listColleges(
        Object.assign(new AcademicCatalogQueryDto(), {
          universityId: inactiveUniversity.id,
        }),
      ),
    ).rejects.toThrow('University not found');
    await expect(catalog.getUniversity(university.id)).resolves.toMatchObject({
      code: 'UNI',
    });
    await expect(catalog.getCollege(college.id)).resolves.toMatchObject({
      university: { id: university.id },
    });
    expect(departmentPage.data[0]?.collegeId).toBe(college.id);
    expect(programPage.data[0]?.credentialLevel.id).toBe(credentialLevel.id);
    await expect(catalog.getDepartment(department.id)).resolves.toMatchObject({
      college: { university: { id: university.id } },
    });
    expect(credentialPage.data[0]?.id).toBe(credentialLevel.id);

    await queryRunner.query(
      `UPDATE "colleges" SET "status" = 'inactive' WHERE "id" = $1`,
      [college.id],
    );
    await queryRunner.query(
      `UPDATE "departments" SET "status" = 'inactive' WHERE "id" = $1`,
      [department.id],
    );
    await queryRunner.query(
      `UPDATE "academic_programs" SET "status" = 'inactive' WHERE "id" = $1`,
      [program.id],
    );
    await queryRunner.query(
      `UPDATE "credential_levels" SET "status" = 'inactive' WHERE "id" = $1`,
      [credentialLevel.id],
    );
    await expect(catalog.getProgram(program.id)).resolves.toMatchObject({
      status: 'inactive',
      credentialLevel: { status: 'inactive' },
      department: {
        status: 'inactive',
        college: { status: 'inactive' },
      },
    });

    await queryRunner.query(
      `INSERT INTO "student_academic_placements" ("user_id", "academic_program_id", "effective_from", "effective_to") VALUES ($1, $2, '2024-01-01', '2025-01-01')`,
      [firstUserId, program.id],
    );
    await queryRunner.query(
      `INSERT INTO "student_academic_placements" ("user_id", "academic_program_id", "effective_from") VALUES ($1, $2, '2025-01-01')`,
      [firstUserId, program.id],
    );
    await expect(catalog.getCurrentPlacement(firstUserId)).resolves.toMatchObject({
      current: {
        program: {
          department: {
            college: {
              university: { id: university.id },
            },
          },
        },
      },
    });
    await expect(
      queryRunner.query(
        `INSERT INTO "student_academic_placements" ("user_id", "academic_program_id", "effective_from") VALUES ($1, $2, '2026-01-01')`,
        [firstUserId, program.id],
      ),
    ).rejects.toThrow();
    await expect(
      queryRunner.query(`DELETE FROM "academic_programs" WHERE "id" = $1`, [program.id]),
    ).rejects.toThrow();

    await queryRunner.query(
      `INSERT INTO "student_academic_placements" ("user_id", "academic_program_id", "effective_from") VALUES ($1, $2, '2025-01-01')`,
      [secondUserId, program.id],
    );
    const [placementCount] = (await queryRunner.query(
      `SELECT count(*)::int AS "count" FROM "student_academic_placements"`,
    )) as Array<{ count: number }>;
    const [offeringCount] = (await queryRunner.query(
      `SELECT count(*)::int AS "count" FROM "course_offerings" WHERE "course_id" = $1 AND "academic_term_id" = $2`,
      [course.id, term.id],
    )) as Array<{ count: number }>;
    expect(placementCount.count).toBe(3);
    expect(offeringCount.count).toBe(1);
  });

  it('serves real hierarchy and authenticated own-placement reads over HTTP', async () => {
    if (!fixtureIds) throw new Error('Academic database fixtures were not created.');
    const moduleBuilder = Test.createTestingModule({
      controllers: [AcademicCatalogController, StudentAcademicProfileController],
      providers: [
        AcademicCatalogService,
        {
          provide: AcademicAuthorizationService,
          useValue: { assertStudentOwns: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: ConfigService,
          useValue: new ConfigService({
            academicCatalog: { readsEnabled: true },
          }),
        },
        ...ACADEMIC_ENTITIES.map((entity) => ({
          provide: getRepositoryToken(entity),
          useValue: metadataDataSource.getRepository(entity),
        })),
      ],
    });
    const moduleRef = await moduleBuilder
      .overrideGuard(SessionAuthGuard)
      .useValue({
        canActivate: (context: {
          switchToHttp: () => { getRequest: () => { user?: { id: string } } };
        }) => {
          context.switchToHttp().getRequest().user = { id: fixtureIds?.userId ?? '' };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    const app: INestApplication = moduleRef.createNestApplication();
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

    try {
      const university = await request(app.getHttpServer())
        .get(`/api/v1/academic/universities/${fixtureIds.universityId}`)
        .expect(200);
      expect(university.body.data.id).toBe(fixtureIds.universityId);

      const college = await request(app.getHttpServer())
        .get(`/api/v1/academic/colleges/${fixtureIds.collegeId}`)
        .expect(200);
      expect(college.body.data.university.id).toBe(fixtureIds.universityId);

      const placement = await request(app.getHttpServer())
        .get('/api/v1/students/me/academic-placement')
        .expect(200);
      expect(placement.headers['cache-control']).toBe('no-store');
      expect(placement.body.data.current.program.department.college.university.id).toBe(
        fixtureIds.universityId,
      );

      await request(app.getHttpServer())
        .get('/api/v1/academic/universities/not-a-uuid')
        .expect(400);
    } finally {
      await app.close();
    }
  });

  it('refuses rollback while academic data exists', async () => {
    await expect(universityMigration.down(queryRunner)).rejects.toThrow(
      /Refusing to remove university catalog data/,
    );
    await expect(migration.down(queryRunner)).rejects.toThrow(
      /academic data exists/,
    );
    const [table] = (await queryRunner.query(
      `SELECT to_regclass('public.colleges') AS "table"`,
    )) as Array<{ table: string | null }>;
    expect(table.table).toBe('colleges');
  });
});
