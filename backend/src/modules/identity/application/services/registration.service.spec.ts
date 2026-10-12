import { Repository, DataSource, EntityManager } from 'typeorm';
import { RegistrationService } from './registration.service';
import { UserEntity } from '../../infrastructure/persistence/entities/user.entity';
import { RoleEntity } from '../../infrastructure/persistence/entities/role.entity';
import { UserRoleAssignmentEntity } from '../../infrastructure/persistence/entities/user-role-assignment.entity';
import { EmailVerificationTokenEntity } from '../../infrastructure/persistence/entities/email-verification-token.entity';
import { UserAccountStatusEventEntity } from '../../infrastructure/persistence/entities/user-account-status-event.entity';
import { PasswordHasher } from '../ports/password-hasher.port';
import { EmailSender } from '../ports/email-sender.port';
import { SecureTokenService } from '../../infrastructure/security/secure-token.service';
import { PasswordPolicyViolationException } from '../../domain/identity.errors';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let userRepository: Partial<Repository<UserEntity>>;
  let roleRepository: Partial<Repository<RoleEntity>>;
  let dataSource: Partial<DataSource>;
  let passwordHasher: Partial<PasswordHasher>;
  let secureTokenService: SecureTokenService;
  let emailSender: Partial<EmailSender>;
  let entityManager: Partial<EntityManager>;

  beforeEach(() => {
    userRepository = {
      findOne: jest.fn(),
    };
    roleRepository = {
      findOne: jest.fn(),
    };
    passwordHasher = {
      hash: jest.fn().mockResolvedValue('argon2id$hashedpassword'),
      verify: jest.fn().mockResolvedValue(true),
    };
    secureTokenService = new SecureTokenService();
    emailSender = {
      sendEmail: jest.fn().mockResolvedValue(undefined),
      sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    };

    entityManager = {
      create: jest.fn((entityClass, plain) => plain) as any,
      save: jest.fn((entityClass, entity) => {
        if (entityClass === UserEntity) {
          return Promise.resolve({ id: 'user-uuid-1234', ...entity });
        }
        return Promise.resolve(entity);
      }) as any,
      findOne: jest.fn().mockResolvedValue({ id: 'role-uuid-student', code: 'student' }) as any,
    };

    dataSource = {
      transaction: jest.fn().mockImplementation(async (cb: any) => {
        return cb(entityManager as EntityManager);
      }),
    } as unknown as Partial<DataSource>;

    service = new RegistrationService(
      userRepository as Repository<UserEntity>,
      roleRepository as Repository<RoleEntity>,
      dataSource as DataSource,
      passwordHasher as PasswordHasher,
      secureTokenService,
      emailSender as EmailSender,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should reject registration if password fails complexity policy', async () => {
    await expect(
      service.register({
        email: 'user@example.com',
        password: 'short',
      }),
    ).rejects.toThrow(PasswordPolicyViolationException);
  });

  it('should return anti-enumeration generic response without leaking if email is already registered', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue({
      id: 'existing-id',
      email: 'user@example.com',
      normalizedEmail: 'user@example.com',
    });

    const result = await service.register({
      email: 'user@example.com',
      password: 'ValidPassword123!',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe('verification_required');
    expect(result.message).toContain('If this email address is eligible');
    // Ensure no duplicate emails or transactions were initiated
    expect(emailSender.sendVerificationEmail).not.toHaveBeenCalled();
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('should successfully register new user with student role and dispatch verification email', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue(null);

    const result = await service.register({
      email: 'NewStudent@Naba.EDU.SA',
      password: 'StrongStudentPassword2026!',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe('verification_required');
    expect(passwordHasher.hash).toHaveBeenCalledWith('StrongStudentPassword2026!');
    expect(entityManager.findOne).toHaveBeenCalledWith(RoleEntity, {
      where: { code: 'student' },
    });
    expect(entityManager.create).toHaveBeenCalledWith(
      UserRoleAssignmentEntity,
      expect.objectContaining({
        roleId: 'role-uuid-student',
        scopeType: 'global',
      }),
    );
    expect(emailSender.sendVerificationEmail).toHaveBeenCalledWith(
      'NewStudent@Naba.EDU.SA',
      expect.any(String),
    );
  });

  it('should strictly ignore caller-supplied roleCode and only assign canonical student role', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue(null);

    // Attempting privilege escalation by injecting roleCode
    const maliciousInput = {
      email: 'Attacker@Naba.EDU.SA',
      password: 'StrongAttackerPassword2026!',
      roleCode: 'system_admin',
    };

    const result = await service.register(maliciousInput as any);

    expect(result).toBeDefined();
    expect(result.status).toBe('verification_required');
    // Role lookup must only look for student, never system_admin
    expect(entityManager.findOne).toHaveBeenCalledWith(RoleEntity, {
      where: { code: 'student' },
    });
    expect(entityManager.findOne).not.toHaveBeenCalledWith(RoleEntity, {
      where: { code: 'system_admin' },
    });
    expect(entityManager.create).toHaveBeenCalledWith(
      UserRoleAssignmentEntity,
      expect.objectContaining({
        roleId: 'role-uuid-student',
      }),
    );
  });

  it('should abort and throw an error if canonical student role is not seeded', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue(null);
    (entityManager.findOne as jest.Mock).mockResolvedValue(null); // Role not found

    await expect(
      service.register({
        email: 'student@naba.edu.sa',
        password: 'StrongStudentPassword2026!',
      }),
    ).rejects.toThrow('Required canonical role "student" is not seeded in database');
  });

  it('should handle concurrent unique constraint race condition gracefully via anti-enumeration', async () => {
    (userRepository.findOne as jest.Mock)
      .mockResolvedValueOnce(null) // First check: not found
      .mockResolvedValueOnce({ id: 'concurrent-user-id' }); // Double-check after 23505 race

    (dataSource.transaction as jest.Mock).mockRejectedValue({
      code: '23505',
      detail: 'Key (normalized_email)=(student@naba.edu.sa) already exists.',
    });

    const result = await service.register({
      email: 'student@naba.edu.sa',
      password: 'StrongStudentPassword2026!',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe('verification_required');
  });
});
