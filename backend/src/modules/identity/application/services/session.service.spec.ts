import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionService, CreateSessionInput } from './session.service';
import { UserSessionEntity } from '../../infrastructure/persistence/entities/user-session.entity';
import { UserEntity } from '../../infrastructure/persistence/entities/user.entity';
import { SecureTokenService } from '../../infrastructure/security/secure-token.service';
import {
  SessionRevokedException,
  AccountDisabledException,
} from '../../domain/identity.errors';

describe('SessionService', () => {
  let service: SessionService;
  let sessionRepository: jest.Mocked<Repository<UserSessionEntity>>;
  let userRepository: jest.Mocked<Repository<UserEntity>>;
  let secureTokenService: SecureTokenService;

  const mockUser: Partial<UserEntity> = {
    id: 'user-uuid-abc',
    email: 'student@naba.edu.sa',
    accountStatus: 'active',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        SecureTokenService,
        {
          provide: getRepositoryToken(UserSessionEntity),
          useValue: {
            create: jest.fn().mockImplementation((dto) => ({ id: 'session-uuid-1', ...dto })),
            save: jest.fn().mockImplementation(async (entity) => ({ id: 'session-uuid-1', ...entity })),
            findOne: jest.fn(),
            find: jest.fn(),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
    sessionRepository = module.get(getRepositoryToken(UserSessionEntity));
    userRepository = module.get(getRepositoryToken(UserEntity));
    secureTokenService = module.get<SecureTokenService>(SecureTokenService);
  });

  describe('createSession', () => {
    it('creates session with independent 256-bit random tokens and hashes', async () => {
      const input: CreateSessionInput = {
        userId: 'user-uuid-abc',
        userAgent: 'Mozilla/5.0 Chrome/120',
        deviceLabel: 'Chrome on macOS',
        ipAddress: '192.168.1.1',
      };

      const result = await service.createSession(input);

      // Verify raw tokens returned
      expect(result.sessionId).toBe('session-uuid-1');
      expect(typeof result.rawSessionToken).toBe('string');
      expect(typeof result.rawCsrfToken).toBe('string');
      expect(result.rawSessionToken.length).toBeGreaterThanOrEqual(40);
      expect(result.rawCsrfToken.length).toBeGreaterThanOrEqual(40);

      // Verify session and CSRF tokens are completely independent
      expect(result.rawSessionToken).not.toBe(result.rawCsrfToken);

      // Verify 7-day expiration
      const now = Date.now();
      const expectedDiff = 7 * 24 * 60 * 60 * 1000;
      const actualDiff = result.expiresAt.getTime() - now;
      expect(actualDiff).toBeGreaterThanOrEqual(expectedDiff - 1000);
      expect(actualDiff).toBeLessThanOrEqual(expectedDiff + 2000);

      // Verify repository was called with token HASHES, never raw tokens
      const createCall = sessionRepository.create.mock.calls[0][0];
      expect(createCall.tokenHash).toBe(secureTokenService.hashToken(result.rawSessionToken));
      expect(createCall.csrfTokenHash).toBe(secureTokenService.hashToken(result.rawCsrfToken));
      expect(createCall.tokenHash).not.toBe(result.rawSessionToken);
      expect(createCall.csrfTokenHash).not.toBe(result.rawCsrfToken);
      expect(createCall.userId).toBe('user-uuid-abc');
      expect(createCall.revokedAt).toBeNull();
    });
  });

  describe('validateSession', () => {
    it('validates active session and updates last_seen_at', async () => {
      const rawToken = 'sampleRawSessionToken1234567890abcdefgh';
      const tokenHash = secureTokenService.hashToken(rawToken);

      const mockSession: Partial<UserSessionEntity> = {
        id: 'session-uuid-1',
        userId: 'user-uuid-abc',
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // expires in 1 hour
        revokedAt: null,
      };

      sessionRepository.findOne.mockResolvedValue(mockSession as UserSessionEntity);
      userRepository.findOne.mockResolvedValue(mockUser as UserEntity);

      const result = await service.validateSession(rawToken);

      expect(result.session.id).toBe('session-uuid-1');
      expect(result.user.id).toBe('user-uuid-abc');

      // Verify lookup was done by hashed token
      expect(sessionRepository.findOne).toHaveBeenCalledWith({
        where: { tokenHash },
      });

      // Verify last_seen_at was updated
      expect(sessionRepository.update).toHaveBeenCalledWith(
        'session-uuid-1',
        expect.objectContaining({ lastSeenAt: expect.any(Date) }),
      );
    });

    it('rejects with SessionRevokedException if session is not found', async () => {
      sessionRepository.findOne.mockResolvedValue(null);

      await expect(service.validateSession('nonexistent-token')).rejects.toThrow(
        SessionRevokedException,
      );
    });

    it('rejects with SessionRevokedException if session is revoked', async () => {
      const rawToken = 'revokedToken12345';
      const tokenHash = secureTokenService.hashToken(rawToken);

      sessionRepository.findOne.mockResolvedValue({
        id: 'session-uuid-1',
        userId: 'user-uuid-abc',
        tokenHash,
        expiresAt: new Date(Date.now() + 10000),
        revokedAt: new Date(),
        revokeReason: 'User logged out',
      } as UserSessionEntity);

      await expect(service.validateSession(rawToken)).rejects.toThrow(
        SessionRevokedException,
      );
    });

    it('rejects with SessionRevokedException if session is expired', async () => {
      const rawToken = 'expiredToken12345';
      const tokenHash = secureTokenService.hashToken(rawToken);

      sessionRepository.findOne.mockResolvedValue({
        id: 'session-uuid-1',
        userId: 'user-uuid-abc',
        tokenHash,
        expiresAt: new Date(Date.now() - 5000), // expired 5 seconds ago
        revokedAt: null,
      } as UserSessionEntity);

      await expect(service.validateSession(rawToken)).rejects.toThrow(
        SessionRevokedException,
      );
    });

    it('rejects with AccountDisabledException if user is disabled', async () => {
      const rawToken = 'activeTokenForDisabledUser';
      const tokenHash = secureTokenService.hashToken(rawToken);

      sessionRepository.findOne.mockResolvedValue({
        id: 'session-uuid-1',
        userId: 'user-uuid-abc',
        tokenHash,
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: null,
      } as UserSessionEntity);

      userRepository.findOne.mockResolvedValue({
        id: 'user-uuid-abc',
        accountStatus: 'disabled',
      } as UserEntity);

      await expect(service.validateSession(rawToken)).rejects.toThrow(
        AccountDisabledException,
      );
    });

    it('rejects with SessionRevokedException if user is pending_verification', async () => {
      const rawToken = 'activeTokenForPendingUser';
      const tokenHash = secureTokenService.hashToken(rawToken);

      sessionRepository.findOne.mockResolvedValue({
        id: 'session-uuid-1',
        userId: 'user-uuid-abc',
        tokenHash,
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: null,
      } as UserSessionEntity);

      userRepository.findOne.mockResolvedValue({
        id: 'user-uuid-abc',
        accountStatus: 'pending_verification',
      } as UserEntity);

      await expect(service.validateSession(rawToken)).rejects.toThrow(
        SessionRevokedException,
      );
    });

    it('rejects with SessionRevokedException if user has unverified email (emailVerifiedAt is null)', async () => {
      const rawToken = 'activeTokenForUnverifiedUser';
      const tokenHash = secureTokenService.hashToken(rawToken);

      sessionRepository.findOne.mockResolvedValue({
        id: 'session-uuid-1',
        userId: 'user-uuid-abc',
        tokenHash,
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: null,
      } as UserSessionEntity);

      userRepository.findOne.mockResolvedValue({
        id: 'user-uuid-abc',
        accountStatus: 'active',
        emailVerifiedAt: null,
      } as unknown as UserEntity);

      await expect(service.validateSession(rawToken)).rejects.toThrow(
        SessionRevokedException,
      );
    });
  });

  describe('revokeSession', () => {
    it('stamps revoked_at and revoke_reason on session', async () => {
      await service.revokeSession('session-uuid-1', 'Manual Logout');

      expect(sessionRepository.update).toHaveBeenCalledWith(
        'session-uuid-1',
        expect.objectContaining({
          revokedAt: expect.any(Date),
          revokeReason: 'Manual Logout',
        }),
      );
    });
  });

  describe('revokeAllUserSessions', () => {
    it('revokes all non-revoked sessions for a user', async () => {
      const qbMock = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 3 }),
      };

      sessionRepository.createQueryBuilder.mockReturnValue(qbMock as any);

      const count = await service.revokeAllUserSessions('user-uuid-abc', 'Password reset');

      expect(count).toBe(3);
      expect(qbMock.where).toHaveBeenCalledWith('userId = :userId', { userId: 'user-uuid-abc' });
      expect(qbMock.andWhere).toHaveBeenCalledWith('revokedAt IS NULL');
    });
  });

  describe('revokeSessionByToken', () => {
    it('revokes session by looking up hashed raw token', async () => {
      const rawToken = 'raw-session-token-to-revoke';
      const expectedHash = secureTokenService.hashToken(rawToken);

      sessionRepository.findOne.mockResolvedValue({
        id: 'session-to-revoke',
        tokenHash: expectedHash,
        revokedAt: null,
      } as UserSessionEntity);

      await service.revokeSessionByToken(rawToken, 'User logged out');

      expect(sessionRepository.findOne).toHaveBeenCalledWith({
        where: { tokenHash: expectedHash },
      });
      expect(sessionRepository.update).toHaveBeenCalledWith(
        'session-to-revoke',
        expect.objectContaining({
          revokedAt: expect.any(Date),
          revokeReason: 'User logged out',
        }),
      );
    });

    it('does nothing if rawToken is empty or invalid', async () => {
      await service.revokeSessionByToken('');
      expect(sessionRepository.findOne).not.toHaveBeenCalled();
      expect(sessionRepository.update).not.toHaveBeenCalled();
    });

    it('does not re-revoke if session is already revoked', async () => {
      const rawToken = 'already-revoked-token';
      const expectedHash = secureTokenService.hashToken(rawToken);

      sessionRepository.findOne.mockResolvedValue({
        id: 'session-already-revoked',
        tokenHash: expectedHash,
        revokedAt: new Date(),
      } as UserSessionEntity);

      await service.revokeSessionByToken(rawToken);

      expect(sessionRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('validateCsrfToken', () => {
    it('returns true when raw CSRF token matches stored session hash', () => {
      const rawCsrf = 'raw-valid-csrf-token';
      const csrfHash = secureTokenService.hashToken(rawCsrf);

      const session = {
        id: 'session-1',
        csrfTokenHash: csrfHash,
      } as UserSessionEntity;

      const isValid = service.validateCsrfToken(session, rawCsrf);
      expect(isValid).toBe(true);
    });

    it('returns false when raw CSRF token does not match stored hash', () => {
      const session = {
        id: 'session-1',
        csrfTokenHash: 'expected-hash',
      } as UserSessionEntity;

      const isValid = service.validateCsrfToken(session, 'wrong-csrf-token');
      expect(isValid).toBe(false);
    });

    it('returns false if raw token or session is missing', () => {
      expect(service.validateCsrfToken(null as any, 'any-token')).toBe(false);
      expect(service.validateCsrfToken({} as any, '')).toBe(false);
    });
  });

  describe('rotateSessionCsrfToken', () => {
    it('generates new token, updates session hash, and returns raw token', async () => {
      const rawToken = await service.rotateSessionCsrfToken('session-1');

      expect(typeof rawToken).toBe('string');
      expect(rawToken.length).toBeGreaterThan(20);
      expect(sessionRepository.update).toHaveBeenCalledWith(
        'session-1',
        expect.objectContaining({
          csrfTokenHash: secureTokenService.hashToken(rawToken),
        }),
      );
    });
  });

  describe('listActiveSessions', () => {
    it('returns active sessions and identifies current session', async () => {
      const now = new Date();
      sessionRepository.find.mockResolvedValue([
        {
          id: 'session-1',
          userId: 'user-1',
          deviceLabel: 'MacBook Pro',
          userAgent: 'Mozilla/5.0 Macintosh',
          ipAddress: '10.0.0.1',
          createdAt: now,
          lastSeenAt: now,
          expiresAt: new Date(now.getTime() + 100000),
          revokedAt: null,
        } as UserSessionEntity,
        {
          id: 'session-2',
          userId: 'user-1',
          deviceLabel: null,
          userAgent: 'Mozilla/5.0 Android',
          ipAddress: '10.0.0.2',
          createdAt: now,
          lastSeenAt: now,
          expiresAt: new Date(now.getTime() + 100000),
          revokedAt: null,
        } as UserSessionEntity,
      ]);

      const result = await service.listActiveSessions('user-1', 'session-1');

      expect(result.currentSessionId).toBe('session-1');
      expect(result.sessions).toHaveLength(2);
      expect(result.sessions[0].id).toBe('session-1');
      expect(result.sessions[0].isCurrent).toBe(true);
      expect(result.sessions[0].device).toBe('MacBook Pro');
      expect(result.sessions[1].id).toBe('session-2');
      expect(result.sessions[1].isCurrent).toBe(false);
      expect(result.sessions[1].device).toBe('Android');
    });
  });

  describe('revokeOtherSessions', () => {
    it('revokes other sessions while preserving current session', async () => {
      const qbMock = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 2 }),
      };
      sessionRepository.createQueryBuilder.mockReturnValue(qbMock as any);

      const count = await service.revokeOtherSessions('user-1', 'current-session-id');

      expect(count).toBe(2);
      expect(qbMock.where).toHaveBeenCalledWith('userId = :userId', { userId: 'user-1' });
      expect(qbMock.andWhere).toHaveBeenCalledWith('id != :currentSessionId', {
        currentSessionId: 'current-session-id',
      });
      expect(qbMock.andWhere).toHaveBeenCalledWith('revokedAt IS NULL');
    });
  });

  describe('revokeUserSession', () => {
    it('successfully revokes session belonging to the user', async () => {
      sessionRepository.findOne.mockResolvedValue({
        id: 'target-session-id',
        userId: 'user-1',
        revokedAt: null,
      } as UserSessionEntity);

      const revoked = await service.revokeUserSession('user-1', 'target-session-id');

      expect(revoked).toBe(true);
      expect(sessionRepository.update).toHaveBeenCalledWith(
        'target-session-id',
        expect.objectContaining({
          revokedAt: expect.any(Date),
          revokeReason: 'Revoked by user',
        }),
      );
    });

    it('rejects with NotFoundException if session does not exist', async () => {
      sessionRepository.findOne.mockResolvedValue(null);

      await expect(service.revokeUserSession('user-1', 'nonexistent')).rejects.toThrow();
    });

    it('rejects with ForbiddenException if session belongs to another user', async () => {
      sessionRepository.findOne.mockResolvedValue({
        id: 'target-session-id',
        userId: 'different-user',
        revokedAt: null,
      } as UserSessionEntity);

      await expect(
        service.revokeUserSession('user-1', 'target-session-id'),
      ).rejects.toThrow('Cannot revoke a session belonging to another user');
    });
  });
});
