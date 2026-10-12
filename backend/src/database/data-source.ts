import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables for TypeORM CLI migration operations
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const isProduction = process.env.NODE_ENV === 'production';
const isStaging = process.env.NODE_ENV === 'staging';
const isDevelopment = process.env.NODE_ENV === 'development';
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && !isDevelopment) {
  throw new Error(
    '[DataSourceError] DATABASE_URL is required for TypeORM CLI operations in non-development environments',
  );
}

/**
 * Authoritative TypeORM CLI DataSource instance.
 *
 * Used exclusively by TypeORM CLI commands:
 * - migration:run
 * - migration:revert
 * - migration:generate
 * - migration:show
 *
 * Safety Invariants:
 * - synchronize: false (Strictly enforced)
 * - dropSchema: false (Strictly enforced)
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl || (isDevelopment ? 'postgresql://naba_user:change_me@localhost:5432/naba_academy' : undefined),
  ssl:
    process.env.DATABASE_SSL === 'true'
      ? {
          rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true',
        }
      : false,
  extra: {
    max: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),
    connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECT_TIMEOUT_MS || '10000', 10),
  },
  synchronize: false,
  dropSchema: false,
  entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, 'migrations/*{.ts,.js}')],
  migrationsTableName: 'typeorm_migrations',
  logging: isProduction ? ['error', 'warn'] : ['error', 'warn', 'migration'],
});

