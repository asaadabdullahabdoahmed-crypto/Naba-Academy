import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validateEnvironment } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { JobQueueModule } from './infrastructure/jobs/job-queue.module';
import { StorageModule } from './infrastructure/storage/storage.module';

/**
 * WorkerModule encapsulates the non-HTTP execution context for asynchronous
 * background jobs, queue processors, and scheduled tasks.
 * No HTTP controllers, filters, or middleware are registered here.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnvironment,
      cache: true,
    }),
    DatabaseModule,
    RedisModule,
    JobQueueModule,
    StorageModule,
  ],
})
export class WorkerModule {}
