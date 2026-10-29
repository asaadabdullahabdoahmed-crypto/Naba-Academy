-- PROPOSAL ONLY: academic structure v1.
-- Historical review artifact. The provisional isolated-development design now
-- lives in backend/src/database/migrations/1793299914088-CreateAcademicFoundation.ts
-- and is not institutionally approved or authorized for Neon execution.
-- Review and obtain explicit database approval before applying to any database.
-- No seed/catalog records are included. Existing users.* academic text fields are
-- retained; mapping them to program IDs requires an approved, verified crosswalk.
-- This SQL is a review artifact, not the migration implementation. Port approved
-- DDL to a timestamped TypeORM MigrationInterface; do not run this file directly.
-- updated_at is maintained by the application/TypeORM, not by these defaults.

BEGIN;

CREATE TABLE colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(64) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,
  CONSTRAINT chk_colleges_code CHECK (code = btrim(code) AND code <> ''),
  CONSTRAINT chk_colleges_name_ar CHECK (btrim(name_ar) <> ''),
  CONSTRAINT chk_colleges_name_en CHECK (btrim(name_en) <> ''),
  CONSTRAINT chk_colleges_status CHECK (status IN ('active', 'inactive')),
  CONSTRAINT chk_colleges_deleted_status CHECK (deleted_at IS NULL OR status = 'inactive')
);

-- Codes are case-insensitively unique and are not reusable after soft deletion.
CREATE UNIQUE INDEX uq_colleges_code_ci ON colleges (lower(code));

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL,
  code VARCHAR(64) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,
  CONSTRAINT fk_departments_college
    FOREIGN KEY (college_id) REFERENCES colleges (id) ON DELETE RESTRICT,
  CONSTRAINT chk_departments_code CHECK (code = btrim(code) AND code <> ''),
  CONSTRAINT chk_departments_name_ar CHECK (btrim(name_ar) <> ''),
  CONSTRAINT chk_departments_name_en CHECK (btrim(name_en) <> ''),
  CONSTRAINT chk_departments_status CHECK (status IN ('active', 'inactive')),
  CONSTRAINT chk_departments_deleted_status CHECK (deleted_at IS NULL OR status = 'inactive')
);

-- The leading college_id also indexes the department -> college foreign key.
CREATE UNIQUE INDEX uq_departments_college_code_ci
  ON departments (college_id, lower(code));

CREATE TABLE academic_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL,
  code VARCHAR(64) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  credential_level VARCHAR(32) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,
  -- The institution must ratify credential terminology before this schema or
  -- its API contract is implemented. No enum/check list is proposed here.
  -- Keep this field constrained by length only until an approved vocabulary exists.
  CONSTRAINT fk_academic_programs_department
    FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE RESTRICT,
  CONSTRAINT chk_academic_programs_code CHECK (code = btrim(code) AND code <> ''),
  CONSTRAINT chk_academic_programs_name_ar CHECK (btrim(name_ar) <> ''),
  CONSTRAINT chk_academic_programs_name_en CHECK (btrim(name_en) <> ''),
  CONSTRAINT chk_academic_programs_status CHECK (status IN ('active', 'inactive')),
  CONSTRAINT chk_academic_programs_deleted_status CHECK (deleted_at IS NULL OR status = 'inactive')
);

-- The leading department_id also indexes the program -> department foreign key.
CREATE UNIQUE INDEX uq_academic_programs_department_code_ci
  ON academic_programs (department_id, lower(code));

-- A student's academic unit is derived through program -> department -> college.
-- NULL permits existing profiles to remain unlinked until an approved mapping exists.
-- This is one current placement per user, not an assignment/history ledger.
CREATE TABLE student_academic_profiles (
  user_id UUID PRIMARY KEY,
  academic_program_id UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_student_academic_profiles_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT fk_student_academic_profiles_program
    FOREIGN KEY (academic_program_id)
    REFERENCES academic_programs (id) ON DELETE RESTRICT
);

CREATE INDEX idx_student_academic_profiles_program_id
  ON student_academic_profiles (academic_program_id)
  WHERE academic_program_id IS NOT NULL;

COMMIT;

-- The following is a destructive development-only rollback, not a production
-- rollback after catalog/profile data exists. Production rollback requires an
-- approved data-preserving recovery plan or a forward corrective migration.
-- DROP TABLE student_academic_profiles;
-- DROP TABLE academic_programs;
-- DROP TABLE departments;
-- DROP TABLE colleges;
