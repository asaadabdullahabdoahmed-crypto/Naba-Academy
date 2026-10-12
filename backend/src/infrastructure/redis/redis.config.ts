import { ConfigService } from '@nestjs/config';
import { RedisOptions } from 'ioredis';
import { RedisConfig } from '../../config/configuration';

export interface ResolvedRedisConfig {
  url?: string;
  options: RedisOptions;
}

/**
 * Sanitizes Redis connection URL or connection details by masking passwords.
 */
export function sanitizeRedisUrl(url?: string): string {
  if (!url) return '[NOT_CONFIGURED]';
  try {
    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = '***';
    }
    return parsed.toString();
  } catch {
    return '[INVALID_REDIS_URL]';
  }
}

/**
 * Builds safe RedisOptions from application ConfigService.
 * Enforces lazy connection and bounded retry strategies to avoid unhandled crashes.
 */
export function createRedisOptions(configService: ConfigService): ResolvedRedisConfig {
  const redisConfig = configService.get<RedisConfig>('redis');
  const url = redisConfig?.url;
  const connectTimeoutMs = redisConfig?.connectTimeoutMs ?? 10000;
  const maxRetriesPerRequest = redisConfig?.maxRetriesPerRequest ?? 3;

  const options: RedisOptions = {
    connectTimeout: connectTimeoutMs,
    maxRetriesPerRequest,
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy(times: number) {
      if (times > 3) {
        return null; // Stop retrying after 3 attempts in disconnection loop
      }
      return Math.min(times * 200, 1000);
    },
  };

  return {
    url,
    options,
  };
}
