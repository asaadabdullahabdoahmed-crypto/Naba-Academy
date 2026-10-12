import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { DatabaseHealthService } from '../../database/database-health.service';
import { RedisHealthService } from '../../infrastructure/redis/redis-health.service';
import { S3StorageService } from '../../infrastructure/storage/s3-storage.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;
  let dbHealthService: DatabaseHealthService;
  let redisHealthService: RedisHealthService;
  let storageService: S3StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: DatabaseHealthService,
          useValue: {
            check: jest.fn().mockResolvedValue('up'),
          },
        },
        {
          provide: RedisHealthService,
          useValue: {
            check: jest.fn().mockResolvedValue('up'),
          },
        },
        {
          provide: S3StorageService,
          useValue: {
            checkHealth: jest.fn().mockResolvedValue('unconfigured'),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
    dbHealthService = module.get<DatabaseHealthService>(DatabaseHealthService);
    redisHealthService = module.get<RedisHealthService>(RedisHealthService);
    storageService = module.get<S3StorageService>(S3StorageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(dbHealthService).toBeDefined();
    expect(redisHealthService).toBeDefined();
    expect(storageService).toBeDefined();
  });

  it('should return valid health status response when db and redis are up', async () => {
    const result = await controller.getHealth();
    expect(result).toBeDefined();
    expect(result.status).toBe('ok');
    expect(result.service).toBe('naba-api');
    expect(result.dependencies.database).toBe('up');
    expect(result.dependencies.redis).toBe('up');
    expect(typeof result.timestamp).toBe('string');
    expect(new Date(result.timestamp).getTime()).not.toBeNaN();
  });

  it('should return degraded health status when db is down', async () => {
    jest.spyOn(dbHealthService, 'check').mockResolvedValueOnce('down');
    const result = await controller.getHealth();
    expect(result.status).toBe('degraded');
    expect(result.dependencies.database).toBe('down');
  });

  it('should return degraded health status when redis is down', async () => {
    jest.spyOn(redisHealthService, 'check').mockResolvedValueOnce('down');
    const result = await controller.getHealth();
    expect(result.status).toBe('degraded');
    expect(result.dependencies.redis).toBe('down');
  });

  it('should include storage status when configured', async () => {
    jest.spyOn(storageService, 'checkHealth').mockResolvedValueOnce('up');
    const result = await controller.getHealth();
    expect(result.dependencies.storage).toBe('up');
  });

  it('CRITICAL: health response must NEVER leak credentials, URLs, hostnames, or connection strings', async () => {
    const result = await controller.getHealth();
    const serialized = JSON.stringify(result);

    // Verify presence of only expected safe keys
    expect(Object.keys(result).sort()).toEqual(['dependencies', 'service', 'status', 'timestamp']);
    expect(Object.keys(result.dependencies).sort()).toEqual(['database', 'redis', 'storage']);

    // Ensure strictly safe string statuses
    expect(['up', 'down']).toContain(result.dependencies.database);
    expect(['up', 'down']).toContain(result.dependencies.redis);
    expect(['up', 'down', 'unconfigured']).toContain(result.dependencies.storage);

    // Strict negative assertion: no passwords, tokens, URLs, hostnames, or driver errors
    expect(serialized).not.toMatch(/redis:\/\//i);
    expect(serialized).not.toMatch(/postgres:\/\//i);
    expect(serialized).not.toMatch(/password/i);
    expect(serialized).not.toMatch(/secret/i);
    expect(serialized).not.toMatch(/token/i);
    expect(serialized).not.toMatch(/localhost/i);
    expect(serialized).not.toMatch(/127\.0\.0\.1/i);
    expect(serialized).not.toMatch(/stack/i);
  });
});

