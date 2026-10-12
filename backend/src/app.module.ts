import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import configuration from './config/configuration';
import { validateEnvironment } from './config/env.validation';
import { HealthModule } from './modules/health/health.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { JobQueueModule } from './infrastructure/jobs/job-queue.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { IdentityModule } from './modules/identity/identity.module';
import { AppController } from './app.controller';
import { TraceIdMiddleware } from './common/middleware/trace-id.middleware';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';

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
    IdentityModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(cookieParser(), TraceIdMiddleware).forRoutes('*');
  }
}
