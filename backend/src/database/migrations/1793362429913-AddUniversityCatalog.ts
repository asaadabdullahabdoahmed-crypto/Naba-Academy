import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniversityCatalog1793362429913 implements MigrationInterface {
  name = 'AddUniversityCatalog1793362429913';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "universities" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "code" VARCHAR(64) NOT NULL,
        "name_ar" VARCHAR(255) NOT NULL,
        "name_en" VARCHAR(255) NOT NULL,
        "status" VARCHAR(16) NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "chk_universities_code" CHECK ("code" = btrim("code") AND "code" <> ''),
        CONSTRAINT "chk_universities_name_ar" CHECK (btrim("name_ar") <> ''),
        CONSTRAINT "chk_universities_name_en" CHECK (btrim("name_en") <> ''),
        CONSTRAINT "chk_universities_status" CHECK ("status" IN ('active', 'inactive')),
        CONSTRAINT "chk_universities_deleted_status"
          CHECK ("deleted_at" IS NULL OR "status" = 'inactive')
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_universities_code_ci"
      ON "universities" (lower("code"))
    `);
    await queryRunner.query(`
      ALTER TABLE "colleges" ADD COLUMN "university_id" UUID NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "colleges"
      ADD CONSTRAINT "fk_colleges_university"
      FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE RESTRICT
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_colleges_university_id" ON "colleges" ("university_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const ownsTransaction = !queryRunner.isTransactionActive;
    if (ownsTransaction) await queryRunner.startTransaction();

    try {
      await queryRunner.query(`LOCK TABLE "colleges" IN ACCESS EXCLUSIVE MODE`);
      await queryRunner.query(`LOCK TABLE "universities" IN ACCESS EXCLUSIVE MODE`);

      const [linkedColleges] = (await queryRunner.query(`
        SELECT EXISTS (
          SELECT 1 FROM "colleges" WHERE "university_id" IS NOT NULL
        ) AS "has_data"
      `)) as Array<{ has_data: boolean }>;
      const [universities] = (await queryRunner.query(`
        SELECT EXISTS (SELECT 1 FROM "universities") AS "has_data"
      `)) as Array<{ has_data: boolean }>;

      if (linkedColleges?.has_data || universities?.has_data) {
        throw new Error(
          'Refusing to remove university catalog data. Use a reviewed forward migration instead.',
        );
      }

      await queryRunner.query(`DROP INDEX "idx_colleges_university_id"`);
      await queryRunner.query(`
        ALTER TABLE "colleges" DROP CONSTRAINT "fk_colleges_university"
      `);
      await queryRunner.query(`ALTER TABLE "colleges" DROP COLUMN "university_id"`);
      await queryRunner.query(`DROP TABLE "universities"`);

      if (ownsTransaction) await queryRunner.commitTransaction();
    } catch (error) {
      if (ownsTransaction && queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    }
  }
}
