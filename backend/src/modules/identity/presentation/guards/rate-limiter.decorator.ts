import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_METADATA_KEY = 'identity:rate_limit';

export interface RateLimitOptions {
  action: string;
  limit: number;
  windowSeconds: number;
}

/**
 * Decorator to apply IP-based rate limiting to identity endpoints.
 * @param action Distinct action namespace (e.g. 'login', 'register', 'forgot-password')
 * @param limit Maximum allowed requests within the time window
 * @param windowSeconds Window duration in seconds
 */
export const RateLimit = (action: string, limit: number, windowSeconds: number) =>
  SetMetadata(RATE_LIMIT_METADATA_KEY, { action, limit, windowSeconds } as RateLimitOptions);
