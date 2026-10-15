import { Injectable, Inject, Logger, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { UserEntity } from '../../infrastructure/persistence/entities/user.entity';
import { UserRoleAssignmentEntity } from '../../infrastructure/persistence/entities/user-role-assignment.entity';
import {
  PasswordHasher,
  PASSWORD_HASHER,
} from '../ports/password-hasher.port';
import { normalizeEmail } from '../../infrastructure/security/email-normalizer';
import {
  InvalidCredentialsException,
  AccountLockedException,
  AccountDisabledException,
} from '../../domain/identity.errors';

export interface AuthenticateCredentialsInput {
  email: string;
  password: string;
}

export interface AuthenticatedUserResult {
  id: string;
  email: string;
  normalizedEmail: string;
  accountStatus: string;
}

export interface SafeUserRole {
  code: string;
  nameAr?: string;
  nameEn?: string;
  scopeType?: string;
  scopeId?: string | null;
}

export interface SafeUserProfile {
  id: string;
  email: string;
  accountStatus: string;
  primaryRole: string;
  roles: SafeUserRole[];
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  // Maximum consecutive failed login attempts before temporary lockout
  public static readonly MAX_FAILED_ATTEMPTS = 5;
  // Lockout duration in minutes: exactly 15 minutes per architecture specification
  public static readonly LOCKOUT_DURATION_MINUTES = 15;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Optional()
    @InjectRepository(UserRoleAssignmentEntity)
    private readonly roleAssignmentRepository?: Repository<UserRoleAssignmentEntity>,
  ) {}

  /**
   * Authenticates user credentials with constant-time/generic error handling,
   * account status verification, and robust failed-attempt tracking with automatic lockout.
   *
   * Security Invariants:
   * 1. Generic error message for both non-existent emails and incorrect passwords (anti-enumeration).
   * 2. Failed login attempt counter increments and commits even when authentication throws.
   * 3. 5 consecutive failed attempts trigger a 15-minute lockout based on `locked_until`.
   * 4. Successful authentication resets `failed_login_count` to 0 and clears `locked_until`.
   * 5. Password hashes are NEVER exposed in returned values or logged.
   */
  async authenticate(input: AuthenticateCredentialsInput): Promise<AuthenticatedUserResult> {
    const rawEmail = input.email || '';
    const rawPassword = input.password || '';

    const { normalizedEmail } = normalizeEmail(rawEmail);

    // 1. Locate user record by normalized email
    const user = await this.userRepository.findOne({
      where: { normalizedEmail },
    });

    // 2. Anti-enumeration / unknown user check
    if (!user) {
      this.logger.warn(`Authentication failed: Account not found for normalized email.`);
      throw new InvalidCredentialsException();
    }

    const now = new Date();

    // 3. Lockout check
    if (user.lockedUntil && user.lockedUntil > now) {
      this.logger.warn(`Authentication rejected: Account ${user.id} is temporarily locked until ${user.lockedUntil.toISOString()}`);
      throw new AccountLockedException();
    }

    // 4. Verify password against stored Argon2id hash
    const isPasswordValid = await this.passwordHasher.verify(
  user.passwordHash,
  rawPassword,
);

    if (!isPasswordValid) {
      // Increment failed login count
      const updatedCount = (user.failedLoginCount || 0) + 1;
      let newLockedUntil: Date | null = null;

      if (updatedCount >= AuthenticationService.MAX_FAILED_ATTEMPTS) {
        newLockedUntil = new Date(now.getTime() + AuthenticationService.LOCKOUT_DURATION_MINUTES * 60 * 1000);
        this.logger.warn(`Account ${user.id} has reached ${updatedCount} failed attempts; locking until ${newLockedUntil.toISOString()}`);
      } else {
        this.logger.warn(`Authentication failed: Invalid password for account ${user.id}. Failed attempt #${updatedCount}`);
      }

      // CRITICAL: Persist failed login state immediately to ensure lockout enforcement
      await this.userRepository.update(user.id, {
        failedLoginCount: updatedCount,
        lockedUntil: newLockedUntil,
      });

      if (newLockedUntil) {
        throw new AccountLockedException();
      }

      throw new InvalidCredentialsException();
    }

    // 5. Check account lifecycle status
    if (user.accountStatus === 'disabled') {
      this.logger.warn(`Authentication rejected: Account ${user.id} is disabled`);
      throw new AccountDisabledException('User account is disabled');
    }

    if (user.accountStatus === 'pending_verification' || !user.emailVerifiedAt) {
      this.logger.warn(`Authentication rejected: Account ${user.id} is pending email verification`);
      throw new InvalidCredentialsException('Email address has not been verified yet');
    }

    // 6. Reset failed counter, clear lockout, and update last_login_at on success
    await this.userRepository.update(user.id, {
      failedLoginCount: 0,
      lockedUntil: null,
      lastLoginAt: now,
    });

    this.logger.log(`Authentication successful for user ${user.id}`);

    return {
      id: user.id,
      email: user.email,
      normalizedEmail: user.normalizedEmail,
      accountStatus: user.accountStatus,
    };
  }

  /**
   * Retrieves safe user profile for authenticated session without leaking credentials,
   * hashes, lockout counters, or internal database metadata.
   */
  async getUserProfile(userId: string): Promise<SafeUserProfile> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new InvalidCredentialsException('User account not found');
    }

    let roles: SafeUserRole[] = [];

    if (this.roleAssignmentRepository) {
      const assignments = await this.roleAssignmentRepository.find({
        where: {
          userId,
          revokedAt: IsNull(),
        },
        relations: ['role'],
      });

      roles = assignments.map((a) => ({
        code: a.role?.code || 'student',
        nameAr: a.role?.nameAr,
        nameEn: a.role?.nameEn,
        scopeType: a.scopeType,
        scopeId: a.scopeId,
      }));
    }

    const primaryRole = roles.length > 0 ? roles[0].code : 'student';

    return {
      id: user.id,
      email: user.email,
      accountStatus: user.accountStatus,
      primaryRole,
      roles,
      emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
    };
  }
}
