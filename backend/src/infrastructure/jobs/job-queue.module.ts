import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisConfig } from '../../config/configuration';

/**
 * Parses Redis URL into connection options compatible with BullMQ.
 * BullMQ strictly requires maxRetriesPerRequest: null.
 */
export function buildBullMqConnection(configService: ConfigService) {
  const redisConfig = configService.get<RedisConfig>('redis');
  const url = redisConfig?.url;

  if (!url) {
    return {
      host: 'localhost',
      port: 6379,
      lazyConnect: true,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
    };
  }

  try {
    const parsed = new URL(url);
    const isTls = parsed.protocol === 'rediss:';
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || '6379', 10),
      username: parsed.username || undefined,
      password: parsed.password || undefined,
      db: parsed.pathname ? parseInt(parsed.pathname.replace('/', '') || '0', 10) : 0,
      tls: isTls ? {} : undefined,
      lazyConnect: true,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
    };
  } catch {
    return {
      host: 'localhost',
      port: 6379,
      lazyConnect: true,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
    };
  }
}

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: buildBullMqConnection(configService),
        prefix: 'naba_bull',
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [BullModule],
})
export class JobQueueModule {}
