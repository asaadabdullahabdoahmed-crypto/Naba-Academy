import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../../infrastructure/redis/redis.service';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

interface InMemoryRecord {
  count: number;
  resetAt: number;
}

@Injectable()
export class IdentityRateLimiterService {
  private readonly logger = new Logger(IdentityRateLimiterService.name);
  private readonly memoryStore = new Map<string, InMemoryRecord>();

  constructor(private readonly redisService: RedisService) {}

  /**
   * Consumes a rate limit token for the given action and identifier (typically sanitized IP).
   * Note: Raw authentication tokens, emails, or credentials must never be passed as identifier.
   */
  async consume(
    action: string,
    identifier: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult> {
    const key = `rl:${action}:${identifier}`;
    const now = Date.now();

    // 1. Try Redis first if initialized and ready
    if (this.redisService.isReady()) {
      try {
        const client = this.redisService.getClient();
        if (client) {
          const count = await client.incr(key);
          if (count === 1) {
            await client.expire(key, windowSeconds);
          }
          const ttl = await client.ttl(key);
          const resetAt = now + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000);

          return {
            allowed: count <= limit,
            remaining: Math.max(0, limit - count),
            resetAt,
          };
        }
      } catch (err: unknown) {
        // Safe warning without exposing client or network details
        this.logger.warn(
          `Redis rate limiting error, falling back to in-memory store: ${(err as Error).message}`,
        );
      }
    }

    // 2. Safe Fallback: In-memory sliding window
    // Failure policy: Token issuance and endpoint access must not become unlimited when Redis is down.
    this.pruneMemoryStore(now);

    const record = this.memoryStore.get(key);
    if (!record || now >= record.resetAt) {
      const resetAt = now + windowSeconds * 1000;
      this.memoryStore.set(key, { count: 1, resetAt });
      return {
        allowed: 1 <= limit,
        remaining: Math.max(0, limit - 1),
        resetAt,
      };
    }

    record.count += 1;
    return {
      allowed: record.count <= limit,
      remaining: Math.max(0, limit - record.count),
      resetAt: record.resetAt,
    };
  }

  /**
   * Resets rate limit for a specific action/identifier (e.g. on successful login).
   */
  async reset(action: string, identifier: string): Promise<void> {
    const key = `rl:${action}:${identifier}`;
    this.memoryStore.delete(key);

    if (this.redisService.isReady()) {
      try {
        const client = this.redisService.getClient();
        if (client) {
          await client.del(key);
        }
      } catch (err: unknown) {
        this.logger.warn(`Redis rate limit reset error: ${(err as Error).message}`);
      }
    }
  }

  /**
   * Memory hygiene: clean up expired entries from in-memory fallback map.
   */
  private pruneMemoryStore(now: number): void {
    if (this.memoryStore.size > 1000) {
      for (const [k, v] of this.memoryStore.entries()) {
        if (now >= v.resetAt) {
          this.memoryStore.delete(k);
        }
      }
    }
  }
}
