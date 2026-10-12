import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AuthController } from '../src/modules/identity/presentation/controllers/auth.controller';
import { AuthenticationService } from '../src/modules/identity/application/services/authentication.service';
import { SessionService } from '../src/modules/identity/application/services/session.service';
import { RegistrationService } from '../src/modules/identity/application/services/registration.service';
import { EmailVerificationService } from '../src/modules/identity/application/services/email-verification.service';
import { PasswordResetService } from '../src/modules/identity/application/services/password-reset.service';
import { IdentityRateLimiterService } from '../src/modules/identity/infrastructure/security/rate-limiter.service';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { formatValidationErrors, ValidationException } from '../src/common/pipes/validation-formatter';
import {
  InvalidCredentialsException,
  SessionRevokedException,
  PasswordResetInvalidOrExpiredException,
  PasswordPolicyViolationException,
} from '../src/modules/identity/domain/identity.errors';
import { AUTH_COOKIE_NAMES } from '../src/modules/identity/infrastructure/security/cookie.config';
import { UserEntity } from '../src/modules/identity/infrastructure/persistence/entities/user.entity';

describe('Auth Endpoints & Secure Cookie Transport (e2e)', () => {
  let app: INestApplication;

  const mockSafeUser = {
    id: 'test-user-id-1234',
    email: 'student@naba.edu.sa',
    accountStatus: 'active',
    primaryRole: 'student',
    roles: [
      {
        code: 'student',
        nameAr: 'طالب',
        nameEn: 'Student',
        scopeType: 'global',
        scopeId: null,
      },
    ],
    emailVerifiedAt: '2026-01-01T00:00:00.000Z',
    lastLoginAt: '2026-01-02T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  const mockSessionTokens = {
    sessionId: 'session-id-5678',
    rawSessionToken: 'naba_test_session_token_xyz987',
    rawCsrfToken: 'naba_test_csrf_token_abc123',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };

  const mockAuthenticationService = {
    authenticate: jest.fn(),
    getUserProfile: jest.fn(),
  };

  const mockSessionService = {
    createSession: jest.fn(),
    revokeSessionByToken: jest.fn(),
    revokeSession: jest.fn(),
    validateSession: jest.fn(),
    validateCsrfToken: jest.fn(),
    rotateSessionCsrfToken: jest.fn(),
    listActiveSessions: jest.fn(),
    revokeOtherSessions: jest.fn(),
    revokeUserSession: jest.fn(),
  };

  const mockRegistrationService = {
    register: jest.fn(),
  };

  const mockEmailVerificationService = {
    verifyEmail: jest.fn(),
    resendVerification: jest.fn(),
  };

  const mockPasswordResetService = {
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  const mockRateLimiterService = {
    consume: jest.fn().mockResolvedValue({
      allowed: true,
      remaining: 10,
      resetAt: Date.now() + 60000,
    }),
    reset: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
        {
          provide: SessionService,
          useValue: mockSessionService,
        },
        {
          provide: RegistrationService,
          useValue: mockRegistrationService,
        },
        {
          provide: EmailVerificationService,
          useValue: mockEmailVerificationService,
        },
        {
          provide: PasswordResetService,
          useValue: mockPasswordResetService,
        },
        {
          provide: IdentityRateLimiterService,
          useValue: mockRateLimiterService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultVal: unknown) => {
              if (key === 'app.nodeEnv') return 'development';
              if (key === 'app.corsOrigins') return ['http://localhost:3000', 'https://naba.edu.sa'];
              if (key === 'app.trustProxy') return false;
              return defaultVal;
            }),
          },
        },
        {
          provide: APP_FILTER,
          useClass: HttpExceptionFilter,
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: TransformResponseInterceptor,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Enable cookieParser
    app.use(cookieParser());

    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        exceptionFactory: (errors) => {
          const details = formatValidationErrors(errors);
          return new ValidationException(details);
        },
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/login', () => {
    it('successfully logs in, sets both cookies, and returns safe user profile with csrfToken', async () => {
      mockAuthenticationService.authenticate.mockResolvedValue({
        id: mockSafeUser.id,
        email: mockSafeUser.email,
        normalizedEmail: mockSafeUser.email,
        accountStatus: 'active',
      });
      mockSessionService.createSession.mockResolvedValue(mockSessionTokens);
      mockAuthenticationService.getUserProfile.mockResolvedValue(mockSafeUser);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'student@naba.edu.sa',
          password: 'ValidPassword123!',
        })
        .expect(200);

      // Verify canonical ApiSuccess envelope
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.user).toEqual(mockSafeUser);
      expect(response.body.data.csrfToken).toBe(mockSessionTokens.rawCsrfToken);
      expect(response.body.data.message).toBe('Login successful');

      // Verify Set-Cookie headers
      const setCookies = response.headers['set-cookie'] as unknown as string[];
      expect(setCookies).toBeDefined();
      expect(Array.isArray(setCookies)).toBe(true);

      const sessionCookie = setCookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAMES.SESSION}=`));
      const csrfCookie = setCookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAMES.CSRF}=`));

      expect(sessionCookie).toBeDefined();
      expect(sessionCookie).toContain('HttpOnly');
      expect(sessionCookie).toContain('SameSite=Lax');
      expect(sessionCookie).toContain('Path=/');

      expect(csrfCookie).toBeDefined();
      expect(csrfCookie).not.toContain('HttpOnly'); // Intentionally client-readable
      expect(csrfCookie).toContain('SameSite=Lax');
      expect(csrfCookie).toContain('Path=/');

      // Negative assertion: Zero credential leakage in response
      const rawText = JSON.stringify(response.body);
      expect(rawText).not.toContain('password');
      expect(rawText).not.toContain('passwordHash');
    });

    it('rejects invalid credentials with 400 Bad Request and INVALID_CREDENTIALS error code', async () => {
      mockAuthenticationService.authenticate.mockRejectedValue(
        new InvalidCredentialsException('Invalid email or password'),
      );

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@naba.edu.sa',
          password: 'WrongPassword123!',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'INVALID_CREDENTIALS');
      expect(response.body.error).toHaveProperty('message', 'Invalid email or password');
      expect(response.headers['set-cookie']).toBeUndefined();
    });

    it('rejects malformed payload with 400 and structured validation details', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'not-an-email',
          password: '',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error.details).toBeInstanceOf(Array);
      expect(response.headers['set-cookie']).toBeUndefined();
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('revokes session, clears cookies, and returns success envelope when session cookie and valid CSRF token are provided', async () => {
      mockSessionService.validateSession.mockResolvedValue({
        session: { id: mockSessionTokens.sessionId, csrfTokenHash: 'mock-csrf-hash' },
        user: { id: mockSafeUser.id } as UserEntity,
      });
      mockSessionService.validateCsrfToken.mockReturnValue(true);
      mockSessionService.revokeSession.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Cookie', [
          `${AUTH_COOKIE_NAMES.SESSION}=${mockSessionTokens.rawSessionToken}`,
          `${AUTH_COOKIE_NAMES.CSRF}=${mockSessionTokens.rawCsrfToken}`,
        ])
        .set('X-CSRF-Token', mockSessionTokens.rawCsrfToken)
        .expect(200);

      expect(mockSessionService.validateSession).toHaveBeenCalledWith(
        mockSessionTokens.rawSessionToken,
      );
      expect(mockSessionService.validateCsrfToken).toHaveBeenCalledWith(
        expect.anything(),
        mockSessionTokens.rawCsrfToken,
      );
      expect(mockSessionService.revokeSession).toHaveBeenCalledWith(
        mockSessionTokens.sessionId,
        'User logged out',
      );

      expect(response.body).toEqual({
        success: true,
        data: {
          loggedOut: true,
          message: 'Logged out successfully',
        },
      });

      // Verify cookies are cleared
      const setCookies = response.headers['set-cookie'] as unknown as string[];
      expect(setCookies).toBeDefined();
      const sessionCleared = setCookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAMES.SESSION}=;`));
      const csrfCleared = setCookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAMES.CSRF}=;`));
      expect(sessionCleared).toBeDefined();
      expect(csrfCleared).toBeDefined();
    });

    it('rejects authenticated logout with 403 INVALID_CSRF_TOKEN when CSRF header is missing', async () => {
      mockSessionService.validateSession.mockResolvedValue({
        session: { id: mockSessionTokens.sessionId, csrfTokenHash: 'mock-csrf-hash' },
        user: { id: mockSafeUser.id } as UserEntity,
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Cookie', [`${AUTH_COOKIE_NAMES.SESSION}=${mockSessionTokens.rawSessionToken}`])
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'INVALID_CSRF_TOKEN');
      expect(mockSessionService.revokeSession).not.toHaveBeenCalled();
    });

    it('rejects authenticated logout with 403 INVALID_CSRF_TOKEN when CSRF header mismatches session hash', async () => {
      mockSessionService.validateSession.mockResolvedValue({
        session: { id: mockSessionTokens.sessionId, csrfTokenHash: 'mock-csrf-hash' },
        user: { id: mockSafeUser.id } as UserEntity,
      });
      mockSessionService.validateCsrfToken.mockReturnValue(false);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Cookie', [`${AUTH_COOKIE_NAMES.SESSION}=${mockSessionTokens.rawSessionToken}`])
        .set('X-CSRF-Token', 'forged-csrf-token')
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'INVALID_CSRF_TOKEN');
      expect(mockSessionService.revokeSession).not.toHaveBeenCalled();
    });

    it('succeeds idempotently even when session cookie is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          loggedOut: true,
          message: 'Logged out successfully',
        },
      });
      expect(mockSessionService.revokeSession).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns current user profile when valid session cookie is provided', async () => {
      mockSessionService.validateSession.mockResolvedValue({
        user: { id: mockSafeUser.id } as UserEntity,
        session: { id: 'session-123' },
      });
      mockAuthenticationService.getUserProfile.mockResolvedValue(mockSafeUser);

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', [`${AUTH_COOKIE_NAMES.SESSION}=${mockSessionTokens.rawSessionToken}`])
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          user: mockSafeUser,
        },
      });
      expect(mockSessionService.validateSession).toHaveBeenCalledWith(
        mockSessionTokens.rawSessionToken,
      );
      expect(response.headers['cache-control']).toContain('no-store');
    });

    it('rejects with 403 Forbidden and SESSION_REVOKED code when session cookie is absent', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'SESSION_REVOKED');
      expect(response.body.error).toHaveProperty('message');
    });

    it('rejects with 403 when session is expired or revoked', async () => {
      mockSessionService.validateSession.mockRejectedValue(
        new SessionRevokedException('Session has expired'),
      );

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', [`${AUTH_COOKIE_NAMES.SESSION}=expired-session-token`])
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'SESSION_REVOKED');
      expect(response.body.error.message).toBe('Session has expired');
    });
  });

  describe('GET /api/v1/auth/csrf', () => {
    it('returns existing CSRF token if cookie is valid and matches session hash', async () => {
      mockSessionService.validateSession.mockResolvedValue({
        user: { id: mockSafeUser.id } as UserEntity,
        session: { id: 'session-123', csrfTokenHash: 'mock-hash' },
      });
      mockSessionService.validateCsrfToken.mockReturnValue(true);

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/csrf')
        .set('Cookie', [
          `${AUTH_COOKIE_NAMES.SESSION}=${mockSessionTokens.rawSessionToken}`,
          `${AUTH_COOKIE_NAMES.CSRF}=${mockSessionTokens.rawCsrfToken}`,
        ])
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          csrfToken: mockSessionTokens.rawCsrfToken,
        },
      });
      expect(response.headers['cache-control']).toContain('no-store');
      expect(mockSessionService.rotateSessionCsrfToken).not.toHaveBeenCalled();
    });

    it('rotates CSRF token and sets new cookie when cookie is missing or invalid', async () => {
      mockSessionService.validateSession.mockResolvedValue({
        user: { id: mockSafeUser.id } as UserEntity,
        session: { id: 'session-123', csrfTokenHash: 'mock-hash' },
      });
      mockSessionService.validateCsrfToken.mockReturnValue(false);
      mockSessionService.rotateSessionCsrfToken.mockResolvedValue('newly-rotated-csrf-token');

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/csrf')
        .set('Cookie', [`${AUTH_COOKIE_NAMES.SESSION}=${mockSessionTokens.rawSessionToken}`])
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          csrfToken: 'newly-rotated-csrf-token',
        },
      });

      const setCookies = response.headers['set-cookie'] as unknown as string[];
      expect(setCookies).toBeDefined();
      const csrfCookie = setCookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAMES.CSRF}=`));
      expect(csrfCookie).toBeDefined();
      expect(csrfCookie).toContain('newly-rotated-csrf-token');
    });

    it('rejects with 403 Forbidden when unauthenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/csrf')
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'SESSION_REVOKED');
    });
  });

  describe('Active Sessions Management (e2e)', () => {
    it('GET /api/v1/auth/sessions returns active sessions list', async () => {
      const mockSessionsList = [
        {
          id: 'session-1',
          device: 'MacBook Pro',
          browser: 'Chrome',
          ipAddress: '127.0.0.1',
          createdAt: '2026-01-01T00:00:00.000Z',
          lastActiveAt: '2026-01-01T00:00:00.000Z',
          isCurrent: true,
        },
      ];

      mockSessionService.validateSession.mockResolvedValue({
        user: { id: mockSafeUser.id } as UserEntity,
        session: { id: 'session-1', csrfTokenHash: 'mock-hash' },
      });
      mockSessionService.listActiveSessions.mockResolvedValue({
        sessions: mockSessionsList,
        currentSessionId: 'session-1',
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/sessions')
        .set('Cookie', [`${AUTH_COOKIE_NAMES.SESSION}=${mockSessionTokens.rawSessionToken}`])
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          sessions: mockSessionsList,
          currentSessionId: 'session-1',
        },
      });
      expect(response.headers['cache-control']).toContain('no-store');
    });

    it('POST /api/v1/auth/sessions/logout-others revokes other sessions when authenticated with CSRF', async () => {
      mockSessionService.validateSession.mockResolvedValue({
        user: { id: mockSafeUser.id } as UserEntity,
        session: { id: 'session-1', csrfTokenHash: 'mock-hash' },
      });
      mockSessionService.validateCsrfToken.mockReturnValue(true);
      mockSessionService.revokeOtherSessions.mockResolvedValue(3);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/sessions/logout-others')
        .set('Cookie', [
          `${AUTH_COOKIE_NAMES.SESSION}=${mockSessionTokens.rawSessionToken}`,
          `${AUTH_COOKIE_NAMES.CSRF}=${mockSessionTokens.rawCsrfToken}`,
        ])
        .set('X-CSRF-Token', mockSessionTokens.rawCsrfToken)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          revokedCount: 3,
          message: 'Other sessions logged out successfully',
        },
      });
      expect(mockSessionService.revokeOtherSessions).toHaveBeenCalledWith(
        mockSafeUser.id,
        'session-1',
      );
    });

    it('POST /api/v1/auth/sessions/logout-others blocks request without CSRF token header', async () => {
      mockSessionService.validateSession.mockResolvedValue({
        user: { id: mockSafeUser.id } as UserEntity,
        session: { id: 'session-1', csrfTokenHash: 'mock-hash' },
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/sessions/logout-others')
        .set('Cookie', [`${AUTH_COOKIE_NAMES.SESSION}=${mockSessionTokens.rawSessionToken}`])
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'INVALID_CSRF_TOKEN');
      expect(mockSessionService.revokeOtherSessions).not.toHaveBeenCalled();
    });

    it('DELETE /api/v1/auth/sessions/:id revokes targeted session with CSRF protection', async () => {
      mockSessionService.validateSession.mockResolvedValue({
        user: { id: mockSafeUser.id } as UserEntity,
        session: { id: 'session-1', csrfTokenHash: 'mock-hash' },
      });
      mockSessionService.validateCsrfToken.mockReturnValue(true);
      mockSessionService.revokeUserSession.mockResolvedValue(true);

      const response = await request(app.getHttpServer())
        .delete('/api/v1/auth/sessions/session-2')
        .set('Cookie', [
          `${AUTH_COOKIE_NAMES.SESSION}=${mockSessionTokens.rawSessionToken}`,
          `${AUTH_COOKIE_NAMES.CSRF}=${mockSessionTokens.rawCsrfToken}`,
        ])
        .set('X-CSRF-Token', mockSessionTokens.rawCsrfToken)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          revoked: true,
          message: 'Session revoked successfully',
        },
      });
      expect(mockSessionService.revokeUserSession).toHaveBeenCalledWith(
        mockSafeUser.id,
        'session-2',
      );
    });

    it('DELETE /api/v1/auth/sessions/:id blocks request without CSRF token header', async () => {
      mockSessionService.validateSession.mockResolvedValue({
        user: { id: mockSafeUser.id } as UserEntity,
        session: { id: 'session-1', csrfTokenHash: 'mock-hash' },
      });

      const response = await request(app.getHttpServer())
        .delete('/api/v1/auth/sessions/session-2')
        .set('Cookie', [`${AUTH_COOKIE_NAMES.SESSION}=${mockSessionTokens.rawSessionToken}`])
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'INVALID_CSRF_TOKEN');
      expect(mockSessionService.revokeUserSession).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/auth/register (Role Escalation & Anti-Enumeration Hotfix)', () => {
    it('strictly rejects registration payload containing unauthorized roleCode (e.g. system_admin) with 400 Bad Request', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'attacker@naba.edu.sa',
          password: 'StrongAttackerPassword2026!',
          roleCode: 'system_admin',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      // Registration service must never be invoked when non-whitelisted property roleCode is injected
      expect(mockRegistrationService.register).not.toHaveBeenCalled();
    });

    it('rejects registration with invalid or missing email/password with 400 Bad Request', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'not-an-email',
          password: '',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(mockRegistrationService.register).not.toHaveBeenCalled();
    });

    it('successfully processes valid public registration and returns 202 Accepted with anti-enumeration response', async () => {
      mockRegistrationService.register.mockResolvedValue({
        status: 'verification_required',
        message:
          'If this email address is eligible for an account, a verification email has been sent.',
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'student@naba.edu.sa',
          password: 'StrongStudentPassword2026!',
        })
        .expect(202);

      expect(response.body).toEqual({
        success: true,
        data: {
          status: 'verification_required',
          message:
            'If this email address is eligible for an account, a verification email has been sent.',
        },
      });
      expect(mockRegistrationService.register).toHaveBeenCalledWith({
        email: 'student@naba.edu.sa',
        password: 'StrongStudentPassword2026!',
      });
    });
  });

  describe('POST /api/v1/auth/resend-verification', () => {
    it('returns 200 OK with anti-enumeration generic message', async () => {
      mockEmailVerificationService.resendVerification.mockResolvedValue({
        success: true,
        message:
          'If an unverified account exists with this email address, a new verification link has been sent.',
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/resend-verification')
        .send({
          email: 'student@naba.edu.sa',
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message:
          'If an unverified account exists with this email address, a new verification link has been sent.',
      });
      expect(mockEmailVerificationService.resendVerification).toHaveBeenCalledWith(
        'student@naba.edu.sa',
      );
    });

    it('rejects resend-verification with invalid email with 400 Bad Request', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/resend-verification')
        .send({
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/forgot-password (STEP 07D-1)', () => {
    it('returns 202 Accepted with neutral anti-enumeration envelope for valid email', async () => {
      mockPasswordResetService.forgotPassword.mockResolvedValue({
        accepted: true,
        message:
          'If the account is eligible, password reset instructions have been sent.',
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'student@naba.edu.sa',
        })
        .expect(202);

      expect(response.body).toEqual({
        success: true,
        data: {
          accepted: true,
          message:
            'If the account is eligible, password reset instructions have been sent.',
        },
      });
      expect(mockPasswordResetService.forgotPassword).toHaveBeenCalledWith({
        email: 'student@naba.edu.sa',
      });
    });

    it('returns 202 Accepted with neutral envelope when locale is explicitly supplied', async () => {
      mockPasswordResetService.forgotPassword.mockResolvedValue({
        accepted: true,
        message:
          'If the account is eligible, password reset instructions have been sent.',
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'student@naba.edu.sa',
          locale: 'en',
        })
        .expect(202);

      expect(response.body).toEqual({
        success: true,
        data: {
          accepted: true,
          message:
            'If the account is eligible, password reset instructions have been sent.',
        },
      });
      expect(mockPasswordResetService.forgotPassword).toHaveBeenCalledWith({
        email: 'student@naba.edu.sa',
        locale: 'en',
      });
    });

    it('returns identical 202 Accepted envelope for unknown/non-eligible email without leaking existence', async () => {
      mockPasswordResetService.forgotPassword.mockResolvedValue({
        accepted: true,
        message:
          'If the account is eligible, password reset instructions have been sent.',
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'unknown-user@example.com',
        })
        .expect(202);

      expect(response.body).toEqual({
        success: true,
        data: {
          accepted: true,
          message:
            'If the account is eligible, password reset instructions have been sent.',
        },
      });
    });

    it('rejects unexpected extra properties (e.g. roleCode) with 400 Bad Request (VALIDATION_ERROR)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'student@naba.edu.sa',
          roleCode: 'system_admin',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(mockPasswordResetService.forgotPassword).not.toHaveBeenCalled();
    });

    it('rejects invalid email with 400 Bad Request (VALIDATION_ERROR)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'not-an-email',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('rejects invalid locale with 400 Bad Request (VALIDATION_ERROR)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'student@naba.edu.sa',
          locale: 'fr',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/reset-password (STEP 07D-4)', () => {
    it('successfully resets password, returns 200 OK, and clears existing session cookies', async () => {
      mockPasswordResetService.resetPassword.mockResolvedValue({
        success: true,
        message:
          'Password has been reset successfully. Please log in with your new password.',
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .set('Cookie', [`${AUTH_COOKIE_NAMES.SESSION}=old-session-token`])
        .send({
          token: 'valid-reset-token-256bit',
          password: 'NewStrongPassword2026!',
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message:
          'Password has been reset successfully. Please log in with your new password.',
      });

      // Verify session cookie was cleared
      const setCookie = response.headers['set-cookie'];
      expect(setCookie).toBeDefined();
      const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie as unknown as string];
      expect(
        cookieArray.some((c: string) => c.includes(`${AUTH_COOKIE_NAMES.SESSION}=;`)),
      ).toBe(true);

      expect(mockPasswordResetService.resetPassword).toHaveBeenCalledWith({
        token: 'valid-reset-token-256bit',
        password: 'NewStrongPassword2026!',
      });
    });

    it('returns 400 Bad Request with PASSWORD_RESET_INVALID_OR_EXPIRED when token is invalid or expired', async () => {
      mockPasswordResetService.resetPassword.mockRejectedValue(
        new PasswordResetInvalidOrExpiredException(),
      );

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'invalid-or-expired-token',
          password: 'NewStrongPassword2026!',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty(
        'code',
        'PASSWORD_RESET_INVALID_OR_EXPIRED',
      );
    });

    it('returns 400 Bad Request with PASSWORD_POLICY_VIOLATION when password fails policy', async () => {
      mockPasswordResetService.resetPassword.mockRejectedValue(
        new PasswordPolicyViolationException('Password must be at least 12 characters long'),
      );

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'valid-token',
          password: 'short',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'PASSWORD_POLICY_VIOLATION');
    });

    it('rejects unexpected properties (e.g. email, userId) with 400 Bad Request (VALIDATION_ERROR)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'valid-token',
          password: 'NewStrongPassword2026!',
          email: 'student@naba.edu.sa',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(mockPasswordResetService.resetPassword).not.toHaveBeenCalled();
    });
  });

  describe('STEP 07E: Security Hardening & Adversarial Regression Suite', () => {
    it('blocks public role escalation: rejects injected roleCode or isAdmin with 400 VALIDATION_ERROR', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'escalation@naba.edu.sa',
          password: 'ValidPassword123!',
          firstNameAr: 'مهاجم',
          lastNameAr: 'أكاديمي',
          roleCode: 'super_admin',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(mockRegistrationService.register).not.toHaveBeenCalled();
    });

    it('enforces Origin allowlist: blocks state-changing POST with untrusted Origin (403 ORIGIN_FORBIDDEN)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('Origin', 'https://malicious-attacker.com')
        .send({
          email: 'student@naba.edu.sa',
          password: 'ValidPassword123!',
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'ORIGIN_FORBIDDEN');
    });

    it('enforces Referer allowlist: blocks state-changing POST with untrusted Referer (403 ORIGIN_FORBIDDEN)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('Referer', 'https://phishing-site.org/fake-login')
        .send({
          email: 'student@naba.edu.sa',
          password: 'ValidPassword123!',
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'ORIGIN_FORBIDDEN');
    });

    it('enforces Sec-Fetch-Site cross-site block without trusted Origin (403 ORIGIN_FORBIDDEN)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .set('Sec-Fetch-Site', 'cross-site')
        .send({
          email: 'crosssite@naba.edu.sa',
          password: 'ValidPassword123!',
          firstNameAr: 'أحمد',
          lastNameAr: 'سالم',
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'ORIGIN_FORBIDDEN');
    });

    it('enforces rate limiting: returns 429 TOO_MANY_REQUESTS when limit is exceeded', async () => {
      mockRateLimiterService.consume.mockResolvedValueOnce({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 60000,
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'student@naba.edu.sa',
          password: 'ValidPassword123!',
        })
        .expect(429);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'TOO_MANY_REQUESTS');
    });

    it('preserves anti-enumeration: returns identical 202 structure for forgot-password', async () => {
      mockPasswordResetService.forgotPassword.mockResolvedValue({
        success: true,
        data: {
          accepted: true,
          message: 'If the account is eligible, password reset instructions have been sent.',
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nonexistent@naba.edu.sa' })
        .expect(202);

      expect(response.body).toEqual({
        success: true,
        data: {
          accepted: true,
          message: 'If the account is eligible, password reset instructions have been sent.',
        },
      });
      expect(response.body).not.toHaveProperty('userId');
      expect(response.body).not.toHaveProperty('token');
    });

    it('guarantees sensitive authentication secrets are never leaked in responses', async () => {
      mockAuthenticationService.authenticate.mockResolvedValue({
        id: 'user-123',
        email: 'student@naba.edu.sa',
      });
      mockSessionService.createSession.mockResolvedValue({
        sessionId: 'session-123',
        rawSessionToken: 'session-secret-token',
        rawCsrfToken: 'csrf-secret-token',
      });
      mockAuthenticationService.getUserProfile.mockResolvedValue(mockSafeUser);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'student@naba.edu.sa',
          password: 'ValidPassword123!',
        })
        .expect(200);

      const jsonString = JSON.stringify(response.body);
      expect(jsonString).not.toContain('passwordHash');
      expect(jsonString).not.toContain('sessionSecret');
      expect(jsonString).not.toContain('tokenHash');
      expect(jsonString).not.toContain('csrfTokenHash');
    });
  });
});
