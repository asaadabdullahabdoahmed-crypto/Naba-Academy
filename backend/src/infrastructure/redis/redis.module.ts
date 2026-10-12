import { Global, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';
import { createRedisOptions } from './redis.config';
import { RedisService } from './redis.service';
import { RedisHealthService } from './redis-health.service';

const redisClientProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: (configService: ConfigService): Redis | null => {
    const { url, options } = createRedisOptions(configService);
    if (!url) {
      return null;
    }
    return new Redis(url, options);
  },
  inject: [ConfigService],
};

@Global()
@Module({
  providers: [redisClientProvider, RedisService, RedisHealthService],
  exports: [REDIS_CLIENT, RedisService, RedisHealthService],
})
export class RedisModule {}
