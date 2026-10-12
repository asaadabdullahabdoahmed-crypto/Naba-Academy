import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIdentityFoundation1726920000000 implements MigrationInterface {
  name = 'CreateIdentityFoundation1726920000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Enable pgcrypto for gen_random_uuid()
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // 2. Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "national_id" VARCHAR(20) NOT NULL,
        "name_ar" VARCHAR(255) NOT NULL,
        "name_en" VARCHAR(255) NOT NULL,
        "email" VARCHAR(320) NOT NULL,
        "normalized_email" VARCHAR(320) NOT NULL,
        "phone" VARCHAR(30) NULL,
        "avatar" TEXT NULL,
        "department_id" VARCHAR(100) NULL,
        "department_ar" VARCHAR(255) NULL,
        "department_en" VARCHAR(255) NULL,
        "college_ar" VARCHAR(255) NULL,
        "college_en" VARCHAR(255) NULL,
        "password_hash" VARCHAR(255) NOT NULL,
        "email_verified_at" TIMESTAMPTZ NULL,
        "account_status" VARCHAR(32) NOT NULL DEFAULT 'pending_verification',
        "failed_login_count" SMALLINT NOT NULL DEFAULT 0,
        "locked_until" TIMESTAMPTZ NULL,
        "last_login_at" TIMESTAMPTZ NULL,
        "password_changed_at" TIMESTAMPTZ NULL,
        "disabled_at" TIMESTAMPTZ NULL,
        "disabled_reason" VARCHAR(500) NULL,
        "disabled_by_user_id" UUID NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "uq_users_national_id" UNIQUE ("national_id"),
        CONSTRAINT "uq_users_normalized_email" UNIQUE ("normalized_email"),
        CONSTRAINT "chk_users_account_status" CHECK ("account_status" IN ('pending_verification', 'active', 'disabled')),
        CONSTRAINT "chk_users_failed_login_count" CHECK ("failed_login_count" >= 0)
      );
    `);

    // Add self-referencing foreign key for disabled_by_user_id
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "fk_users_disabled_by_user"
      FOREIGN KEY ("disabled_by_user_id")
      REFERENCES "users"("id")
      ON DELETE SET NULL;
    `);

    // 3. Create roles table
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "code" VARCHAR(64) NOT NULL,
        "name_ar" VARCHAR(120) NOT NULL,
        "name_en" VARCHAR(120) NOT NULL,
        "is_system" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "uq_roles_code" UNIQUE ("code")
      );
    `);

    // 4. Create permissions table
    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "code" VARCHAR(120) NOT NULL,
        "name_ar" VARCHAR(160) NOT NULL,
        "name_en" VARCHAR(160) NOT NULL,
        "description_ar" TEXT NULL,
        "description_en" TEXT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "uq_permissions_code" UNIQUE ("code")
      );
    `);

    // 5. Create role_permissions join table
    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "role_id" UUID NOT NULL,
        "permission_id" UUID NOT NULL,
        "granted_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY ("role_id", "permission_id"),
        CONSTRAINT "fk_role_permissions_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_role_permissions_permission" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT
      );
    `);

    // 6. Create user_role_assignments table
    await queryRunner.query(`
      CREATE TABLE "user_role_assignments" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL,
        "role_id" UUID NOT NULL,
        "scope_type" VARCHAR(32) NOT NULL DEFAULT 'global',
        "scope_id" UUID NULL,
        "assigned_by_user_id" UUID NULL,
        "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "revoked_at" TIMESTAMPTZ NULL,
        "revoked_by_user_id" UUID NULL,
        "revocation_reason" VARCHAR(500) NULL,
        CONSTRAINT "fk_user_role_assignments_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_user_role_assignments_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_user_role_assignments_assigned_by" FOREIGN KEY ("assigned_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_user_role_assignments_revoked_by" FOREIGN KEY ("revoked_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "chk_user_role_assignments_scope_type" CHECK ("scope_type" IN ('global', 'department', 'program', 'course_offering')),
        CONSTRAINT "chk_user_role_assignments_scope_consistency" CHECK (
          ("scope_type" = 'global' AND "scope_id" IS NULL) OR
          ("scope_type" <> 'global' AND "scope_id" IS NOT NULL)
        )
      );
    `);

    await queryRunner.query(`CREATE INDEX "idx_user_role_assignments_user_id" ON "user_role_assignments"("user_id");`);
    await queryRunner.query(`CREATE INDEX "idx_user_role_assignments_role_id" ON "user_role_assignments"("role_id");`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_active_global_role_assignment"
      ON "user_role_assignments"("user_id", "role_id")
      WHERE "revoked_at" IS NULL AND "scope_type" = 'global' AND "scope_id" IS NULL;
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_active_scoped_role_assignment"
      ON "user_role_assignments"("user_id", "role_id", "scope_type", "scope_id")
      WHERE "revoked_at" IS NULL AND "scope_type" <> 'global' AND "scope_id" IS NOT NULL;
    `);

    // 7. Create user_sessions table
    await queryRunner.query(`
      CREATE TABLE "user_sessions" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL,
        "token_hash" VARCHAR(64) NOT NULL,
        "csrf_token_hash" VARCHAR(64) NOT NULL,
        "user_agent" TEXT NULL,
        "device_label" VARCHAR(200) NULL,
        "ip_address" INET NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "last_seen_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "expires_at" TIMESTAMPTZ NOT NULL,
        "revoked_at" TIMESTAMPTZ NULL,
        "revoke_reason" VARCHAR(300) NULL,
        CONSTRAINT "uq_user_sessions_token_hash" UNIQUE ("token_hash"),
        CONSTRAINT "fk_user_sessions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`CREATE INDEX "idx_user_sessions_user_id" ON "user_sessions"("user_id");`);
    await queryRunner.query(`CREATE INDEX "idx_user_sessions_expires_at" ON "user_sessions"("expires_at");`);
    await queryRunner.query(`CREATE INDEX "idx_user_sessions_revoked_at" ON "user_sessions"("revoked_at");`);
    await queryRunner.query(`
      CREATE INDEX "idx_user_sessions_active_lookup"
      ON "user_sessions"("user_id", "expires_at", "revoked_at");
    `);

    // 8. Create email_verification_tokens table
    await queryRunner.query(`
      CREATE TABLE "email_verification_tokens" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL,
        "token_hash" VARCHAR(64) NOT NULL,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "used_at" TIMESTAMPTZ NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "uq_email_verification_tokens_hash" UNIQUE ("token_hash"),
        CONSTRAINT "fk_email_verification_tokens_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_email_verification_tokens_lookup"
      ON "email_verification_tokens"("user_id", "used_at", "expires_at");
    `);

    // 9. Create password_reset_tokens table
    await queryRunner.query(`
      CREATE TABLE "password_reset_tokens" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL,
        "token_hash" VARCHAR(64) NOT NULL,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "used_at" TIMESTAMPTZ NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "uq_password_reset_tokens_hash" UNIQUE ("token_hash"),
        CONSTRAINT "fk_password_reset_tokens_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_password_reset_tokens_lookup"
      ON "password_reset_tokens"("user_id", "used_at", "expires_at");
    `);

    // 10. Create user_account_status_events table
    await queryRunner.query(`
      CREATE TABLE "user_account_status_events" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL,
        "previous_status" VARCHAR(32) NULL,
        "new_status" VARCHAR(32) NOT NULL,
        "actor_user_id" UUID NULL,
        "reason" VARCHAR(500) NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "fk_user_account_status_events_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_user_account_status_events_actor" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "chk_user_status_events_new_status" CHECK ("new_status" IN ('pending_verification', 'active', 'disabled')),
        CONSTRAINT "chk_user_status_events_prev_status" CHECK ("previous_status" IS NULL OR "previous_status" IN ('pending_verification', 'active', 'disabled'))
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_user_status_events_user_created"
      ON "user_account_status_events"("user_id", "created_at");
    `);

    // 11. Seed the canonical V1 authorization roles
    await queryRunner.query(`
      INSERT INTO "roles" ("id", "code", "name_ar", "name_en", "is_system", "created_at", "updated_at")
      VALUES
        (gen_random_uuid(), 'system_admin', 'مدير النظام', 'System Administrator', true, now(), now()),
        (gen_random_uuid(), 'department_head', 'رئيس القسم', 'Department Head', true, now(), now()),
        (gen_random_uuid(), 'instructor', 'مدرس', 'Instructor', true, now(), now()),
        (gen_random_uuid(), 'student', 'طالب', 'Student', true, now(), now())
      ON CONFLICT ("code") DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_account_status_events";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "password_reset_tokens";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "email_verification_tokens";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_sessions";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_role_assignments";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "role_permissions";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "permissions";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles";`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "fk_users_disabled_by_user";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users";`);
  }
}
