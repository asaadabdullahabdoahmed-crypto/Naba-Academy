import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserEntity } from '../../infrastructure/persistence/entities/user.entity';
import { RoleEntity } from '../../infrastructure/persistence/entities/role.entity';
import { UserRoleAssignmentEntity } from '../../infrastructure/persistence/entities/user-role-assignment.entity';
import { EmailVerificationTokenEntity } from '../../infrastructure/persistence/entities/email-verification-token.entity';
import { UserAccountStatusEventEntity } from '../../infrastructure/persistence/entities/user-account-status-event.entity';
import {
  PasswordHasher,
  PASSWORD_HASHER,
} from '../ports/password-hasher.port';
import {
  EmailSender,
  EMAIL_SENDER,
} from '../ports/email-sender.port';
import { SecureTokenService } from '../../infrastructure/security/secure-token.service';
import { normalizeEmail } from '../../infrastructure/security/email-normalizer';
import { assertPasswordPolicy } from '../../infrastructure/security/password-policy';

export interface RegisterUserInput {
  email: string;
  password: string;
  nationalId: string;
  fullNameAr: string;
  fullNameEn: string;
  phone?: string | null;
}

export interface RegisterUserResult {
  status: 'verification_required';
  message: string;
}

@Injectable()
export class RegistrationService {
  private readonly logger = new Logger(RegistrationService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly dataSource: DataSource,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    private readonly secureTokenService: SecureTokenService,
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSender,
  ) {}

  async register(input: RegisterUserInput): Promise<RegisterUserResult> {
    const genericResponse: RegisterUserResult = {
      status: 'verification_required',
      message:
        'If this email address is eligible for an account, a verification email has been sent.',
    };

    const { email: displayEmail, normalizedEmail } = normalizeEmail(input.email);
    const trimmedNationalId = (input.nationalId || '').trim();
    const trimmedNameAr = (input.fullNameAr || '').trim();
    const trimmedNameEn = (input.fullNameEn || '').trim();
    const trimmedPhone = input.phone ? input.phone.trim() : null;

    // 1. Enforce strict password policy
    assertPasswordPolicy(input.password);

    // 2. Check for existing account by normalizedEmail or nationalId (anti-enumeration: return generic response without leaking)
    const existing = await this.userRepository.findOne({
      where: [
        { normalizedEmail },
        { nationalId: trimmedNationalId },
      ],
    });

    if (existing) {
      return genericResponse;
    }

    // 3. Compute password hash via Argon2id
    const passwordHash = await this.passwordHasher.hash(input.password);

    // 4. Generate verification token
    const { rawToken, tokenHash } = this.secureTokenService.generateToken();
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // 5. Execute transactional write across entities
    try {
      await this.dataSource.transaction(async (manager) => {
        // Enforce that canonical student role is seeded in the database
        const studentRole = await manager.findOne(RoleEntity, {
          where: { code: 'student' },
        });

        if (!studentRole) {
          throw new Error('Required canonical role "student" is not seeded in database');
        }

        // Create user with full identity record matching users schema
        const user = manager.create(UserEntity, {
          nationalId: trimmedNationalId,
          nameAr: trimmedNameAr,
          nameEn: trimmedNameEn,
          email: displayEmail,
          normalizedEmail,
          phone: trimmedPhone,
          passwordHash,
          accountStatus: 'pending_verification',
          failedLoginCount: 0,
        });
        const persistedUser = await manager.save(UserEntity, user);

        // Assign exclusively the canonical student role
        const assignment = manager.create(UserRoleAssignmentEntity, {
          userId: persistedUser.id,
          roleId: studentRole.id,
          scopeType: 'global',
          scopeId: null,
        });
        await manager.save(UserRoleAssignmentEntity, assignment);

        // Record account status transition event
        const statusEvent = manager.create(UserAccountStatusEventEntity, {
          userId: persistedUser.id,
          previousStatus: null,
          newStatus: 'pending_verification',
          actorUserId: null,
          reason: 'Initial user registration',
        });
        await manager.save(UserAccountStatusEventEntity, statusEvent);

        // Save token
        const verificationToken = manager.create(EmailVerificationTokenEntity, {
          userId: persistedUser.id,
          tokenHash,
          expiresAt: tokenExpiresAt,
          usedAt: null,
        });
        await manager.save(EmailVerificationTokenEntity, verificationToken);

        return persistedUser;
      });
    } catch (err: unknown) {
      // Handle PostgreSQL unique constraint race condition on normalized_email or national_id (code 23505)
      const isUniqueViolation =
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === '23505';

      if (isUniqueViolation) {
        return genericResponse;
      }
      throw err;
    }

    // 6. Send verification email (outside transaction)
    try {
      await this.emailSender.sendVerificationEmail(displayEmail, rawToken);
    } catch (err: unknown) {
      this.logger.error(
        `Failed to deliver verification email to ${displayEmail}: ${(err as Error).message}`,
      );
    }

    return genericResponse;
  }
}
