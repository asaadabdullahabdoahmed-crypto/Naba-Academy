import { Repository, DataSource, EntityManager } from 'typeorm';
import {
  PasswordResetService,
  PASSWORD_RESET_TOKEN_TTL_MS,
} from './password-reset.service';
import { UserEntity } from '../../infrastructure/persistence/entities/user.entity';
import { PasswordResetTokenEntity } from '../../infrastructure/persistence/entities/password-reset-token.entity';
import { PasswordHasher } from '../ports/password-hasher.port';
import { EmailSender } from '../ports/email-sender.port';
import { SecureTokenService } from '../../infrastructure/security/secure-token.service';
import { SessionService } from './session.service';
import {
  PasswordResetInvalidOrExpiredException,
  PasswordPolicyViolationException,
} from '../../domain/identity.errors';

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  let userRepository: Partial<Repository<UserEntity>>;
  let resetTokenRepository: Partial<Repository<PasswordResetTokenEntity>>;
  let dataSource: Partial<DataSource>;
  let passwordHasher: Partial<PasswordHasher>;
  let secureTokenService: SecureTokenService;
  let emailSender: Partial<EmailSender>;
  let sessionService: Partial<SessionService>;
  let entityManager: Partial<EntityManager>;
  let queryBuilderUpdateMock: jest.Mock;

  beforeEach(() => {
    userRepository = {
      findOne: jest.fn(),
    };
    resetTokenRepository = {
      findOne: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    };
    passwordHasher = {
      hash: jest.fn().mockResolvedValue('argon2id$newhash123'),
      verify: jest.fn().mockResolvedValue(true),
    };
    secureTokenService = new SecureTokenService();
    emailSender = {
      sendEmail: jest.fn().mockResolvedValue(undefined),
      sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    };
    sessionService = {
      revokeAllUserSessions: jest.fn().mockResolvedValue(2),
    };

    queryBuilderUpdateMock = jest.fn().mockReturnValue({
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    });

    entityManager = {
      create: jest.fn((entityClass, plain) => plain) as any,
      save: jest.fn((entityClass, entity) => Promise.resolve(entity)) as any,
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        update: queryBuilderUpdateMock,
      }) as any,
    };

    dataSource = {
      transaction: jest.fn().mockImplementation(async (cb: any) => {
        return cb(entityManager as EntityManager);
      }),
    } as unknown as Partial<DataSource>;

    service = new PasswordResetService(
      userRepository as Repository<UserEntity>,
      resetTokenRepository as Repository<PasswordResetTokenEntity>,
      dataSource as DataSource,
      passwordHasher as PasswordHasher,
      secureTokenService,
      emailSender as EmailSender,
      sessionService as SessionService,
    );
  });

  it('should be defined and export the constant 30-minute TTL', () => {
    expect(service).toBeDefined();
    expect(PASSWORD_RESET_TOKEN_TTL_MS).toBe(30 * 60 * 1000);
  });

  describe('forgotPassword', () => {
    it('returns standard anti-enumeration response for unknown email without sending email', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.forgotPassword({
        email: 'unknown@example.com',
      });

      expect(result).toEqual({
        accepted: true,
        message: 'If the account is eligible, password reset instructions have been sent.',
      });
      expect(emailSender.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('returns standard anti-enumeration response for disabled account without sending email', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue({
        id: 'user-disabled-id',
        email: 'disabled@naba.edu.sa',
        accountStatus: 'disabled',
        emailVerifiedAt: new Date(),
      });

      const result = await service.forgotPassword({
        email: 'disabled@naba.edu.sa',
      });

      expect(result).toEqual({
        accepted: true,
        message: 'If the account is eligible, password reset instructions have been sent.',
      });
      expect(emailSender.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('returns standard anti-enumeration response for unverified/pending account without sending email', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue({
        id: 'user-pending-id',
        email: 'pending@naba.edu.sa',
        accountStatus: 'pending_verification',
        emailVerifiedAt: null,
      });

      const result = await service.forgotPassword({
        email: 'pending@naba.edu.sa',
      });

      expect(result).toEqual({
        accepted: true,
        message: 'If the account is eligible, password reset instructions have been sent.',
      });
      expect(emailSender.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('successfully processes eligible active account, invalidates prior tokens, persists hashed token, and sends email in Arabic by default', async () => {
      const activeUser = {
        id: 'user-active-123',
        email: 'student@naba.edu.sa',
        accountStatus: 'active',
        emailVerifiedAt: new Date(),
      };
      (userRepository.findOne as jest.Mock).mockResolvedValue(activeUser);

      const result = await service.forgotPassword({
        email: 'student@naba.edu.sa',
      });

      expect(result).toEqual({
        accepted: true,
        message: 'If the account is eligible, password reset instructions have been sent.',
      });

      // Verify transaction executed: invalidated prior tokens and saved new token
      expect(dataSource.transaction).toHaveBeenCalled();
      expect(entityManager.create).toHaveBeenCalledWith(
        PasswordResetTokenEntity,
        expect.objectContaining({
          userId: 'user-active-123',
          tokenHash: expect.any(String),
          usedAt: null,
          expiresAt: expect.any(Date),
        }),
      );

      // Verify email dispatched with raw token in Arabic
      expect(emailSender.sendPasswordResetEmail).toHaveBeenCalledWith(
        'student@naba.edu.sa',
        expect.any(String),
        'ar',
      );

      // Verify raw token is never passed to entity save
      const createArgs = (entityManager.create as jest.Mock).mock.calls[0][1];
      expect(createArgs).not.toHaveProperty('rawToken');
      expect(createArgs.tokenHash).toHaveLength(64); // 256-bit SHA-256 hex string
    });

    it('dispatches email with locale "en" when requested for an eligible user', async () => {
      const activeUser = {
        id: 'user-active-123',
        email: 'student@naba.edu.sa',
        accountStatus: 'active',
        emailVerifiedAt: new Date(),
      };
      (userRepository.findOne as jest.Mock).mockResolvedValue(activeUser);

      await service.forgotPassword({
        email: 'student@naba.edu.sa',
        locale: 'en',
      });

      expect(emailSender.sendPasswordResetEmail).toHaveBeenCalledWith(
        'student@naba.edu.sa',
        expect.any(String),
        'en',
      );
    });

    it('handles email delivery failure gracefully without exposing error to caller', async () => {
      const activeUser = {
        id: 'user-active-123',
        email: 'student@naba.edu.sa',
        accountStatus: 'active',
        emailVerifiedAt: new Date(),
      };
      (userRepository.findOne as jest.Mock).mockResolvedValue(activeUser);
      (emailSender.sendPasswordResetEmail as jest.Mock).mockRejectedValue(
        new Error('SMTP connection refused'),
      );

      const result = await service.forgotPassword({
        email: 'student@naba.edu.sa',
      });

      expect(result.accepted).toBe(true);
    });
  });

  describe('resetPassword', () => {
    it('throws PasswordResetInvalidOrExpiredException if token is missing or empty', async () => {
      await expect(
        service.resetPassword({
          token: '',
          password: 'ValidPassword123!',
        }),
      ).rejects.toThrow(PasswordResetInvalidOrExpiredException);
    });

    it('throws PasswordPolicyViolationException if new password violates policy', async () => {
      await expect(
        service.resetPassword({
          token: 'some-valid-token-format',
          password: 'short',
        }),
      ).rejects.toThrow(PasswordPolicyViolationException);
    });

    it('throws PasswordResetInvalidOrExpiredException if token is not found in database', async () => {
      (entityManager.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.resetPassword({
          token: 'nonexistent-token',
          password: 'StrongPassword2026!',
        }),
      ).rejects.toThrow(PasswordResetInvalidOrExpiredException);
    });

    it('throws PasswordResetInvalidOrExpiredException if token was already used', async () => {
      (entityManager.findOne as jest.Mock).mockResolvedValue({
        id: 'token-uuid-1',
        userId: 'user-uuid-1',
        usedAt: new Date(Date.now() - 1000), // already used
        expiresAt: new Date(Date.now() + 60000),
      });

      await expect(
        service.resetPassword({
          token: 'already-used-token',
          password: 'StrongPassword2026!',
        }),
      ).rejects.toThrow(PasswordResetInvalidOrExpiredException);
    });

    it('throws PasswordResetInvalidOrExpiredException if token has expired', async () => {
      (entityManager.findOne as jest.Mock).mockResolvedValue({
        id: 'token-uuid-1',
        userId: 'user-uuid-1',
        usedAt: null,
        expiresAt: new Date(Date.now() - 5000), // expired 5 seconds ago
      });

      await expect(
        service.resetPassword({
          token: 'expired-token',
          password: 'StrongPassword2026!',
        }),
      ).rejects.toThrow(PasswordResetInvalidOrExpiredException);
    });

    it('throws PasswordResetInvalidOrExpiredException if user is disabled', async () => {
      (entityManager.findOne as jest.Mock)
        .mockResolvedValueOnce({
          id: 'token-uuid-1',
          userId: 'user-uuid-disabled',
          usedAt: null,
          expiresAt: new Date(Date.now() + 60000),
        })
        .mockResolvedValueOnce({
          id: 'user-uuid-disabled',
          accountStatus: 'disabled',
        });

      await expect(
        service.resetPassword({
          token: 'valid-token-disabled-user',
          password: 'StrongPassword2026!',
        }),
      ).rejects.toThrow(PasswordResetInvalidOrExpiredException);
    });

    it('successfully resets password, clears failure lockout, revokes all sessions, and does not alter accountStatus or roles', async () => {
      const mockToken = {
        id: 'token-uuid-1',
        userId: 'user-uuid-1',
        usedAt: null,
        expiresAt: new Date(Date.now() + 60000),
      };

      const mockUser = {
        id: 'user-uuid-1',
        email: 'student@naba.edu.sa',
        accountStatus: 'active',
        emailVerifiedAt: new Date('2026-01-01'),
        failedLoginCount: 4,
        lockedUntil: new Date(Date.now() + 600000),
        passwordHash: 'argon2id$oldpasswordhash',
        passwordChangedAt: null,
      };

      (entityManager.findOne as jest.Mock)
        .mockResolvedValueOnce(mockToken)
        .mockResolvedValueOnce(mockUser);

      const result = await service.resetPassword({
        token: 'valid-reset-token-12345',
        password: 'BrandNewSecurePassword2026!',
      });

      expect(result).toEqual({
        success: true,
        message: 'Password has been reset successfully. Please log in with your new password.',
      });

      // Verify Argon2 hashing was performed with new password
      expect(passwordHasher.hash).toHaveBeenCalledWith('BrandNewSecurePassword2026!');

      // Verify user updates: password_hash, password_changed_at, failed_login_count=0, locked_until=null
      expect(mockUser.passwordHash).toBe('argon2id$newhash123');
      expect(mockUser.passwordChangedAt).toBeInstanceOf(Date);
      expect(mockUser.failedLoginCount).toBe(0);
      expect(mockUser.lockedUntil).toBeNull();

      // STRICT ACCOUNT STATE CHECK: status and verification must remain untouched
      expect(mockUser.accountStatus).toBe('active');
      expect(mockUser.emailVerifiedAt).toEqual(new Date('2026-01-01'));

      // Verify token marked used
      expect(mockToken.usedAt).toBeInstanceOf(Date);

      // Verify all active sessions were revoked inside the transaction manager
      expect(sessionService.revokeAllUserSessions).toHaveBeenCalledWith(
        'user-uuid-1',
        'Password reset successfully',
        entityManager,
      );
    });

    it('ensures single-use semantics: consecutive use of the same token fails', async () => {
      // First attempt succeeds
      const mockToken = {
        id: 'token-uuid-single-use',
        userId: 'user-uuid-1',
        usedAt: null,
        expiresAt: new Date(Date.now() + 60000),
      };

      const mockUser = {
        id: 'user-uuid-1',
        accountStatus: 'active',
        failedLoginCount: 0,
        lockedUntil: null,
        passwordHash: 'argon2id$oldhash',
        passwordChangedAt: null,
      };

      (entityManager.findOne as jest.Mock)
        .mockResolvedValueOnce(mockToken)
        .mockResolvedValueOnce(mockUser);

      await service.resetPassword({
        token: 'token-for-single-use',
        password: 'ValidPassword123!',
      });

      // Once consumed, token.usedAt is now non-null
      expect(mockToken.usedAt).toBeInstanceOf(Date);

      // Second attempt using the now-consumed token record
      (entityManager.findOne as jest.Mock).mockResolvedValueOnce(mockToken);

      await expect(
        service.resetPassword({
          token: 'token-for-single-use',
          password: 'AnotherValidPassword123!',
        }),
      ).rejects.toThrow(PasswordResetInvalidOrExpiredException);
    });
  });
});
