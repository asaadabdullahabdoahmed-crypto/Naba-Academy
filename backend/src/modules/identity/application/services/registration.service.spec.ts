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

  const validRegistrationInput = {
    email: 'NewStudent@Naba.EDU.SA',
    password: 'StrongStudentPassword2026!',
    nationalId: '1092837465',
    fullNameAr: 'عمر بن عبد العزيز الشمري',
    fullNameEn: 'Omar Abdulaziz Al-Shammari',
    phone: '0501234567',
  };

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
        ...validRegistrationInput,
        password: 'short',
      }),
    ).rejects.toThrow(PasswordPolicyViolationException);
  });

  it('should return anti-enumeration generic response without leaking if email is already registered', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue({
      id: 'existing-id',
      email: 'newstudent@naba.edu.sa',
      normalizedEmail: 'newstudent@naba.edu.sa',
      nationalId: '1092837465',
    });

    const result = await service.register(validRegistrationInput);

    expect(result).toBeDefined();
    expect(result.status).toBe('verification_required');
    expect(result.message).toContain('If this email address is eligible');
    expect(emailSender.sendVerificationEmail).not.toHaveBeenCalled();
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('should return anti-enumeration generic response if nationalId is already registered', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue({
      id: 'existing-different-email-id',
      email: 'other@naba.edu.sa',
      normalizedEmail: 'other@naba.edu.sa',
      nationalId: '1092837465',
    });

    const result = await service.register(validRegistrationInput);

    expect(result).toBeDefined();
    expect(result.status).toBe('verification_required');
    expect(emailSender.sendVerificationEmail).not.toHaveBeenCalled();
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('should successfully register new user with full identity fields and student role', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue(null);

    const result = await service.register(validRegistrationInput);

    expect(result).toBeDefined();
    expect(result.status).toBe('verification_required');
    expect(passwordHasher.hash).toHaveBeenCalledWith('StrongStudentPassword2026!');

    // Verify UserEntity created with correct fields and never plaintext password
    expect(entityManager.create).toHaveBeenCalledWith(
      UserEntity,
      expect.objectContaining({
        nationalId: '1092837465',
        nameAr: 'عمر بن عبد العزيز الشمري',
        nameEn: 'Omar Abdulaziz Al-Shammari',
        email: 'NewStudent@Naba.EDU.SA',
        normalizedEmail: 'newstudent@naba.edu.sa',
        phone: '0501234567',
        passwordHash: 'argon2id$hashedpassword',
        accountStatus: 'pending_verification',
      }),
    );

    // Verify canonical student role assigned
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

  it('should support registration without optional phone', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue(null);

    const inputWithoutPhone = {
      email: 'Student2@Naba.EDU.SA',
      password: 'StrongStudentPassword2026!',
      nationalId: '1092837466',
      fullNameAr: 'محمد بن سالم',
      fullNameEn: 'Mohammed Salem',
    };

    const result = await service.register(inputWithoutPhone);

    expect(result).toBeDefined();
    expect(result.status).toBe('verification_required');
    expect(entityManager.create).toHaveBeenCalledWith(
      UserEntity,
      expect.objectContaining({
        phone: null,
      }),
    );
  });

  it('should strictly ignore caller-supplied roleCode or academic fields (program, GPA)', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue(null);

    const inputWithExtraFields = {
      ...validRegistrationInput,
      roleCode: 'system_admin',
      program: 'BS-CS',
      highSchoolGpa: '98.5',
    };

    const result = await service.register(inputWithExtraFields as any);

    expect(result).toBeDefined();
    expect(result.status).toBe('verification_required');
    // Role lookup must only look for student, never system_admin
    expect(entityManager.findOne).toHaveBeenCalledWith(RoleEntity, {
      where: { code: 'student' },
    });
    // Program or GPA must never be set on UserEntity
    expect(entityManager.create).toHaveBeenCalledWith(
      UserEntity,
      expect.not.objectContaining({
        program: expect.anything(),
        highSchoolGpa: expect.anything(),
      }),
    );
  });

  it('should abort and throw an error if canonical student role is not seeded', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue(null);
    (entityManager.findOne as jest.Mock).mockResolvedValue(null);

    await expect(service.register(validRegistrationInput)).rejects.toThrow(
      'Required canonical role "student" is not seeded in database',
    );
  });

  it('should handle concurrent unique constraint race condition gracefully via anti-enumeration', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue(null);

    (dataSource.transaction as jest.Mock).mockRejectedValue({
      code: '23505',
      detail: 'Key (national_id)=(1092837465) already exists.',
    });

    const result = await service.register(validRegistrationInput);

    expect(result).toBeDefined();
    expect(result.status).toBe('verification_required');
  });
});
