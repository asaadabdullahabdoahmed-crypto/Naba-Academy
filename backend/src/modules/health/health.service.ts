import { Injectable } from '@nestjs/common';
import { DatabaseHealthService, DatabaseHealthStatus } from '../../database/database-health.service';
import { RedisHealthService } from '../../infrastructure/redis/redis-health.service';
import { S3StorageService } from '../../infrastructure/storage/s3-storage.service';

export interface HealthDependencies {
  database: DatabaseHealthStatus;
  redis: 'up' | 'down';
  storage: 'up' | 'down' | 'unconfigured';
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded';
  service: 'naba-api';
  timestamp: string;
  dependencies: HealthDependencies;
}

@Injectable()
export class HealthService {
  constructor(
    private readonly dbHealthService: DatabaseHealthService,
    private readonly redisHealthService: RedisHealthService,
    private readonly storageService: S3StorageService,
  ) {}

  async check(): Promise<HealthCheckResponse> {
    const dbStatus = await this.dbHealthService.check();
    const redisStatus = await this.redisHealthService.check();
    const storageStatus = await this.storageService.checkHealth();

    const isHealthy = dbStatus === 'up' && redisStatus === 'up';

    const dependencies: HealthDependencies = {
      database: dbStatus,
      redis: redisStatus,
      storage: storageStatus,
    };

    return {
      status: isHealthy ? 'ok' : 'degraded',
      service: 'naba-api',
      timestamp: new Date().toISOString(),
      dependencies,
    };
  }
}
