import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  Optional,
  Inject,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService implements OnApplicationShutdown {
  private readonly logger = new Logger(RedisService.name);

  constructor(
    @Optional()
    @Inject(REDIS_CLIENT)
    private readonly client: Redis | null,
  ) {
    if (this.client) {
      this.client.on('error', (err: Error) => {
        // Safe logging without leaking sensitive connection details
        this.logger.warn(`Redis connection error: ${err.message || 'Unknown network error'}`);
      });
    }
  }

  /**
   * Returns the underlying ioredis client instance, or null if unconfigured.
   */
  getClient(): Redis | null {
    return this.client;
  }

  /**
   * Checks if the Redis client is currently initialized and connected.
   */
  isReady(): boolean {
    if (!this.client) return false;
    return this.client.status === 'ready';
  }

  /**
   * Sends a lightweight PING command to verify Redis connectivity.
   */
  async ping(): Promise<string> {
    if (!this.client) {
      throw new Error('Redis client is not configured');
    }

    // Connect if in wait or initial state
    if (this.client.status === 'wait') {
      await this.client.connect();
    }

    return await this.client.ping();
  }

  /**
   * Cleanly closes the Redis connection on application shutdown.
   */
  async onApplicationShutdown(signal?: string): Promise<void> {
    if (!this.client) return;

    this.logger.log(`Closing Redis connection gracefully on ${signal || 'shutdown'}...`);
    try {
      if (this.client.status !== 'end') {
        await this.client.quit();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.warn(`Error while disconnecting Redis client: ${message}`);
      this.client.disconnect();
    }
  }
}
