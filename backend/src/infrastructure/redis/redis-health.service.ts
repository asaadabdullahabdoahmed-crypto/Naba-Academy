import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class RedisHealthService {
  private readonly logger = new Logger(RedisHealthService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Probes Redis health with a lightweight PING.
   * Returns 'unconfigured' when no Redis client is configured, and 'down' when a
   * configured client is unreachable or failing.
   * Never leaks connection strings, passwords, or network topology.
   */
  async check(): Promise<'up' | 'down' | 'unconfigured'> {
    const client = this.redisService.getClient();
    if (!client) {
      return 'unconfigured';
    }

    try {
      const response = await this.redisService.ping();
      if (response === 'PONG') {
        return 'up';
      }
      return 'down';
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Redis health probe failed: ${message}`);
      return 'down';
    }
  }
}
