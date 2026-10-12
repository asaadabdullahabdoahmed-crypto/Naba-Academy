import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Environment } from '../config/env.validation';

/**
 * Builds TypeORM module options from validated application configuration.
 *
 * Safety Invariants:
 * - synchronize: false (Strictly enforced in ALL environments; schema changes are migration-only)
 * - dropSchema: false (Automatic destructive schema operations are forbidden)
 * - autoLoadEntities: true (Permits clean discovery of future module-owned entities via forFeature)
 */
export function getTypeOrmOptions(configService: ConfigService): TypeOrmModuleOptions {
  const nodeEnv = configService.get<Environment>('app.nodeEnv') || Environment.Development;
  const isProduction = nodeEnv === Environment.Production;
  const isStaging = nodeEnv === Environment.Staging;

  const url = configService.get<string>('database.url');
  const sslEnabled = configService.get<boolean>('database.ssl') ?? false;
  const sslRejectUnauthorized =
    configService.get<boolean>('database.sslRejectUnauthorized') ?? false;
  const poolMax = configService.get<number>('database.poolMax') ?? 10;
  const connectTimeoutMs = configService.get<number>('database.connectTimeoutMs') ?? 10000;

  // In production/staging, DATABASE_URL must be present
  if ((isProduction || isStaging) && !url) {
    throw new Error(
      `[DatabaseConfigError] DATABASE_URL is required in ${nodeEnv} environment`,
    );
  }

  return {
    type: 'postgres',
    url: url || undefined,
    ssl: sslEnabled
      ? {
          rejectUnauthorized: sslRejectUnauthorized,
        }
      : false,
    extra: {
      max: poolMax,
      connectionTimeoutMillis: connectTimeoutMs,
    },
    // CRITICAL SAFETY CONTROLS
    synchronize: false,
    dropSchema: false,
    autoLoadEntities: true,
    // Safe logging policy: errors and warnings only in production; no sensitive parameters logged
    logging: isProduction
      ? ['error', 'warn']
      : isStaging
        ? ['error', 'warn', 'migration']
        : ['error', 'warn', 'schema', 'migration'],
    retryAttempts: isProduction ? 5 : 2,
    retryDelay: 3000,
  };
}
