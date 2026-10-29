import { DataSource, QueryRunner } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CreateAcademicFoundation1793299914088 } from '../../database/migrations/1793299914088-CreateAcademicFoundation';
import {
  ACADEMIC_ENTITIES,
  AcademicProgramEntity,
  CollegeEntity,
  CredentialLevelEntity,
  DepartmentEntity,
} from './infrastructure/persistence/academic-catalog.entity';
import { UserEntity } from '../identity/infrastructure/persistence/entities/user.entity';
import { AcademicCatalogService } from './application/academic-catalog.service';
import { AcademicCatalogQueryDto } from './presentation/dto/academic-catalog-query.dto';

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
  let usersFixtureCreated = false;
  const migration = new CreateAcademicFoundation1793299914088();

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
        to_regclass('public.colleges') AS "colleges",
        to_regclass('public.departments') AS "departments",
        to_regclass('public.academic_programs') AS "programs"
    `)) as Array<Record<string, string | null>>;
    if (Object.values(existing).some(Boolean)) {
      throw new Error('The isolated academic test database must be empty before the test runs.');
    }

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" UUID PRIMARY KEY,
        "department_id" VARCHAR(100) NULL,
        "department_ar" VARCHAR(255) NULL,
        "department_en" VARCHAR(255) NULL,
        "college_ar" VARCHAR(255) NULL,
        "college_en" VARCHAR(255) NULL
      )
    `);
    usersFixtureCreated = true;
    await migration.up(queryRunner);
    migrationApplied = true;

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
      await queryRunner.query(`DELETE FROM "users"`);
      await migration.down(queryRunner);
      migrationApplied = false;
    }
    if (usersFixtureCreated && queryRunner?.isReleased === false) {
      await queryRunner.query(`DROP TABLE "users"`);
      usersFixtureCreated = false;
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
          'colleges', 'departments', 'credential_levels', 'academic_programs',
          'student_academic_placements', 'academic_terms', 'courses', 'course_offerings'
        )
    `)) as Array<{ count: number }>;
    const userColumns = (await queryRunner.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY column_name
    `)) as Array<{ column_name: string }>;
    const [catalogRows] = (await queryRunner.query(`
      SELECT
        (SELECT count(*) FROM "colleges") +
        (SELECT count(*) FROM "departments") +
        (SELECT count(*) FROM "credential_levels") +
        (SELECT count(*) FROM "academic_programs") AS "count"
    `)) as Array<{ count: string }>;

    expect(tableInfo.count).toBe(8);
    expect(userColumns.map(({ column_name }) => column_name)).toEqual([
      'college_ar',
      'college_en',
      'department_ar',
      'department_en',
      'department_id',
      'id',
    ]);
    expect(Number(catalogRows.count)).toBe(0);
    expect(metadataDataSource.entityMetadatas).toHaveLength(ACADEMIC_ENTITIES.length + 1);
  });

  it('enforces stable codes, foreign keys, historical placements, and course/term separation', async () => {
    const firstUserId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const secondUserId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    await queryRunner.query(`INSERT INTO "users" ("id") VALUES ($1), ($2)`, [
      firstUserId,
      secondUserId,
    ]);

    const [college] = (await queryRunner.query(
      `INSERT INTO "colleges" ("code", "name_ar", "name_en") VALUES ('COL', 'كلية اختبار', 'Test College') RETURNING "id"`,
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
    );
    const page = new AcademicCatalogQueryDto();
    const collegePage = await catalog.listColleges(page);
    const departmentPage = await catalog.listDepartments(college.id, page);
    const programPage = await catalog.listPrograms(department.id, page);
    const credentialPage = await catalog.listCredentialLevels(page);
    expect(collegePage.data[0]?.id).toBe(college.id);
    expect(departmentPage.data[0]?.collegeId).toBe(college.id);
    expect(programPage.data[0]?.credentialLevel.id).toBe(credentialLevel.id);
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

  it('refuses rollback while academic data exists', async () => {
    await expect(migration.down(queryRunner)).rejects.toThrow(
      /academic data exists/,
    );
    const [table] = (await queryRunner.query(
      `SELECT to_regclass('public.colleges') AS "table"`,
    )) as Array<{ table: string | null }>;
    expect(table.table).toBe('colleges');
  });
});
