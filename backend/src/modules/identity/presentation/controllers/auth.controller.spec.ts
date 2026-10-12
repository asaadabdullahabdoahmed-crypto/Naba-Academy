import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { RegistrationService } from '../../application/services/registration.service';
import { EmailVerificationService } from '../../application/services/email-verification.service';
import {
  AuthenticationService,
  SafeUserProfile,
} from '../../application/services/authentication.service';
import { SessionService } from '../../application/services/session.service';
import { PasswordResetService } from '../../application/services/password-reset.service';
import {
  InvalidCredentialsException,
  SessionRevokedException,
  InvalidCsrfTokenException,
} from '../../domain/identity.errors';
import { AUTH_COOKIE_NAMES } from '../../infrastructure/security/cookie.config';
import { UserEntity } from '../../infrastructure/persistence/entities/user.entity';
import { UserSessionEntity } from '../../infrastructure/persistence/entities/user-session.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let registrationService: jest.Mocked<Partial<RegistrationService>>;
  let emailVerificationService: jest.Mocked<Partial<EmailVerificationService>>;
  let authenticationService: jest.Mocked<Partial<AuthenticationService>>;
  let sessionService: jest.Mocked<Partial<SessionService>>;
  let passwordResetService: jest.Mocked<Partial<PasswordResetService>>;
  let configService: jest.Mocked<Partial<ConfigService>>;

  const mockSafeProfile: SafeUserProfile = {
    id: 'user-uuid-1234',
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

  beforeEach(() => {
    registrationService = {
      register: jest.fn().mockResolvedValue({
        status: 'verification_required',
        message:
          'If this email address is eligible for an account, a verification email has been sent.',
      }),
    };

    emailVerificationService = {
      verifyEmail: jest.fn().mockResolvedValue({
        success: true,
        email: 'test@naba.edu.sa',
        message: 'Email verified successfully',
      }),
      resendVerification: jest.fn().mockResolvedValue({
        success: true,
        message: 'Verification link resent',
      }),
    };

    authenticationService = {
      authenticate: jest.fn().mockResolvedValue({
        id: 'user-uuid-1234',
        email: 'student@naba.edu.sa',
        normalizedEmail: 'student@naba.edu.sa',
        accountStatus: 'active',
      }),
      getUserProfile: jest.fn().mockResolvedValue(mockSafeProfile),
    };

    sessionService = {
      createSession: jest.fn().mockResolvedValue({
        sessionId: 'session-uuid-5678',
        rawSessionToken: 'mock-raw-session-token-xyz',
        rawCsrfToken: 'mock-raw-csrf-token-abc',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }),
      revokeSessionByToken: jest.fn().mockResolvedValue(undefined),
      revokeSession: jest.fn().mockResolvedValue(undefined),
      validateSession: jest.fn().mockResolvedValue({
        user: { id: 'user-uuid-1234' } as UserEntity,
        session: {
          id: 'session-uuid-5678',
          userId: 'user-uuid-1234',
          csrfTokenHash: 'mock-csrf-hash',
        } as UserSessionEntity,
      }),
      validateCsrfToken: jest.fn().mockReturnValue(true),
      rotateSessionCsrfToken: jest.fn().mockResolvedValue('new-rotated-csrf-token'),
      listActiveSessions: jest.fn().mockResolvedValue({
        sessions: [
          {
            id: 'session-uuid-5678',
            device: 'Desktop',
            browser: 'Chrome',
            ipAddress: '127.0.0.1',
            createdAt: '2026-01-01T00:00:00.000Z',
            lastActiveAt: '2026-01-01T00:00:00.000Z',
            isCurrent: true,
          },
        ],
        currentSessionId: 'session-uuid-5678',
      }),
      revokeOtherSessions: jest.fn().mockResolvedValue(2),
      revokeUserSession: jest.fn().mockResolvedValue(true),
    };

    passwordResetService = {
      forgotPassword: jest.fn().mockResolvedValue({
        accepted: true,
        message:
          'If the account is eligible, password reset instructions have been sent.',
      }),
      resetPassword: jest.fn().mockResolvedValue({
        success: true,
        message:
          'Password has been reset successfully. Please log in with your new password.',
      }),
    };

    configService = {
      get: jest.fn().mockReturnValue('development'),
    };

    controller = new AuthController(
      registrationService as RegistrationService,
      emailVerificationService as EmailVerificationService,
      authenticationService as AuthenticationService,
      sessionService as SessionService,
      passwordResetService as PasswordResetService,
      configService as ConfigService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Registration & Verification flows', () => {
    it('should call registrationService.register on register()', async () => {
      const dto = {
        email: 'test@naba.edu.sa',
        password: 'StrongPassword123!',
        nationalId: '1092837465',
        fullNameAr: 'عمر بن عبد العزيز',
        fullNameEn: 'Omar Abdulaziz',
      };

      const res = await controller.register(dto);
      expect(registrationService.register).toHaveBeenCalledWith(dto);
      expect(res.status).toBe('verification_required');
    });

    it('should call emailVerificationService.verifyEmail on verifyEmail()', async () => {
      const dto = { token: 'raw-token-abc' };
      const res = await controller.verifyEmail(dto);
      expect(emailVerificationService.verifyEmail).toHaveBeenCalledWith('raw-token-abc');
      expect(res.success).toBe(true);
    });

    it('should call emailVerificationService.resendVerification on resendVerification()', async () => {
      const dto = { email: 'test@naba.edu.sa' };
      const res = await controller.resendVerification(dto);
      expect(emailVerificationService.resendVerification).toHaveBeenCalledWith('test@naba.edu.sa');
      expect(res.success).toBe(true);
    });

    it('should call passwordResetService.forgotPassword on forgotPassword()', async () => {
      const dto = { email: 'student@naba.edu.sa', locale: 'ar' as const };
      const res = await controller.forgotPassword(dto);
      expect(passwordResetService.forgotPassword).toHaveBeenCalledWith(dto);
      expect(res.accepted).toBe(true);
    });

    it('should call passwordResetService.resetPassword and clear cookies on resetPassword()', async () => {
      const dto = {
        token: 'raw-reset-token-xyz',
        password: 'NewStrongPassword2026!',
      };
      const mockRes = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      const res = await controller.resetPassword(dto, mockRes);
      expect(passwordResetService.resetPassword).toHaveBeenCalledWith(dto);
      expect(res.success).toBe(true);
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        AUTH_COOKIE_NAMES.SESSION,
        expect.any(Object),
      );
    });
  });

  describe('Login flow (POST /api/v1/auth/login)', () => {
    it('authenticates credentials, creates session, sets secure cookies, and returns safe profile with CSRF token', async () => {
      const mockReq = {
        headers: {
          'user-agent': 'Mozilla/5.0 TestBrowser',
          'x-device-label': 'MacBook Pro',
        },
        ip: '192.168.1.100',
        socket: {},
      } as unknown as Request;

      const mockRes = {
        cookie: jest.fn(),
      } as unknown as Response;

      const loginDto = {
        email: 'student@naba.edu.sa',
        password: 'StrongPassword123!',
      };

      const result = await controller.login(loginDto, mockReq, mockRes);

      expect(authenticationService.authenticate).toHaveBeenCalledWith({
        email: 'student@naba.edu.sa',
        password: 'StrongPassword123!',
      });

      expect(sessionService.createSession).toHaveBeenCalledWith({
        userId: 'user-uuid-1234',
        userAgent: 'Mozilla/5.0 TestBrowser',
        ipAddress: '192.168.1.100',
        deviceLabel: 'MacBook Pro',
      });

      // Verifies both cookies are set on response
      expect(mockRes.cookie).toHaveBeenCalledTimes(2);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        AUTH_COOKIE_NAMES.SESSION,
        'mock-raw-session-token-xyz',
        expect.objectContaining({
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
        }),
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        AUTH_COOKIE_NAMES.CSRF,
        'mock-raw-csrf-token-abc',
        expect.objectContaining({
          httpOnly: false,
          path: '/',
          sameSite: 'lax',
        }),
      );

      // Verifies response body contents
      expect(result).toEqual({
        user: mockSafeProfile,
        csrfToken: 'mock-raw-csrf-token-abc',
        message: 'Login successful',
      });

      // Strict security verification: zero password hash exposure
      const serialized = JSON.stringify(result);
      expect(serialized).not.toContain('password');
      expect(serialized).not.toContain('passwordHash');
    });

    it('propagates InvalidCredentialsException if authenticationService fails', async () => {
      authenticationService.authenticate = jest.fn().mockRejectedValue(
        new InvalidCredentialsException(),
      );

      const mockReq = { headers: {}, socket: {} } as unknown as Request;
      const mockRes = { cookie: jest.fn() } as unknown as Response;

      await expect(
        controller.login(
          { email: 'wrong@naba.edu.sa', password: 'BadPassword123!' },
          mockReq,
          mockRes,
        ),
      ).rejects.toThrow(InvalidCredentialsException);

      expect(sessionService.createSession).not.toHaveBeenCalled();
      expect(mockRes.cookie).not.toHaveBeenCalled();
    });
  });

  describe('Logout flow (POST /api/v1/auth/logout)', () => {
    it('revokes session, clears cookies, and returns success response when valid session and CSRF token are provided', async () => {
      const mockReq = {
        cookies: {
          [AUTH_COOKIE_NAMES.SESSION]: 'active-session-token-123',
          [AUTH_COOKIE_NAMES.CSRF]: 'valid-csrf-token',
        },
        headers: {
          'x-csrf-token': 'valid-csrf-token',
        },
      } as unknown as Request;

      const mockRes = {
        clearCookie: jest.fn(),
        setHeader: jest.fn(),
      } as unknown as Response;

      const result = await controller.logout(mockReq, mockRes);

      expect(sessionService.validateSession).toHaveBeenCalledWith('active-session-token-123');
      expect(sessionService.validateCsrfToken).toHaveBeenCalledWith(
        expect.anything(),
        'valid-csrf-token',
      );
      expect(sessionService.revokeSession).toHaveBeenCalledWith(
        'session-uuid-5678',
        'User logged out',
      );

      expect(mockRes.clearCookie).toHaveBeenCalledTimes(2);
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        AUTH_COOKIE_NAMES.SESSION,
        expect.objectContaining({
          httpOnly: true,
          path: '/',
        }),
      );
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        AUTH_COOKIE_NAMES.CSRF,
        expect.objectContaining({
          httpOnly: false,
          path: '/',
        }),
      );

      expect(result).toEqual({
        loggedOut: true,
        message: 'Logged out successfully',
      });
    });

    it('rejects logout with InvalidCsrfTokenException when session cookie is provided but CSRF header is missing', async () => {
      const mockReq = {
        cookies: {
          [AUTH_COOKIE_NAMES.SESSION]: 'active-session-token-123',
        },
        headers: {},
      } as unknown as Request;

      const mockRes = {
        clearCookie: jest.fn(),
        setHeader: jest.fn(),
      } as unknown as Response;

      await expect(controller.logout(mockReq, mockRes)).rejects.toThrow(InvalidCsrfTokenException);
      expect(sessionService.revokeSession).not.toHaveBeenCalled();
    });

    it('rejects logout with InvalidCsrfTokenException when CSRF token does not match active session', async () => {
      sessionService.validateCsrfToken = jest.fn().mockReturnValue(false);

      const mockReq = {
        cookies: {
          [AUTH_COOKIE_NAMES.SESSION]: 'active-session-token-123',
        },
        headers: {
          'x-csrf-token': 'wrong-csrf-token',
        },
      } as unknown as Request;

      const mockRes = {
        clearCookie: jest.fn(),
        setHeader: jest.fn(),
      } as unknown as Response;

      await expect(controller.logout(mockReq, mockRes)).rejects.toThrow(InvalidCsrfTokenException);
      expect(sessionService.revokeSession).not.toHaveBeenCalled();
    });

    it('handles missing session cookie gracefully (idempotent logout without requiring CSRF)', async () => {
      const mockReq = {
        cookies: {},
        headers: {},
      } as unknown as Request;

      const mockRes = {
        clearCookie: jest.fn(),
        setHeader: jest.fn(),
      } as unknown as Response;

      const result = await controller.logout(mockReq, mockRes);

      expect(sessionService.validateSession).not.toHaveBeenCalled();
      expect(sessionService.revokeSession).not.toHaveBeenCalled();
      expect(mockRes.clearCookie).toHaveBeenCalledTimes(2);
      expect(result.loggedOut).toBe(true);
    });
  });

  describe('Current user flow (GET /api/v1/auth/me)', () => {
    it('returns safe user profile for authenticated user', async () => {
      const mockReq = {
        user: { id: 'user-uuid-1234' },
      } as unknown as Request;

      const mockRes = {
        setHeader: jest.fn(),
      } as unknown as Response;

      const result = await controller.me(mockReq, mockRes);

      expect(authenticationService.getUserProfile).toHaveBeenCalledWith('user-uuid-1234');
      expect(result).toEqual({
        user: mockSafeProfile,
      });
    });
  });

  describe('CSRF Token Retrieval (GET /api/v1/auth/csrf)', () => {
    it('returns existing valid CSRF token if cookie is valid and matches session hash', async () => {
      sessionService.validateCsrfToken = jest.fn().mockReturnValue(true);

      const mockReq = {
        session: { id: 'session-uuid-5678', csrfTokenHash: 'mock-hash' },
        cookies: {
          [AUTH_COOKIE_NAMES.CSRF]: 'existing-valid-csrf-token',
        },
      } as unknown as Request;

      const mockRes = {
        setHeader: jest.fn(),
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.getCsrf(mockReq, mockRes);

      expect(result).toEqual({ csrfToken: 'existing-valid-csrf-token' });
      expect(sessionService.rotateSessionCsrfToken).not.toHaveBeenCalled();
      expect(mockRes.cookie).not.toHaveBeenCalled();
    });

    it('rotates CSRF token in database and sets new cookie when cookie is missing or invalid', async () => {
      sessionService.validateCsrfToken = jest.fn().mockReturnValue(false);

      const mockReq = {
        session: { id: 'session-uuid-5678', csrfTokenHash: 'mock-hash' },
        cookies: {},
      } as unknown as Request;

      const mockRes = {
        setHeader: jest.fn(),
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.getCsrf(mockReq, mockRes);

      expect(result).toEqual({ csrfToken: 'new-rotated-csrf-token' });
      expect(sessionService.rotateSessionCsrfToken).toHaveBeenCalledWith('session-uuid-5678');
      expect(mockRes.cookie).toHaveBeenCalledWith(
        AUTH_COOKIE_NAMES.CSRF,
        'new-rotated-csrf-token',
        expect.objectContaining({
          httpOnly: false,
          sameSite: 'lax',
          path: '/',
        }),
      );
    });
  });

  describe('Active Sessions Management', () => {
    it('lists active sessions for current user', async () => {
      const mockReq = {
        user: { id: 'user-uuid-1234' },
        session: { id: 'session-uuid-5678' },
      } as unknown as Request;

      const mockRes = {
        setHeader: jest.fn(),
      } as unknown as Response;

      const result = await controller.listSessions(mockReq, mockRes);

      expect(sessionService.listActiveSessions).toHaveBeenCalledWith(
        'user-uuid-1234',
        'session-uuid-5678',
      );
      expect(result.sessions).toHaveLength(1);
      expect(result.currentSessionId).toBe('session-uuid-5678');
    });

    it('logs out other sessions while preserving current session', async () => {
      const mockReq = {
        user: { id: 'user-uuid-1234' },
        session: { id: 'session-uuid-5678' },
      } as unknown as Request;

      const mockRes = {
        setHeader: jest.fn(),
      } as unknown as Response;

      const result = await controller.logoutOtherSessions(mockReq, mockRes);

      expect(sessionService.revokeOtherSessions).toHaveBeenCalledWith(
        'user-uuid-1234',
        'session-uuid-5678',
      );
      expect(result).toEqual({
        revokedCount: 2,
        message: 'Other sessions logged out successfully',
      });
    });

    it('revokes single session by id', async () => {
      const mockReq = {
        user: { id: 'user-uuid-1234' },
        session: { id: 'session-uuid-5678' },
      } as unknown as Request;

      const mockRes = {
        setHeader: jest.fn(),
        clearCookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.revokeSession('target-session-999', mockReq, mockRes);

      expect(sessionService.revokeUserSession).toHaveBeenCalledWith(
        'user-uuid-1234',
        'target-session-999',
      );
      expect(result).toEqual({
        revoked: true,
        message: 'Session revoked successfully',
      });
      expect(mockRes.clearCookie).not.toHaveBeenCalled();
    });

    it('clears cookies if revoked session is the current session', async () => {
      const mockReq = {
        user: { id: 'user-uuid-1234' },
        session: { id: 'current-session-id' },
      } as unknown as Request;

      const mockRes = {
        setHeader: jest.fn(),
        clearCookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.revokeSession('current-session-id', mockReq, mockRes);

      expect(result).toEqual({
        revoked: true,
        message: 'Session revoked successfully',
      });
      expect(mockRes.clearCookie).toHaveBeenCalledTimes(2);
    });
  });
});
