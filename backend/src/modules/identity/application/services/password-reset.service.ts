import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThanOrEqual } from 'typeorm';
import { UserEntity } from '../../infrastructure/persistence/entities/user.entity';
import { PasswordResetTokenEntity } from '../../infrastructure/persistence/entities/password-reset-token.entity';
import {
  PasswordHasher,
  PASSWORD_HASHER,
} from '../ports/password-hasher.port';
import {
  EmailSender,
  EMAIL_SENDER,
} from '../ports/email-sender.port';
import { SecureTokenService } from '../../infrastructure/security/secure-token.service';
import { SessionService } from './session.service';
import { normalizeEmail } from '../../infrastructure/security/email-normalizer';
import { assertPasswordPolicy } from '../../infrastructure/security/password-policy';
import { PasswordResetInvalidOrExpiredException } from '../../domain/identity.errors';

/**
 * Password-reset token TTL: 30 minutes (1,800,000 ms) per STEP 07D-2 requirements.
 */
export const PASSWORD_RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

export interface ForgotPasswordInput {
  email: string;
  locale?: 'ar' | 'en';
}

export interface ForgotPasswordResult {
  accepted: boolean;
  message: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface ResetPasswordResult {
  success: boolean;
  message: string;
}

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PasswordResetTokenEntity)
    private readonly resetTokenRepository: Repository<PasswordResetTokenEntity>,
    private readonly dataSource: DataSource,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    private readonly secureTokenService: SecureTokenService,
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSender,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * STEP 07D-1: Initiates forgot-password workflow.
   *
   * Security & Anti-Enumeration Invariants:
   * 1. Returns neutral 202 Accepted response identically for:
   *    - Unknown email
   *    - Active account
   *    - Pending/unverified account
   *    - Disabled account
   * 2. Never exposes user existence, account status, token, token hash, or lockout info.
   * 3. Only active, verified, non-disabled accounts receive reset tokens and emails.
   * 4. Invalidates previous unused tokens before persisting new token.
   * 5. Raw token is never persisted or logged.
   */
  async forgotPassword(input: ForgotPasswordInput): Promise<ForgotPasswordResult> {
    const genericResponse: ForgotPasswordResult = {
      accepted: true,
      message: 'If the account is eligible, password reset instructions have been sent.',
    };

    if (!input || !input.email || typeof input.email !== 'string') {
      return genericResponse;
    }

    const { email: displayEmail, normalizedEmail } = normalizeEmail(input.email);

    const user = await this.userRepository.findOne({
      where: { normalizedEmail },
    });

    // Anti-enumeration: if account does not exist, is disabled, or is not verified active,
    // execute dummy crypto token generation to balance CPU execution time and return generic response.
    if (
      !user ||
      user.accountStatus === 'disabled' ||
      user.accountStatus !== 'active' ||
      user.emailVerifiedAt === null
    ) {
      this.secureTokenService.generateToken();
      return genericResponse;
    }

    // Cooldown check (60 seconds) and rolling hourly limit (5 tokens/hour) per STEP 07E
    const latestToken = await this.resetTokenRepository.findOne({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
    });
    if (latestToken && Date.now() - latestToken.createdAt.getTime() < 60 * 1000) {
      this.logger.warn(`Password reset requested within 60s cooldown for user ${user.id}. Suppressing email.`);
      return genericResponse;
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const hourlyCount = await this.resetTokenRepository.count({
      where: {
        userId: user.id,
        createdAt: MoreThanOrEqual(oneHourAgo),
      },
    });
    if (hourlyCount >= 5) {
      this.logger.warn(`Password reset hourly limit (5) reached for user ${user.id}. Suppressing email.`);
      return genericResponse;
    }

    // Generate 256-bit cryptographically secure reset token
    const { rawToken, tokenHash } = this.secureTokenService.generateToken();
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

    // Atomically invalidate old unused tokens and persist the new token
    await this.dataSource.transaction(async (manager) => {
      // Invalidate existing unused reset tokens for this user
      await manager
        .createQueryBuilder()
        .update(PasswordResetTokenEntity)
        .set({ usedAt: new Date() })
        .where('user_id = :userId', { userId: user.id })
        .andWhere('used_at IS NULL')
        .execute();

      // Create new reset token record
      const newToken = manager.create(PasswordResetTokenEntity, {
        userId: user.id,
        tokenHash,
        expiresAt,
        usedAt: null,
      });

      await manager.save(PasswordResetTokenEntity, newToken);
    });

    // Send email outside the transaction; handle failures gracefully without breaking anti-enumeration
    try {
      await this.emailSender.sendPasswordResetEmail(
        displayEmail,
        rawToken,
        input.locale || 'ar',
      );
    } catch (err: unknown) {
      this.logger.error(
        `Failed to deliver password reset email to ${displayEmail}: ${(err as Error).message}`,
      );
    }

    return genericResponse;
  }

  /**
   * STEP 07D-4 to 07D-7: Resets password using a one-time reset token.
   *
   * Invariants:
   * 1. Reuses existing password policy (assertPasswordPolicy) and Argon2id hasher.
   * 2. Rejects invalid, expired, used, or unknown tokens with PASSWORD_RESET_INVALID_OR_EXPIRED (HTTP 400).
   * 3. Executes atomically with pessimistic locking to prevent race conditions.
   * 4. Updates password_hash and password_changed_at.
   * 5. Clears failed_login_count (0) and locked_until (null).
   * 6. Marks consumed token as used (used_at = now).
   * 7. Invalidates all other outstanding reset tokens for the user.
   * 8. Revokes all active sessions for the user via SessionService.
   * 9. Preserves account status, roles, permissions, and does NOT auto-login.
   */
  async resetPassword(input: ResetPasswordInput): Promise<ResetPasswordResult> {
    if (!input || !input.token || typeof input.token !== 'string') {
      throw new PasswordResetInvalidOrExpiredException();
    }

    const trimmedToken = input.token.trim();
    if (trimmedToken.length === 0) {
      throw new PasswordResetInvalidOrExpiredException();
    }

    // 1. Enforce authoritative password policy
    assertPasswordPolicy(input.password);

    // 2. Hash raw token and compute new password hash via Argon2id
    const tokenHash = this.secureTokenService.hashToken(trimmedToken);
    const newPasswordHash = await this.passwordHasher.hash(input.password);

    // 3. Execute atomic transaction
    const targetUserId = await this.dataSource.transaction(async (manager) => {
      // Resolve token record with pessimistic write lock to prevent concurrent consumption
      const tokenRecord = await manager.findOne(PasswordResetTokenEntity, {
        where: { tokenHash },
        lock: { mode: 'pessimistic_write' },
      });

      if (!tokenRecord) {
        throw new PasswordResetInvalidOrExpiredException();
      }

      // Check if already used
      if (tokenRecord.usedAt !== null) {
        throw new PasswordResetInvalidOrExpiredException();
      }

      // Check if expired
      const now = new Date();
      if (tokenRecord.expiresAt <= now) {
        throw new PasswordResetInvalidOrExpiredException();
      }

      // Resolve associated user with lock
      const user = await manager.findOne(UserEntity, {
        where: { id: tokenRecord.userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        throw new PasswordResetInvalidOrExpiredException();
      }

      // Account eligibility: do not allow password reset for disabled accounts
      if (user.accountStatus === 'disabled') {
        throw new PasswordResetInvalidOrExpiredException();
      }

      // Update password and reset temporary lockout state
      user.passwordHash = newPasswordHash;
      user.passwordChangedAt = now;
      user.failedLoginCount = 0;
      user.lockedUntil = null;
      // accountStatus and emailVerifiedAt are preserved untouched
      await manager.save(UserEntity, user);

      // Mark the consumed token as used
      tokenRecord.usedAt = now;
      await manager.save(PasswordResetTokenEntity, tokenRecord);

      // Invalidate all other outstanding unused password reset tokens for this user
      await manager
        .createQueryBuilder()
        .update(PasswordResetTokenEntity)
        .set({ usedAt: now })
        .where('user_id = :userId', { userId: user.id })
        .andWhere('id != :tokenId', { tokenId: tokenRecord.id })
        .andWhere('used_at IS NULL')
        .execute();

      // Atomically revoke all active sessions for this user within this exact PostgreSQL transaction
      await this.sessionService.revokeAllUserSessions(
        user.id,
        'Password reset successfully',
        manager,
      );

      return user.id;
    });

    return {
      success: true,
      message:
        'Password has been reset successfully. Please log in with your new password.',
    };
  }
}
