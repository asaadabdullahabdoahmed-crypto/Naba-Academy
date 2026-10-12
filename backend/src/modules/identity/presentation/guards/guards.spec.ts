import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SessionAuthGuard } from './session-auth.guard';
import { CsrfGuard } from './csrf.guard';
import { OriginRefererGuard } from './origin-referer.guard';
import { RateLimiterGuard } from './rate-limiter.guard';
import { SessionService } from '../../application/services/session.service';
import { IdentityRateLimiterService } from '../../infrastructure/security/rate-limiter.service';
import {
  SessionRevokedException,
  InvalidCsrfTokenException,
  RateLimitExceededException,
  InvalidOriginException,
} from '../../domain/identity.errors';
import { UserEntity } from '../../infrastructure/persistence/entities/user.entity';
import { UserSessionEntity } from '../../infrastructure/persistence/entities/user-session.entity';
import { AUTH_COOKIE_NAMES } from '../../infrastructure/security/cookie.config';

describe('Identity Presentation Guards', () => {
  let sessionService: jest.Mocked<Partial<SessionService>>;

  beforeEach(() => {
    sessionService = {
      validateSession: jest.fn(),
      validateCsrfToken: jest.fn(),
    };
  });

  function createMockExecutionContext(req: Record<string, unknown>): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => ({ setHeader: jest.fn() }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  }

  describe('SessionAuthGuard', () => {
    let guard: SessionAuthGuard;

    beforeEach(() => {
      guard = new SessionAuthGuard(sessionService as SessionService);
    });

    it('throws SessionRevokedException when session cookie is missing', async () => {
      const req = {
        cookies: {},
        headers: {},
      };
      const context = createMockExecutionContext(req);

      await expect(guard.canActivate(context)).rejects.toThrow(
        SessionRevokedException,
      );
    });

    it('validates session and attaches session and user to request when cookie is present', async () => {
      const mockUser = { id: 'user-123', email: 'test@naba.edu.sa' } as UserEntity;
      const mockSession = { id: 'session-456', userId: 'user-123' } as UserSessionEntity;

      sessionService.validateSession = jest.fn().mockResolvedValue({
        user: mockUser,
        session: mockSession,
      });

      const req: Record<string, unknown> = {
        cookies: {
          [AUTH_COOKIE_NAMES.SESSION]: 'valid-session-token',
        },
        headers: {},
      };
      const context = createMockExecutionContext(req);

      const canActivate = await guard.canActivate(context);

      expect(canActivate).toBe(true);
      expect(sessionService.validateSession).toHaveBeenCalledWith('valid-session-token');
      expect(req.user).toBe(mockUser);
      expect(req.session).toBe(mockSession);
    });

    it('propagates exception when sessionService.validateSession throws', async () => {
      sessionService.validateSession = jest.fn().mockRejectedValue(
        new SessionRevokedException('Session expired'),
      );

      const req = {
        cookies: {
          [AUTH_COOKIE_NAMES.SESSION]: 'expired-token',
        },
      };
      const context = createMockExecutionContext(req);

      await expect(guard.canActivate(context)).rejects.toThrow(
        SessionRevokedException,
      );
    });
  });

  describe('CsrfGuard', () => {
    let guard: CsrfGuard;

    beforeEach(() => {
      guard = new CsrfGuard(sessionService as SessionService);
    });

    it('permits safe GET, HEAD, and OPTIONS requests without checking CSRF token', async () => {
      for (const method of ['GET', 'HEAD', 'OPTIONS']) {
        const req = { method, headers: {} };
        const context = createMockExecutionContext(req);
        expect(await guard.canActivate(context)).toBe(true);
      }
    });

    it('rejects POST request when CSRF token header is missing', async () => {
      const req = { method: 'POST', headers: {} };
      const context = createMockExecutionContext(req);

      await expect(guard.canActivate(context)).rejects.toThrow(InvalidCsrfTokenException);
    });

    it('rejects POST request when no active session exists (arbitrary cookie rejection)', async () => {
      const req = {
        method: 'POST',
        headers: {
          'x-csrf-token': 'arbitrary-csrf-token',
        },
        cookies: {
          [AUTH_COOKIE_NAMES.CSRF]: 'arbitrary-csrf-token',
        },
      };
      const context = createMockExecutionContext(req);

      await expect(guard.canActivate(context)).rejects.toThrow(InvalidCsrfTokenException);
    });

    it('validates CSRF token against active session when session is attached', async () => {
      const mockSession = {
        id: 'session-1',
        csrfTokenHash: 'expected-hash',
      } as UserSessionEntity;

      sessionService.validateCsrfToken = jest.fn().mockReturnValue(true);

      const req = {
        method: 'POST',
        headers: {
          'x-csrf-token': 'submitted-csrf-token',
        },
        session: mockSession,
      };
      const context = createMockExecutionContext(req);

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
      expect(sessionService.validateCsrfToken).toHaveBeenCalledWith(
        mockSession,
        'submitted-csrf-token',
      );
    });

    it('rejects POST request when CSRF token does not match active session', async () => {
      const mockSession = {
        id: 'session-1',
        csrfTokenHash: 'expected-hash',
      } as UserSessionEntity;

      sessionService.validateCsrfToken = jest.fn().mockReturnValue(false);

      const req = {
        method: 'POST',
        headers: {
          'x-csrf-token': 'wrong-csrf-token',
        },
        session: mockSession,
      };
      const context = createMockExecutionContext(req);

      await expect(guard.canActivate(context)).rejects.toThrow(InvalidCsrfTokenException);
    });

    it('validates session from cookie and checks CSRF token when session is not pre-attached', async () => {
      const mockSession = {
        id: 'session-from-cookie',
        csrfTokenHash: 'session-csrf-hash',
      } as UserSessionEntity;

      sessionService.validateSession = jest.fn().mockResolvedValue({
        session: mockSession,
        user: { id: 'user-1' },
      });
      sessionService.validateCsrfToken = jest.fn().mockReturnValue(true);

      const req = {
        method: 'POST',
        headers: {
          'x-csrf-token': 'valid-csrf-token',
        },
        cookies: {
          [AUTH_COOKIE_NAMES.SESSION]: 'raw-session-token',
          [AUTH_COOKIE_NAMES.CSRF]: 'valid-csrf-token',
        },
      };
      const context = createMockExecutionContext(req);

      expect(await guard.canActivate(context)).toBe(true);
      expect(sessionService.validateSession).toHaveBeenCalledWith('raw-session-token');
      expect(sessionService.validateCsrfToken).toHaveBeenCalledWith(mockSession, 'valid-csrf-token');
    });

    it('rejects when double-submit cookie mismatches header even if session is valid', async () => {
      const mockSession = {
        id: 'session-1',
        csrfTokenHash: 'expected-hash',
      } as UserSessionEntity;

      sessionService.validateCsrfToken = jest.fn().mockReturnValue(true);

      const req = {
        method: 'POST',
        headers: {
          'x-csrf-token': 'token-a',
        },
        cookies: {
          [AUTH_COOKIE_NAMES.CSRF]: 'token-b',
        },
        session: mockSession,
      };
      const context = createMockExecutionContext(req);

      await expect(guard.canActivate(context)).rejects.toThrow(InvalidCsrfTokenException);
    });
  });

  describe('OriginRefererGuard', () => {
    let guard: OriginRefererGuard;
    let configService: ConfigService;

    beforeEach(() => {
      configService = {
        get: jest.fn().mockReturnValue(['http://localhost:3000', 'https://naba.edu.sa']),
      } as unknown as ConfigService;
      guard = new OriginRefererGuard(configService);
    });

    it('passes safe GET requests without checking Origin', () => {
      const req = {
        method: 'GET',
        headers: { origin: 'https://evil-attacker.com' },
      };
      const context = createMockExecutionContext(req);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('allows state-changing POST when Origin is in the trusted allowlist', () => {
      const req = {
        method: 'POST',
        headers: { origin: 'https://naba.edu.sa' },
      };
      const context = createMockExecutionContext(req);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('blocks state-changing POST when Origin is NOT in allowlist', () => {
      const req = {
        method: 'POST',
        headers: { origin: 'https://malicious-site.com' },
      };
      const context = createMockExecutionContext(req);
      expect(() => guard.canActivate(context)).toThrow(InvalidOriginException);
    });

    it('allows state-changing POST when Referer matches trusted allowlist and Origin is missing', () => {
      const req = {
        method: 'POST',
        headers: { referer: 'https://naba.edu.sa/ar/auth/login' },
      };
      const context = createMockExecutionContext(req);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('blocks state-changing POST when Referer is untrusted', () => {
      const req = {
        method: 'POST',
        headers: { referer: 'https://evil.org/phishing' },
      };
      const context = createMockExecutionContext(req);
      expect(() => guard.canActivate(context)).toThrow(InvalidOriginException);
    });

    it('blocks state-changing POST with sec-fetch-site: cross-site without trusted Origin', () => {
      const req = {
        method: 'POST',
        headers: { 'sec-fetch-site': 'cross-site' },
      };
      const context = createMockExecutionContext(req);
      expect(() => guard.canActivate(context)).toThrow(InvalidOriginException);
    });
  });

  describe('RateLimiterGuard', () => {
    let guard: RateLimiterGuard;
    let reflector: jest.Mocked<Reflector>;
    let rateLimiterService: jest.Mocked<IdentityRateLimiterService>;
    let configService: ConfigService;

    beforeEach(() => {
      reflector = {
        getAllAndOverride: jest.fn(),
      } as unknown as jest.Mocked<Reflector>;

      rateLimiterService = {
        consume: jest.fn(),
      } as unknown as jest.Mocked<IdentityRateLimiterService>;

      configService = {
        get: jest.fn().mockReturnValue(false),
      } as unknown as ConfigService;

      guard = new RateLimiterGuard(reflector, rateLimiterService, configService);
    });

    it('skips check if endpoint has no rate limit metadata', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      const req = { socket: { remoteAddress: '127.0.0.1' }, headers: {} };
      const context = createMockExecutionContext(req);

      expect(await guard.canActivate(context)).toBe(true);
    });

    it('consumes token and allows request when within rate limit', async () => {
      reflector.getAllAndOverride.mockReturnValue({
        action: 'login',
        limit: 5,
        windowSeconds: 60,
      });
      rateLimiterService.consume.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetAt: Date.now() + 60000,
      });

      const setHeader = jest.fn();
      const req = { socket: { remoteAddress: '192.168.1.1' }, headers: {} };
      const context = {
        switchToHttp: () => ({
          getRequest: () => req,
          getResponse: () => ({ setHeader }),
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as unknown as ExecutionContext;

      expect(await guard.canActivate(context)).toBe(true);
      expect(setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '5');
      expect(setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '4');
    });

    it('throws RateLimitExceededException when rate limit is exceeded', async () => {
      reflector.getAllAndOverride.mockReturnValue({
        action: 'login',
        limit: 5,
        windowSeconds: 60,
      });
      rateLimiterService.consume.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 60000,
      });

      const req = { socket: { remoteAddress: '192.168.1.1' }, headers: {} };
      const context = {
        switchToHttp: () => ({
          getRequest: () => req,
          getResponse: () => ({ setHeader: jest.fn() }),
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as unknown as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(RateLimitExceededException);
    });
  });
});
