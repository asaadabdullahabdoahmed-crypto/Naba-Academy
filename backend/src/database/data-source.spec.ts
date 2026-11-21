import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { ConnectionMetadataBuilder } from 'typeorm/connection/ConnectionMetadataBuilder';
import { DataSource } from 'typeorm';

describe('migration discovery', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    const previousDatabaseUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = 'postgresql://migration-test:unused@127.0.0.1:1/migration-test';

    try {
      ({ AppDataSource: dataSource } = await import('./data-source'));
    } finally {
      if (previousDatabaseUrl === undefined) {
        delete process.env.DATABASE_URL;
      } else {
        process.env.DATABASE_URL = previousDatabaseUrl;
      }
    }
  });

  it('loads the existing development TypeScript migrations from the configured glob', async () => {
    const migrations = dataSource.options.migrations;
    if (!Array.isArray(migrations)) throw new Error('Migration discovery is not configured');

    const loadedMigrations = await new ConnectionMetadataBuilder(dataSource).buildMigrations(
      migrations,
    );

    expect(loadedMigrations.map(({ constructor }) => constructor.name)).toEqual(
      expect.arrayContaining([
        'CreateIdentityFoundation1726920000000',
        'CreateAcademicFoundation1793299914088',
        'AddUniversityCatalog1793362429913',
        'CreateAcademicOperations1793618000000',
      ]),
    );
  });

  it('includes future timestamp prefixes and both compiled JavaScript and TypeScript files', async () => {
    const migrations = dataSource.options.migrations;
    if (!Array.isArray(migrations)) throw new Error('Migration discovery is not configured');
    const migrationPattern = migrations.find(
      (migration): migration is string => typeof migration === 'string',
    );
    if (!migrationPattern) throw new Error('Migration discovery has no directory glob');

    const fixtureDirectory = mkdtempSync(path.join(tmpdir(), 'typeorm-migrations-'));
    try {
      writeFileSync(
        path.join(fixtureDirectory, '1890000000000-FutureJavaMigration.js'),
        'module.exports = { FutureJavaMigration1890000000000: class FutureJavaMigration1890000000000 {} };',
      );
      writeFileSync(
        path.join(fixtureDirectory, '1890000000001-FutureTypeScriptMigration.ts'),
        'export class FutureTypeScriptMigration1890000000001 {}',
      );
      writeFileSync(
        path.join(fixtureDirectory, 'migration-discovery.spec.ts'),
        'throw new Error("Migration discovery must not load Jest specs");',
      );

      const fixtureGlob = path.join(fixtureDirectory, path.basename(migrationPattern));
      const loadedMigrations = await new ConnectionMetadataBuilder(dataSource).buildMigrations([
        fixtureGlob,
      ]);

      expect(loadedMigrations.map(({ constructor }) => constructor.name)).toEqual(
        expect.arrayContaining([
          'FutureJavaMigration1890000000000',
          'FutureTypeScriptMigration1890000000001',
        ]),
      );
      expect(loadedMigrations).toHaveLength(2);
    } finally {
      rmSync(fixtureDirectory, { recursive: true, force: true });
    }
  });
});
