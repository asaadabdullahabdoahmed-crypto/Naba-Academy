import { RedisHealthService } from './redis-health.service';
import { RedisService } from './redis.service';

describe('RedisHealthService', () => {
  it('should return "down" when RedisService has no client', async () => {
    const mockRedisService = {
      getClient: jest.fn().mockReturnValue(null),
      ping: jest.fn(),
    } as unknown as RedisService;

    const healthService = new RedisHealthService(mockRedisService);
    const result = await healthService.check();
    expect(result).toBe('down');
  });

  it('should return "up" when Redis responds with "PONG"', async () => {
    const mockRedisService = {
      getClient: jest.fn().mockReturnValue({}),
      ping: jest.fn().mockResolvedValue('PONG'),
    } as unknown as RedisService;

    const healthService = new RedisHealthService(mockRedisService);
    const result = await healthService.check();
    expect(result).toBe('up');
  });

  it('should return "down" when Redis ping throws an error', async () => {
    const mockRedisService = {
      getClient: jest.fn().mockReturnValue({}),
      ping: jest.fn().mockRejectedValue(new Error('ECONNREFUSED 127.0.0.1:6379')),
    } as unknown as RedisService;

    const healthService = new RedisHealthService(mockRedisService);
    const result = await healthService.check();
    expect(result).toBe('down');
  });
});
