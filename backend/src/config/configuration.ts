import { Environment, parseCorsOrigins } from './env.validation';

export interface AppConfig {
  nodeEnv: Environment;
  port: number;
  apiPrefix: string;
  corsOrigins: string[];
}

export interface DatabaseConfig {
  url?: string;
  ssl: boolean;
  sslRejectUnauthorized: boolean;
  poolMax: number;
  connectTimeoutMs: number;
}

export interface RedisConfig {
  url?: string;
  connectTimeoutMs: number;
  maxRetriesPerRequest: number;
}

export interface StorageConfig {
  endpoint?: string;
  region: string;
  bucket?: string;
  accessKey?: string;
  secretKey?: string;
  forcePathStyle: boolean;
  publicBaseUrl?: string;
}

export interface Configuration {
  app: AppConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  storage: StorageConfig;
}

export default (): Configuration => {
  const nodeEnv = (process.env.NODE_ENV as Environment) || Environment.Development;
  const port = parseInt(process.env.PORT || '4000', 10);
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGINS, nodeEnv);

  const databaseUrl = process.env.DATABASE_URL;
  const databaseSsl = process.env.DATABASE_SSL === 'true';
  const databaseSslRejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true';
  const databasePoolMax = parseInt(process.env.DATABASE_POOL_MAX || '10', 10);
  const databaseConnectTimeoutMs = parseInt(process.env.DATABASE_CONNECT_TIMEOUT_MS || '10000', 10);

  const redisUrl = process.env.REDIS_URL;
  const redisConnectTimeoutMs = parseInt(process.env.REDIS_CONNECT_TIMEOUT_MS || '10000', 10);
  const redisMaxRetriesPerRequest = parseInt(process.env.REDIS_MAX_RETRIES_PER_REQUEST || '3', 10);

  const storageEndpoint = process.env.OBJECT_STORAGE_ENDPOINT;
  const storageRegion = process.env.OBJECT_STORAGE_REGION || 'us-east-1';
  const storageBucket = process.env.OBJECT_STORAGE_BUCKET;
  const storageAccessKey = process.env.OBJECT_STORAGE_ACCESS_KEY;
  const storageSecretKey = process.env.OBJECT_STORAGE_SECRET_KEY;
  const storageForcePathStyle = process.env.OBJECT_STORAGE_FORCE_PATH_STYLE === 'true';
  const storagePublicBaseUrl = process.env.OBJECT_STORAGE_PUBLIC_BASE_URL;

  return {
    app: {
      nodeEnv,
      port,
      apiPrefix,
      corsOrigins,
    },
    database: {
      url: databaseUrl,
      ssl: databaseSsl,
      sslRejectUnauthorized: databaseSslRejectUnauthorized,
      poolMax: databasePoolMax,
      connectTimeoutMs: databaseConnectTimeoutMs,
    },
    redis: {
      url: redisUrl,
      connectTimeoutMs: redisConnectTimeoutMs,
      maxRetriesPerRequest: redisMaxRetriesPerRequest,
    },
    storage: {
      endpoint: storageEndpoint,
      region: storageRegion,
      bucket: storageBucket,
      accessKey: storageAccessKey,
      secretKey: storageSecretKey,
      forcePathStyle: storageForcePathStyle,
      publicBaseUrl: storagePublicBaseUrl,
    },
  };
};
