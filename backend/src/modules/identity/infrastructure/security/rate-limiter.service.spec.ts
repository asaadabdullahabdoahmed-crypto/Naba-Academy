import { IdentityRateLimiterService } from './rate-limiter.service';
import { RedisService } from '../../../../infrastructure/redis/redis.service';

describe('IdentityRateLimiterService', () => {
  let service: IdentityRateLimiterService;
  let redisService: jest.Mocked<Partial<RedisService>>;

  beforeEach(() => {
    redisService = {
      isReady: jest.fn().mockReturnValue(false),
      getClient: jest.fn().mockReturnValue(null),
    };
    service = new IdentityRateLimiterService(redisService as RedisService);
  });

  describe('In-memory fallback (when Redis unavailable)', () => {
    it('allows requests within limit and denies requests exceeding limit', async () => {
      const action = 'login';
      const ip = '192.168.1.100';
      const limit = 3;
      const windowSeconds = 60;

      const res1 = await service.consume(action, ip, limit, windowSeconds);
      expect(res1.allowed).toBe(true);
      expect(res1.remaining).toBe(2);

      const res2 = await service.consume(action, ip, limit, windowSeconds);
      expect(res2.allowed).toBe(true);
      expect(res2.remaining).toBe(1);

      const res3 = await service.consume(action, ip, limit, windowSeconds);
      expect(res3.allowed).toBe(true);
      expect(res3.remaining).toBe(0);

      const res4 = await service.consume(action, ip, limit, windowSeconds);
      expect(res4.allowed).toBe(false);
      expect(res4.remaining).toBe(0);
    });

    it('resets counter when reset is called', async () => {
      const action = 'login';
      const ip = '192.168.1.101';
      await service.consume(action, ip, 1, 60);

      await service.reset(action, ip);

      const res = await service.consume(action, ip, 1, 60);
      expect(res.allowed).toBe(true);
    });
  });

  describe('Redis mode and failure policy', () => {
    it('uses Redis client when connected and ready', async () => {
      const mockClient = {
        incr: jest.fn().mockResolvedValue(1),
        expire: jest.fn().mockResolvedValue(1),
        ttl: jest.fn().mockResolvedValue(55),
      };
      redisService.isReady = jest.fn().mockReturnValue(true);
      redisService.getClient = jest.fn().mockReturnValue(mockClient as any);

      const res = await service.consume('register', '10.0.0.5', 5, 60);
      expect(res.allowed).toBe(true);
      expect(mockClient.incr).toHaveBeenCalledWith('rl:register:10.0.0.5');
      expect(mockClient.expire).toHaveBeenCalledWith('rl:register:10.0.0.5', 60);
    });

    it('falls back to memory and does NOT become unlimited when Redis throws error', async () => {
      const mockClient = {
        incr: jest.fn().mockRejectedValue(new Error('Connection reset by peer')),
      };
      redisService.isReady = jest.fn().mockReturnValue(true);
      redisService.getClient = jest.fn().mockReturnValue(mockClient as any);

      // Should not throw, should fall back to memory
      const res1 = await service.consume('forgot-password', '10.0.0.99', 1, 60);
      expect(res1.allowed).toBe(true);

      const res2 = await service.consume('forgot-password', '10.0.0.99', 1, 60);
      expect(res2.allowed).toBe(false); // Limited! Failure policy protects service.
    });
  });
});
