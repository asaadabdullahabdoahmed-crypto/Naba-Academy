import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AuthenticationService,
  AuthenticateCredentialsInput,
} from './authentication.service';
import { UserEntity } from '../../infrastructure/persistence/entities/user.entity';
import { UserRoleAssignmentEntity } from '../../infrastructure/persistence/entities/user-role-assignment.entity';
import {
  PasswordHasher,
  PASSWORD_HASHER,
} from '../ports/password-hasher.port';
import {
  InvalidCredentialsException,
  AccountLockedException,
  AccountDisabledException,
} from '../../domain/identity.errors';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let userRepository: jest.Mocked<Repository<UserEntity>>;
  let roleAssignmentRepository: jest.Mocked<Repository<UserRoleAssignmentEntity>>;
  let passwordHasher: jest.Mocked<PasswordHasher>;

  const mockUser: Partial<UserEntity> = {
    id: 'user-uuid-1234',
    email: 'student@naba.edu.sa',
    normalizedEmail: 'student@naba.edu.sa',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=1$mockhash',
    accountStatus: 'active',
    failedLoginCount: 0,
    lockedUntil: null,
    emailVerifiedAt: new Date('2026-01-01T00:00:00Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
        {
          provide: getRepositoryToken(UserRoleAssignmentEntity),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: PASSWORD_HASHER,
          useValue: {
            hash: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    userRepository = module.get(getRepositoryToken(UserEntity));
    roleAssignmentRepository = module.get(getRepositoryToken(UserRoleAssignmentEntity));
    passwordHasher = module.get(PASSWORD_HASHER);
  });

  describe('authenticate', () => {
    it('successfully authenticates active verified user with correct credentials and resets counters', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        failedLoginCount: 2,
        lockedUntil: null,
      } as UserEntity);
      passwordHasher.verify.mockResolvedValue(true);

      const input: AuthenticateCredentialsInput = {
        email: 'STUDENT@naba.edu.sa ',
        password: 'ValidPassword123!',
      };

      const result = await service.authenticate(input);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        normalizedEmail: mockUser.normalizedEmail,
        accountStatus: 'active',
      });
      expect(result).not.toHaveProperty('passwordHash');

      // Verify normalization was called on lookup
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { normalizedEmail: 'student@naba.edu.sa' },
      });

      // Verify failed login count reset and lastLoginAt update committed
      expect(userRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          failedLoginCount: 0,
          lockedUntil: null,
          lastLoginAt: expect.any(Date),
        }),
      );
    });

    it('throws InvalidCredentialsException for unknown email (anti-enumeration)', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.authenticate({
          email: 'unknown@naba.edu.sa',
          password: 'SomePassword123!',
        }),
      ).rejects.toThrow(InvalidCredentialsException);

      expect(passwordHasher.verify).not.toHaveBeenCalled();
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('rejects if account is currently locked due to lockedUntil in future', async () => {
      const futureLock = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes in future
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        failedLoginCount: 5,
        lockedUntil: futureLock,
      } as UserEntity);

      await expect(
        service.authenticate({
          email: 'student@naba.edu.sa',
          password: 'ValidPassword123!',
        }),
      ).rejects.toThrow(AccountLockedException);

      expect(passwordHasher.verify).not.toHaveBeenCalled();
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('allows authentication if lockedUntil has already expired in the past', async () => {
      const pastLock = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        failedLoginCount: 5,
        lockedUntil: pastLock,
      } as UserEntity);
      passwordHasher.verify.mockResolvedValue(true);

      const result = await service.authenticate({
        email: 'student@naba.edu.sa',
        password: 'ValidPassword123!',
      });

      expect(result.id).toBe(mockUser.id);
      expect(userRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          failedLoginCount: 0,
          lockedUntil: null,
        }),
      );
    });

    it('increments and commits failedLoginCount on wrong password (< 5 attempts)', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        failedLoginCount: 2,
        lockedUntil: null,
      } as UserEntity);
      passwordHasher.verify.mockResolvedValue(false);

      await expect(
        service.authenticate({
          email: 'student@naba.edu.sa',
          password: 'WrongPassword123!',
        }),
      ).rejects.toThrow(InvalidCredentialsException);

      // Verify failure update was committed
      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, {
        failedLoginCount: 3,
        lockedUntil: null,
      });
    });

    it('triggers 15-minute lockout and commits lockedUntil upon reaching 5 consecutive failures', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        failedLoginCount: 4,
        lockedUntil: null,
      } as UserEntity);
      passwordHasher.verify.mockResolvedValue(false);

      const beforeAttempt = Date.now();
      await expect(
        service.authenticate({
          email: 'student@naba.edu.sa',
          password: 'WrongPassword123!',
        }),
      ).rejects.toThrow(AccountLockedException);

      expect(userRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          failedLoginCount: 5,
          lockedUntil: expect.any(Date),
        }),
      );

      const updateCall = userRepository.update.mock.calls[0];
      const updateData = updateCall[1] as { lockedUntil?: Date };
      const lockedUntilArg = updateData.lockedUntil as Date;
      const expectedLockDurationMs = 15 * 60 * 1000;
      const diffMs = lockedUntilArg.getTime() - beforeAttempt;

      expect(diffMs).toBeGreaterThanOrEqual(expectedLockDurationMs - 1000);
      expect(diffMs).toBeLessThanOrEqual(expectedLockDurationMs + 5000);
    });

    it('rejects with AccountDisabledException if user status is disabled', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        accountStatus: 'disabled',
      } as UserEntity);
      passwordHasher.verify.mockResolvedValue(true);

      await expect(
        service.authenticate({
          email: 'student@naba.edu.sa',
          password: 'ValidPassword123!',
        }),
      ).rejects.toThrow(AccountDisabledException);
    });

    it('rejects with InvalidCredentialsException if account is pending_verification or email unverified', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        accountStatus: 'pending_verification',
        emailVerifiedAt: null,
      } as UserEntity);
      passwordHasher.verify.mockResolvedValue(true);

      await expect(
        service.authenticate({
          email: 'student@naba.edu.sa',
          password: 'ValidPassword123!',
        }),
      ).rejects.toThrow(InvalidCredentialsException);
    });
  });

  describe('getUserProfile', () => {
    it('returns safe user profile with assigned roles and zero credential leakage', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 'user-uuid-1234',
        email: 'student@naba.edu.sa',
        normalizedEmail: 'student@naba.edu.sa',
        passwordHash: '$argon2id$v=19$mockhash',
        accountStatus: 'active',
        failedLoginCount: 4,
        lockedUntil: new Date('2026-01-01T00:00:00Z'),
        emailVerifiedAt: new Date('2026-01-01T00:00:00Z'),
        lastLoginAt: new Date('2026-01-02T00:00:00Z'),
        createdAt: new Date('2026-01-01T00:00:00Z'),
      } as UserEntity);

      roleAssignmentRepository.find.mockResolvedValue([
        {
          id: 'assign-1',
          userId: 'user-uuid-1234',
          roleId: 'role-1',
          scopeType: 'global',
          scopeId: null,
          role: {
            id: 'role-1',
            code: 'instructor',
            nameAr: 'مدرس',
            nameEn: 'Instructor',
          },
        } as unknown as UserRoleAssignmentEntity,
      ]);

      const profile = await service.getUserProfile('user-uuid-1234');

      expect(profile).toEqual({
        id: 'user-uuid-1234',
        email: 'student@naba.edu.sa',
        accountStatus: 'active',
        primaryRole: 'instructor',
        roles: [
          {
            code: 'instructor',
            nameAr: 'مدرس',
            nameEn: 'Instructor',
            scopeType: 'global',
            scopeId: null,
          },
        ],
        emailVerifiedAt: '2026-01-01T00:00:00.000Z',
        lastLoginAt: '2026-01-02T00:00:00.000Z',
        createdAt: '2026-01-01T00:00:00.000Z',
      });

      // Strict security verification: zero password hash, lockout, or failed attempt leakage
      const serialized = JSON.stringify(profile);
      expect(serialized).not.toContain('passwordHash');
      expect(serialized).not.toContain('failedLoginCount');
      expect(serialized).not.toContain('lockedUntil');
    });

    it('defaults primaryRole to student if no active roles found', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 'user-uuid-1234',
        email: 'student@naba.edu.sa',
        accountStatus: 'active',
      } as UserEntity);

      roleAssignmentRepository.find.mockResolvedValue([]);

      const profile = await service.getUserProfile('user-uuid-1234');
      expect(profile.primaryRole).toBe('student');
      expect(profile.roles).toEqual([]);
    });

    it('throws InvalidCredentialsException if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.getUserProfile('non-existent-user')).rejects.toThrow(
        InvalidCredentialsException,
      );
    });
  });
});
