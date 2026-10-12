import 'reflect-metadata';
import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Test = 'test',
  Staging = 'staging',
  Production = 'production',
}

export class EnvironmentVariables {
  @IsEnum(Environment, {
    message: 'NODE_ENV must be one of: development, test, staging, production',
  })
  NODE_ENV: Environment = Environment.Development;

  @IsInt({ message: 'PORT must be an integer between 1 and 65535' })
  @Min(1, { message: 'PORT must be at least 1' })
  @Max(65535, { message: 'PORT cannot exceed 65535' })
  PORT: number = 4000;

  @IsString()
  @IsNotEmpty({ message: 'API_PREFIX cannot be empty' })
  API_PREFIX: string = 'api/v1';

  @IsString()
  @IsOptional()
  CORS_ORIGINS?: string = 'http://localhost:3000';

  @IsString({ message: 'DATABASE_URL must be a string' })
  @IsOptional()
  @Matches(/^(postgresql|postgres):\/\/.+/, {
    message: 'DATABASE_URL must be a valid PostgreSQL connection URL (postgresql://...)',
  })
  DATABASE_URL?: string;

  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'DATABASE_SSL must be a boolean' })
  @IsOptional()
  DATABASE_SSL?: boolean = false;

  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'DATABASE_SSL_REJECT_UNAUTHORIZED must be a boolean' })
  @IsOptional()
  DATABASE_SSL_REJECT_UNAUTHORIZED?: boolean = false;

  @IsInt({ message: 'DATABASE_POOL_MAX must be an integer between 1 and 100' })
  @Min(1, { message: 'DATABASE_POOL_MAX must be at least 1' })
  @Max(100, { message: 'DATABASE_POOL_MAX cannot exceed 100' })
  @IsOptional()
  DATABASE_POOL_MAX?: number = 10;

  @IsInt({ message: 'DATABASE_CONNECT_TIMEOUT_MS must be an integer between 100 and 60000' })
  @Min(100, { message: 'DATABASE_CONNECT_TIMEOUT_MS must be at least 100' })
  @Max(60000, { message: 'DATABASE_CONNECT_TIMEOUT_MS cannot exceed 60000' })
  @IsOptional()
  DATABASE_CONNECT_TIMEOUT_MS?: number = 10000;

  @IsString({ message: 'REDIS_URL must be a string' })
  @IsOptional()
  @Matches(/^(redis|rediss):\/\/.+/, {
    message: 'REDIS_URL must be a valid Redis connection URL (redis://... or rediss://...)',
  })
  REDIS_URL?: string;

  @IsInt({ message: 'REDIS_CONNECT_TIMEOUT_MS must be an integer between 100 and 60000' })
  @Min(100, { message: 'REDIS_CONNECT_TIMEOUT_MS must be at least 100' })
  @Max(60000, { message: 'REDIS_CONNECT_TIMEOUT_MS cannot exceed 60000' })
  @IsOptional()
  REDIS_CONNECT_TIMEOUT_MS?: number = 10000;

  @IsInt({ message: 'REDIS_MAX_RETRIES_PER_REQUEST must be an integer between 0 and 20' })
  @Min(0, { message: 'REDIS_MAX_RETRIES_PER_REQUEST must be at least 0' })
  @Max(20, { message: 'REDIS_MAX_RETRIES_PER_REQUEST cannot exceed 20' })
  @IsOptional()
  REDIS_MAX_RETRIES_PER_REQUEST?: number = 3;

  @IsString({ message: 'OBJECT_STORAGE_ENDPOINT must be a string' })
  @IsOptional()
  OBJECT_STORAGE_ENDPOINT?: string;

  @IsString({ message: 'OBJECT_STORAGE_REGION must be a string' })
  @IsOptional()
  OBJECT_STORAGE_REGION?: string = 'us-east-1';

  @IsString({ message: 'OBJECT_STORAGE_BUCKET must be a string' })
  @IsOptional()
  OBJECT_STORAGE_BUCKET?: string;

  @IsString({ message: 'OBJECT_STORAGE_ACCESS_KEY must be a string' })
  @IsOptional()
  OBJECT_STORAGE_ACCESS_KEY?: string;

  @IsString({ message: 'OBJECT_STORAGE_SECRET_KEY must be a string' })
  @IsOptional()
  OBJECT_STORAGE_SECRET_KEY?: string;

  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'OBJECT_STORAGE_FORCE_PATH_STYLE must be a boolean' })
  @IsOptional()
  OBJECT_STORAGE_FORCE_PATH_STYLE?: boolean = false;

  @IsString({ message: 'OBJECT_STORAGE_PUBLIC_BASE_URL must be a string' })
  @IsOptional()
  OBJECT_STORAGE_PUBLIC_BASE_URL?: string;
}

/**
 * Parses and sanitizes comma-separated CORS origins allowlist.
 * Trims whitespace, removes empty tokens, and avoids wildcard origins in production.
 */
export function parseCorsOrigins(raw?: string, env: Environment = Environment.Development): string[] {
  if (!raw || typeof raw !== 'string') {
    return ['http://localhost:3000'];
  }

  const origins = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (origins.length === 0) {
    return ['http://localhost:3000'];
  }

  // Reject wildcard origin in production environments
  if (env === Environment.Production && origins.includes('*')) {
    throw new Error('[SecurityViolation] Wildcard CORS origin (*) is forbidden in production');
  }

  return origins;
}

/**
 * Validates process.env against EnvironmentVariables schema.
 * Throws a descriptive configuration error if startup validation fails.
 */
export function validateEnvironment(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const formattedErrors = errors
      .map((error) => {
        const constraints = error.constraints ? Object.values(error.constraints).join('; ') : '';
        return `  - ${error.property}: ${constraints}`;
      })
      .join('\n');

    throw new Error(
      `[ConfigValidationError] Backend environment configuration validation failed:\n${formattedErrors}`,
    );
  }

  // Mandatory database configuration in production and staging
  if (
    (validatedConfig.NODE_ENV === Environment.Production ||
      validatedConfig.NODE_ENV === Environment.Staging) &&
    !validatedConfig.DATABASE_URL
  ) {
    throw new Error(
      `[ConfigValidationError] Backend environment configuration validation failed:\n  - DATABASE_URL: DATABASE_URL is required in ${validatedConfig.NODE_ENV} environment`,
    );
  }

  // Validate CORS origins rules for the validated environment
  parseCorsOrigins(validatedConfig.CORS_ORIGINS, validatedConfig.NODE_ENV);

  return validatedConfig;
}
