import { Redis } from 'ioredis';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  it('should handle unconfigured client gracefully', async () => {
    const service = new RedisService(null);
    expect(service.getClient()).toBeNull();
    expect(service.isReady()).toBe(false);
    await expect(service.ping()).rejects.toThrow('Redis client is not configured');
    await expect(service.onApplicationShutdown()).resolves.toBeUndefined();
  });

  it('should return client and status when configured', async () => {
    const mockClient = {
      status: 'ready',
      ping: jest.fn().mockResolvedValue('PONG'),
      quit: jest.fn().mockResolvedValue('OK'),
      on: jest.fn(),
    } as unknown as Redis;

    const service = new RedisService(mockClient);
    expect(service.getClient()).toBe(mockClient);
    expect(service.isReady()).toBe(true);

    const pingResult = await service.ping();
    expect(pingResult).toBe('PONG');
    expect(mockClient.ping).toHaveBeenCalled();

    await service.onApplicationShutdown('SIGTERM');
    expect(mockClient.quit).toHaveBeenCalled();
  });

  it('should handle disconnection error on shutdown gracefully', async () => {
    const mockClient = {
      status: 'ready',
      quit: jest.fn().mockRejectedValue(new Error('Connection lost')),
      disconnect: jest.fn(),
      on: jest.fn(),
    } as unknown as Redis;

    const service = new RedisService(mockClient);
    await service.onApplicationShutdown();
    expect(mockClient.disconnect).toHaveBeenCalled();
  });
});
