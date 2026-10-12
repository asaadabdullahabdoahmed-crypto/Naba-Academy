import { ConfigService } from '@nestjs/config';
import { createRedisOptions, sanitizeRedisUrl } from './redis.config';

describe('RedisConfig', () => {
  it('should sanitize Redis URLs by masking passwords', () => {
    const rawUrl = 'redis://:secretPassword123@redis-cluster.internal:6379/0';
    const sanitized = sanitizeRedisUrl(rawUrl);
    expect(sanitized).not.toContain('secretPassword123');
    expect(sanitized).toContain('***');
    expect(sanitized).toContain('redis-cluster.internal:6379');
  });

  it('should handle undefined or malformed URLs safely in sanitizer', () => {
    expect(sanitizeRedisUrl(undefined)).toBe('[NOT_CONFIGURED]');
    expect(sanitizeRedisUrl('not a valid url')).toBe('[INVALID_REDIS_URL]');
  });

  it('should build options with defaults when configured', () => {
    const mockConfigService = {
      get: jest.fn().mockReturnValue({
        url: 'redis://localhost:6379',
        connectTimeoutMs: 8000,
        maxRetriesPerRequest: 5,
      }),
    } as unknown as ConfigService;

    const { url, options } = createRedisOptions(mockConfigService);
    expect(url).toBe('redis://localhost:6379');
    expect(options.connectTimeout).toBe(8000);
    expect(options.maxRetriesPerRequest).toBe(5);
    expect(options.lazyConnect).toBe(true);
    expect(options.enableOfflineQueue).toBe(false);
  });
});
