import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class RedisHealthService {
  private readonly logger = new Logger(RedisHealthService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Probes Redis health with a lightweight PING.
   * Returns 'up' when responsive, 'down' when unreachable, unconfigured, or failing.
   * Never leaks connection strings, passwords, or network topology.
   */
  async check(): Promise<'up' | 'down'> {
    const client = this.redisService.getClient();
    if (!client) {
      // Intentionally unconfigured in current environment
      return 'down';
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
