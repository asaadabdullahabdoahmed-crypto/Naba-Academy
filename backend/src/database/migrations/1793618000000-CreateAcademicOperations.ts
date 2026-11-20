import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAcademicOperations1793618000000 implements MigrationInterface {
  name = 'CreateAcademicOperations1793618000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "academic_sections" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "course_offering_id" UUID NOT NULL,
        "code" VARCHAR(64) NOT NULL,
        "capacity" INTEGER NOT NULL,
        "status" VARCHAR(16) NOT NULL DEFAULT 'planned',
        "schedule" JSONB NULL,
        "enrollment_opens_at" TIMESTAMPTZ NULL,
        "enrollment_closes_at" TIMESTAMPTZ NULL,
        "created_by_user_id" UUID NOT NULL,
        "updated_by_user_id" UUID NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "fk_academic_sections_offering" FOREIGN KEY ("course_offering_id")
          REFERENCES "course_offerings"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_academic_sections_created_by" FOREIGN KEY ("created_by_user_id")
          REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_academic_sections_updated_by" FOREIGN KEY ("updated_by_user_id")
          REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "chk_academic_sections_code" CHECK ("code" = btrim("code") AND "code" <> ''),
        CONSTRAINT "chk_academic_sections_capacity" CHECK ("capacity" > 0),
        CONSTRAINT "chk_academic_sections_status" CHECK ("status" IN ('planned', 'open', 'closed')),
        CONSTRAINT "chk_academic_sections_window_pair" CHECK (
          ("enrollment_opens_at" IS NULL) = ("enrollment_closes_at" IS NULL)
        ),
        CONSTRAINT "chk_academic_sections_window_order" CHECK (
          "enrollment_closes_at" IS NULL OR "enrollment_closes_at" > "enrollment_opens_at"
        )
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_academic_sections_offering_code_ci"
      ON "academic_sections" ("course_offering_id", lower("code"));
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_academic_sections_offering_status"
      ON "academic_sections" ("course_offering_id", "status", "code");
    `);

    await queryRunner.query(`
      CREATE TABLE "academic_teacher_section_assignments" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "section_id" UUID NOT NULL,
        "teacher_user_id" UUID NOT NULL,
        "assigned_by_user_id" UUID NOT NULL,
        "status" VARCHAR(16) NOT NULL DEFAULT 'active',
        "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "revoked_at" TIMESTAMPTZ NULL,
        "revoked_by_user_id" UUID NULL,
        CONSTRAINT "fk_academic_teacher_assignment_section" FOREIGN KEY ("section_id")
          REFERENCES "academic_sections"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_academic_teacher_assignment_teacher" FOREIGN KEY ("teacher_user_id")
          REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_academic_teacher_assignment_actor" FOREIGN KEY ("assigned_by_user_id")
          REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_academic_teacher_assignment_revoker" FOREIGN KEY ("revoked_by_user_id")
          REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "chk_academic_teacher_assignment_status" CHECK ("status" IN ('active', 'revoked')),
        CONSTRAINT "chk_academic_teacher_assignment_lifecycle" CHECK (
          ("status" = 'active' AND "revoked_at" IS NULL) OR
          ("status" = 'revoked' AND "revoked_at" IS NOT NULL)
        )
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_academic_teacher_section_active"
      ON "academic_teacher_section_assignments" ("section_id", "teacher_user_id")
      WHERE "status" = 'active';
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_academic_teacher_section_teacher_status"
      ON "academic_teacher_section_assignments" ("teacher_user_id", "status", "section_id");
    `);

    await queryRunner.query(`
      CREATE TABLE "academic_student_enrollments" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "section_id" UUID NOT NULL,
        "student_user_id" UUID NOT NULL,
        "status" VARCHAR(16) NOT NULL DEFAULT 'active',
        "enrolled_by_user_id" UUID NOT NULL,
        "enrolled_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "cancelled_at" TIMESTAMPTZ NULL,
        "cancelled_by_user_id" UUID NULL,
        CONSTRAINT "fk_academic_student_enrollment_section" FOREIGN KEY ("section_id")
          REFERENCES "academic_sections"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_academic_student_enrollment_student" FOREIGN KEY ("student_user_id")
          REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_academic_student_enrollment_actor" FOREIGN KEY ("enrolled_by_user_id")
          REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_academic_student_enrollment_canceller" FOREIGN KEY ("cancelled_by_user_id")
          REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "chk_academic_student_enrollment_status" CHECK ("status" IN ('active', 'cancelled')),
        CONSTRAINT "chk_academic_student_enrollment_lifecycle" CHECK (
          ("status" = 'active' AND "cancelled_at" IS NULL) OR
          ("status" = 'cancelled' AND "cancelled_at" IS NOT NULL)
        )
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_academic_student_enrollment_active"
      ON "academic_student_enrollments" ("section_id", "student_user_id")
      WHERE "status" = 'active';
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_academic_student_enrollment_student_status"
      ON "academic_student_enrollments" ("student_user_id", "status", "enrolled_at" DESC);
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_academic_student_enrollment_section_status"
      ON "academic_student_enrollments" ("section_id", "status");
    `);

    await queryRunner.query(`
      CREATE TABLE "academic_operation_audit_events" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "section_id" UUID NULL,
        "target_user_id" UUID NULL,
        "actor_user_id" UUID NOT NULL,
        "department_id" UUID NOT NULL,
        "event_type" VARCHAR(64) NOT NULL,
        "details" JSONB NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "fk_academic_operation_audit_section" FOREIGN KEY ("section_id")
          REFERENCES "academic_sections"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_academic_operation_audit_target" FOREIGN KEY ("target_user_id")
          REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_academic_operation_audit_actor" FOREIGN KEY ("actor_user_id")
          REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_academic_operation_audit_department" FOREIGN KEY ("department_id")
          REFERENCES "departments"("id") ON DELETE RESTRICT,
        CONSTRAINT "chk_academic_operation_audit_event_type" CHECK ("event_type" <> '')
      );
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_academic_operation_audit_section_created"
      ON "academic_operation_audit_events" ("section_id", "created_at" DESC);
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_academic_operation_audit_actor_created"
      ON "academic_operation_audit_events" ("actor_user_id", "created_at" DESC);
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'academic_operation_audit_events',
      'academic_student_enrollments',
      'academic_teacher_section_assignments',
      'academic_sections',
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
            `Refusing to drop ${table}: academic operations history exists. Use a reviewed forward migration instead.`,
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
