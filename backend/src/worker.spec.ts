import { Test, TestingModule } from '@nestjs/testing';
import { WorkerModule } from './worker.module';
import { DatabaseHealthService } from './database/database-health.service';
import { TransactionService } from './database/transaction.service';
import { DataSource } from 'typeorm';
import { REDIS_CLIENT } from './infrastructure/redis/redis.constants';
import { RedisService } from './infrastructure/redis/redis.service';

describe('Worker Process Bootstrap', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [WorkerModule],
    })
      .overrideProvider(DataSource)
      .useValue({
        isInitialized: true,
        query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
        destroy: jest.fn().mockResolvedValue(undefined),
      })
      .overrideProvider(DatabaseHealthService)
      .useValue({ check: jest.fn().mockResolvedValue('up') })
      .overrideProvider(TransactionService)
      .useValue({ run: jest.fn() })
      .overrideProvider(REDIS_CLIENT)
      .useValue(null)
      .overrideProvider(RedisService)
      .useValue({
        getClient: () => null,
        isReady: () => false,
        ping: jest.fn().mockRejectedValue(new Error('Not configured')),
        onApplicationShutdown: jest.fn().mockResolvedValue(undefined),
      })
      .compile();
  });

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it('should successfully compile WorkerModule without HTTP server dependencies', () => {
    expect(moduleRef).toBeDefined();
    const redisService = moduleRef.get(RedisService);
    expect(redisService).toBeDefined();
  });
});
