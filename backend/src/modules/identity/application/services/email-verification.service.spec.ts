import { Repository, DataSource, EntityManager } from 'typeorm';
import { EmailVerificationService } from './email-verification.service';
import { UserEntity } from '../../infrastructure/persistence/entities/user.entity';
import { EmailVerificationTokenEntity } from '../../infrastructure/persistence/entities/email-verification-token.entity';
import { SecureTokenService } from '../../infrastructure/security/secure-token.service';
import { EmailSender } from '../ports/email-sender.port';
import {
  InvalidVerificationTokenException,
  VerificationTokenExpiredException,
  VerificationTokenAlreadyUsedException,
  AccountDisabledException,
} from '../../domain/identity.errors';

describe('EmailVerificationService', () => {
  let service: EmailVerificationService;
  let userRepository: Partial<Repository<UserEntity>>;
  let tokenRepository: Partial<Repository<EmailVerificationTokenEntity>>;
  let dataSource: Partial<DataSource>;
  let secureTokenService: SecureTokenService;
  let emailSender: Partial<EmailSender>;
  let entityManager: Partial<EntityManager>;

  beforeEach(() => {
    userRepository = {
      findOne: jest.fn(),
    };
    tokenRepository = {
      findOne: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    };
    secureTokenService = new SecureTokenService();
    emailSender = {
      sendEmail: jest.fn().mockResolvedValue(undefined),
      sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    };

    entityManager = {
      create: jest.fn((entityClass, plain) => plain) as any,
      save: jest.fn((entityClass, entity) => Promise.resolve(entity)) as any,
    };

    dataSource = {
      transaction: jest.fn().mockImplementation(async (cb: any) => {
        return cb(entityManager as EntityManager);
      }),
    } as unknown as Partial<DataSource>;

    service = new EmailVerificationService(
      userRepository as Repository<UserEntity>,
      tokenRepository as Repository<EmailVerificationTokenEntity>,
      dataSource as DataSource,
      secureTokenService,
      emailSender as EmailSender,
    );
  });

  describe('verifyEmail', () => {
    it('should throw InvalidVerificationTokenException if token is missing', async () => {
      await expect(service.verifyEmail('')).rejects.toThrow(
        InvalidVerificationTokenException,
      );
    });

    it('should throw InvalidVerificationTokenException if token is not in database', async () => {
      (tokenRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.verifyEmail('nonexistent-token')).rejects.toThrow(
        InvalidVerificationTokenException,
      );
    });

    it('should throw VerificationTokenAlreadyUsedException if token was already used', async () => {
      (tokenRepository.findOne as jest.Mock).mockResolvedValue({
        id: 'token-id-1',
        userId: 'user-id-1',
        tokenHash: 'hash',
        expiresAt: new Date(Date.now() + 60000),
        usedAt: new Date(Date.now() - 1000),
      });

      await expect(service.verifyEmail('used-token')).rejects.toThrow(
        VerificationTokenAlreadyUsedException,
      );
    });

    it('should throw VerificationTokenExpiredException if token has expired', async () => {
      (tokenRepository.findOne as jest.Mock).mockResolvedValue({
        id: 'token-id-1',
        userId: 'user-id-1',
        tokenHash: 'hash',
        expiresAt: new Date(Date.now() - 60000),
        usedAt: null,
      });

      await expect(service.verifyEmail('expired-token')).rejects.toThrow(
        VerificationTokenExpiredException,
      );
    });

    it('should throw AccountDisabledException if user is disabled', async () => {
      (tokenRepository.findOne as jest.Mock).mockResolvedValue({
        id: 'token-id-1',
        userId: 'user-id-1',
        tokenHash: 'hash',
        expiresAt: new Date(Date.now() + 60000),
        usedAt: null,
      });

      (userRepository.findOne as jest.Mock).mockResolvedValue({
        id: 'user-id-1',
        accountStatus: 'disabled',
      });

      await expect(service.verifyEmail('valid-token')).rejects.toThrow(
        AccountDisabledException,
      );
    });

    it('should successfully verify email and activate user', async () => {
      (tokenRepository.findOne as jest.Mock).mockResolvedValue({
        id: 'token-id-1',
        userId: 'user-id-1',
        tokenHash: 'hash',
        expiresAt: new Date(Date.now() + 60000),
        usedAt: null,
      });

      (userRepository.findOne as jest.Mock).mockResolvedValue({
        id: 'user-id-1',
        email: 'student@naba.edu.sa',
        accountStatus: 'pending_verification',
        emailVerifiedAt: null,
      });

      const result = await service.verifyEmail('valid-token');

      expect(result.success).toBe(true);
      expect(result.email).toBe('student@naba.edu.sa');
      expect(entityManager.save).toHaveBeenCalled();
    });
  });

  describe('resendVerification', () => {
    it('should return anti-enumeration success message when user does not exist', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.resendVerification('nonexistent@example.com');
      expect(result.success).toBe(true);
      expect(emailSender.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('should return anti-enumeration message without sending email when user is already verified', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'active@naba.edu.sa',
        accountStatus: 'active',
        emailVerifiedAt: new Date(),
      });

      const result = await service.resendVerification('active@naba.edu.sa');
      expect(result.success).toBe(true);
      expect(result.message).toContain('If an unverified account exists');
      expect(emailSender.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('should return anti-enumeration message without sending email when user is disabled', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'disabled@naba.edu.sa',
        accountStatus: 'disabled',
        emailVerifiedAt: null,
      });

      const result = await service.resendVerification('disabled@naba.edu.sa');
      expect(result.success).toBe(true);
      expect(result.message).toContain('If an unverified account exists');
      expect(emailSender.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('should issue new verification token and send email for pending user', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'pending@naba.edu.sa',
        accountStatus: 'pending_verification',
        emailVerifiedAt: null,
      });

      const result = await service.resendVerification('pending@naba.edu.sa');
      expect(result.success).toBe(true);
      expect(emailSender.sendVerificationEmail).toHaveBeenCalledWith(
        'pending@naba.edu.sa',
        expect.any(String),
      );
    });
  });
});
