import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAcademicFoundation1793299914088 implements MigrationInterface {
  name = 'CreateAcademicFoundation1793299914088';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "colleges" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "code" VARCHAR(64) NOT NULL,
        "name_ar" VARCHAR(255) NOT NULL,
        "name_en" VARCHAR(255) NOT NULL,
        "status" VARCHAR(16) NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "chk_colleges_code" CHECK ("code" = btrim("code") AND "code" <> ''),
        CONSTRAINT "chk_colleges_name_ar" CHECK (btrim("name_ar") <> ''),
        CONSTRAINT "chk_colleges_name_en" CHECK (btrim("name_en") <> ''),
        CONSTRAINT "chk_colleges_status" CHECK ("status" IN ('active', 'inactive')),
        CONSTRAINT "chk_colleges_deleted_status" CHECK ("deleted_at" IS NULL OR "status" = 'inactive')
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_colleges_code_ci" ON "colleges" (lower("code"));
    `);

    await queryRunner.query(`
      CREATE TABLE "departments" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "college_id" UUID NOT NULL,
        "code" VARCHAR(64) NOT NULL,
        "name_ar" VARCHAR(255) NOT NULL,
        "name_en" VARCHAR(255) NOT NULL,
        "status" VARCHAR(16) NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "fk_departments_college" FOREIGN KEY ("college_id")
          REFERENCES "colleges"("id") ON DELETE RESTRICT,
        CONSTRAINT "chk_departments_code" CHECK ("code" = btrim("code") AND "code" <> ''),
        CONSTRAINT "chk_departments_name_ar" CHECK (btrim("name_ar") <> ''),
        CONSTRAINT "chk_departments_name_en" CHECK (btrim("name_en") <> ''),
        CONSTRAINT "chk_departments_status" CHECK ("status" IN ('active', 'inactive')),
        CONSTRAINT "chk_departments_deleted_status" CHECK ("deleted_at" IS NULL OR "status" = 'inactive')
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_departments_college_code_ci"
      ON "departments" ("college_id", lower("code"));
    `);

    await queryRunner.query(`
      CREATE TABLE "credential_levels" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "code" VARCHAR(32) NOT NULL,
        "name_ar" VARCHAR(120) NOT NULL,
        "name_en" VARCHAR(120) NOT NULL,
        "sort_order" INTEGER NOT NULL DEFAULT 0,
        "status" VARCHAR(16) NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "chk_credential_levels_code" CHECK ("code" = btrim("code") AND "code" <> ''),
        CONSTRAINT "chk_credential_levels_name_ar" CHECK (btrim("name_ar") <> ''),
        CONSTRAINT "chk_credential_levels_name_en" CHECK (btrim("name_en") <> ''),
        CONSTRAINT "chk_credential_levels_sort_order" CHECK ("sort_order" >= 0),
        CONSTRAINT "chk_credential_levels_status" CHECK ("status" IN ('active', 'inactive')),
        CONSTRAINT "chk_credential_levels_deleted_status" CHECK ("deleted_at" IS NULL OR "status" = 'inactive')
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_credential_levels_code_ci" ON "credential_levels" (lower("code"));
    `);

    await queryRunner.query(`
      CREATE TABLE "academic_programs" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "department_id" UUID NOT NULL,
        "credential_level_id" UUID NOT NULL,
        "code" VARCHAR(64) NOT NULL,
        "name_ar" VARCHAR(255) NOT NULL,
        "name_en" VARCHAR(255) NOT NULL,
        "status" VARCHAR(16) NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "fk_academic_programs_department" FOREIGN KEY ("department_id")
          REFERENCES "departments"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_academic_programs_credential_level" FOREIGN KEY ("credential_level_id")
          REFERENCES "credential_levels"("id") ON DELETE RESTRICT,
        CONSTRAINT "chk_academic_programs_code" CHECK ("code" = btrim("code") AND "code" <> ''),
        CONSTRAINT "chk_academic_programs_name_ar" CHECK (btrim("name_ar") <> ''),
        CONSTRAINT "chk_academic_programs_name_en" CHECK (btrim("name_en") <> ''),
        CONSTRAINT "chk_academic_programs_status" CHECK ("status" IN ('active', 'inactive')),
        CONSTRAINT "chk_academic_programs_deleted_status" CHECK ("deleted_at" IS NULL OR "status" = 'inactive')
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_academic_programs_department_code_ci"
      ON "academic_programs" ("department_id", lower("code"));
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_academic_programs_credential_level_id"
      ON "academic_programs" ("credential_level_id");
    `);

    await queryRunner.query(`
      CREATE TABLE "student_academic_placements" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL,
        "academic_program_id" UUID NOT NULL,
        "effective_from" DATE NOT NULL,
        "effective_to" DATE NULL,
        "recorded_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "created_by_user_id" UUID NULL,
        CONSTRAINT "fk_student_academic_placements_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_student_academic_placements_program" FOREIGN KEY ("academic_program_id")
          REFERENCES "academic_programs"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_student_academic_placements_created_by" FOREIGN KEY ("created_by_user_id")
          REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "chk_student_academic_placements_dates"
          CHECK ("effective_to" IS NULL OR "effective_to" > "effective_from")
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_student_academic_placements_current_user"
      ON "student_academic_placements" ("user_id")
      WHERE "effective_to" IS NULL;
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_student_academic_placements_user_history"
      ON "student_academic_placements" ("user_id", "effective_from" DESC);
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_student_academic_placements_program_id"
      ON "student_academic_placements" ("academic_program_id");
    `);

    await queryRunner.query(`
      CREATE TABLE "academic_terms" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "code" VARCHAR(64) NOT NULL,
        "name_ar" VARCHAR(255) NOT NULL,
        "name_en" VARCHAR(255) NOT NULL,
        "starts_on" DATE NOT NULL,
        "ends_on" DATE NOT NULL,
        "status" VARCHAR(16) NOT NULL DEFAULT 'planned',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "chk_academic_terms_code" CHECK ("code" = btrim("code") AND "code" <> ''),
        CONSTRAINT "chk_academic_terms_name_ar" CHECK (btrim("name_ar") <> ''),
        CONSTRAINT "chk_academic_terms_name_en" CHECK (btrim("name_en") <> ''),
        CONSTRAINT "chk_academic_terms_dates" CHECK ("ends_on" >= "starts_on"),
        CONSTRAINT "chk_academic_terms_status" CHECK ("status" IN ('planned', 'active', 'completed', 'cancelled')),
        CONSTRAINT "chk_academic_terms_deleted_status" CHECK ("deleted_at" IS NULL OR "status" = 'cancelled')
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_academic_terms_code_ci" ON "academic_terms" (lower("code"));
    `);

    await queryRunner.query(`
      CREATE TABLE "courses" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "department_id" UUID NOT NULL,
        "code" VARCHAR(64) NOT NULL,
        "name_ar" VARCHAR(255) NOT NULL,
        "name_en" VARCHAR(255) NOT NULL,
        "status" VARCHAR(16) NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "fk_courses_department" FOREIGN KEY ("department_id")
          REFERENCES "departments"("id") ON DELETE RESTRICT,
        CONSTRAINT "chk_courses_code" CHECK ("code" = btrim("code") AND "code" <> ''),
        CONSTRAINT "chk_courses_name_ar" CHECK (btrim("name_ar") <> ''),
        CONSTRAINT "chk_courses_name_en" CHECK (btrim("name_en") <> ''),
        CONSTRAINT "chk_courses_status" CHECK ("status" IN ('active', 'inactive')),
        CONSTRAINT "chk_courses_deleted_status" CHECK ("deleted_at" IS NULL OR "status" = 'inactive')
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_courses_department_code_ci"
      ON "courses" ("department_id", lower("code"));
    `);

    await queryRunner.query(`
      CREATE TABLE "course_offerings" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "course_id" UUID NOT NULL,
        "academic_term_id" UUID NOT NULL,
        "code" VARCHAR(64) NOT NULL,
        "status" VARCHAR(16) NOT NULL DEFAULT 'planned',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "fk_course_offerings_course" FOREIGN KEY ("course_id")
          REFERENCES "courses"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_course_offerings_term" FOREIGN KEY ("academic_term_id")
          REFERENCES "academic_terms"("id") ON DELETE RESTRICT,
        CONSTRAINT "chk_course_offerings_code" CHECK ("code" = btrim("code") AND "code" <> ''),
        CONSTRAINT "chk_course_offerings_status" CHECK ("status" IN ('planned', 'open', 'closed', 'cancelled')),
        CONSTRAINT "chk_course_offerings_deleted_status"
          CHECK ("deleted_at" IS NULL OR "status" = 'cancelled')
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_course_offerings_term_course_code_ci"
      ON "course_offerings" ("academic_term_id", "course_id", lower("code"));
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_course_offerings_course_term"
      ON "course_offerings" ("course_id", "academic_term_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'course_offerings',
      'courses',
      'academic_terms',
      'student_academic_placements',
      'academic_programs',
      'credential_levels',
      'departments',
      'colleges',
    ];

    const ownsTransaction = !queryRunner.isTransactionActive;
    if (ownsTransaction) await queryRunner.startTransaction();

    try {
      for (const table of tables) {
        await queryRunner.query(`LOCK TABLE "${table}" IN ACCESS EXCLUSIVE MODE`);
      }

      for (const table of tables) {
        const [result] = (await queryRunner.query(
          `SELECT EXISTS (SELECT 1 FROM "${table}" LIMIT 1) AS "has_data"`,
        )) as Array<{ has_data: boolean }>;
        if (result?.has_data) {
          throw new Error(
            `Refusing to drop ${table}: academic data exists. Use a reviewed forward migration instead.`,
          );
        }
      }

      for (const table of tables) {
        await queryRunner.query(`DROP TABLE "${table}"`);
      }

      if (ownsTransaction) await queryRunner.commitTransaction();
    } catch (error) {
      if (ownsTransaction && queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    }
  }
}
