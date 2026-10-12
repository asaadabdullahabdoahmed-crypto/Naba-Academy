import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThanOrEqual } from 'typeorm';
import { UserEntity } from '../../infrastructure/persistence/entities/user.entity';
import { EmailVerificationTokenEntity } from '../../infrastructure/persistence/entities/email-verification-token.entity';
import { UserAccountStatusEventEntity } from '../../infrastructure/persistence/entities/user-account-status-event.entity';
import { SecureTokenService } from '../../infrastructure/security/secure-token.service';
import { normalizeEmail } from '../../infrastructure/security/email-normalizer';
import {
  EmailSender,
  EMAIL_SENDER,
} from '../ports/email-sender.port';
import {
  InvalidVerificationTokenException,
  VerificationTokenExpiredException,
  VerificationTokenAlreadyUsedException,
  AccountDisabledException,
} from '../../domain/identity.errors';

export interface VerifyEmailResult {
  success: boolean;
  email: string;
  message: string;
}

export interface ResendVerificationResult {
  success: boolean;
  message: string;
}

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(EmailVerificationTokenEntity)
    private readonly tokenRepository: Repository<EmailVerificationTokenEntity>,
    private readonly dataSource: DataSource,
    private readonly secureTokenService: SecureTokenService,
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSender,
  ) {}

  async verifyEmail(rawToken: string): Promise<VerifyEmailResult> {
    if (!rawToken || typeof rawToken !== 'string') {
      throw new InvalidVerificationTokenException();
    }

    const tokenHash = this.secureTokenService.hashToken(rawToken.trim());

    // 1. Locate token by hash
    const tokenRecord = await this.tokenRepository.findOne({
      where: { tokenHash },
    });

    if (!tokenRecord) {
      throw new InvalidVerificationTokenException();
    }

    // 2. Validate token state
    if (tokenRecord.usedAt !== null) {
      throw new VerificationTokenAlreadyUsedException();
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new VerificationTokenExpiredException();
    }

    // 3. Locate user
    const user = await this.userRepository.findOne({
      where: { id: tokenRecord.userId },
    });

    if (!user) {
      throw new InvalidVerificationTokenException();
    }

    if (user.accountStatus === 'disabled') {
      throw new AccountDisabledException();
    }

    // 4. Update token and user state inside atomic transaction
    await this.dataSource.transaction(async (manager) => {
      const now = new Date();

      // Mark token as used
      tokenRecord.usedAt = now;
      await manager.save(EmailVerificationTokenEntity, tokenRecord);

      // Transition user to active if currently pending verification
      const previousStatus = user.accountStatus;
      user.emailVerifiedAt = now;
      user.accountStatus = 'active';
      await manager.save(UserEntity, user);

      // Record status transition event if changed
      if (previousStatus !== 'active') {
        const event = manager.create(UserAccountStatusEventEntity, {
          userId: user.id,
          previousStatus,
          newStatus: 'active',
          actorUserId: user.id,
          reason: 'Email address verified successfully',
        });
        await manager.save(UserAccountStatusEventEntity, event);
      }
    });

    return {
      success: true,
      email: user.email,
      message: 'Email verified successfully. Your account is now active.',
    };
  }

  async resendVerification(email: string): Promise<ResendVerificationResult> {
    const genericResponse: ResendVerificationResult = {
      success: true,
      message:
        'If an unverified account exists with this email address, a new verification link has been sent.',
    };

    if (!email) {
      return genericResponse;
    }

    const { normalizedEmail } = normalizeEmail(email);

    const user = await this.userRepository.findOne({
      where: { normalizedEmail },
    });

    // Anti-enumeration: return standard success message if user does not exist,
    // is disabled, or is already verified, without leaking account state.
    // Execute dummy crypto token generation to balance CPU execution time.
    if (
      !user ||
      user.accountStatus === 'disabled' ||
      user.emailVerifiedAt !== null ||
      user.accountStatus !== 'pending_verification'
    ) {
      this.secureTokenService.generateToken();
      return genericResponse;
    }

    // Cooldown check (60 seconds) and rolling hourly limit (5 tokens/hour) per STEP 07E
    const latestToken = await this.tokenRepository.findOne({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
    });
    if (latestToken && Date.now() - latestToken.createdAt.getTime() < 60 * 1000) {
      this.logger.warn(`Verification email requested within 60s cooldown for user ${user.id}. Suppressing email.`);
      return genericResponse;
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const hourlyCount = await this.tokenRepository.count({
      where: {
        userId: user.id,
        createdAt: MoreThanOrEqual(oneHourAgo),
      },
    });
    if (hourlyCount >= 5) {
      this.logger.warn(`Verification email hourly limit (5) reached for user ${user.id}. Suppressing email.`);
      return genericResponse;
    }

    // Generate new verification token
    const { rawToken, tokenHash } = this.secureTokenService.generateToken();
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Save token in database
    await this.dataSource.transaction(async (manager) => {
      const token = manager.create(EmailVerificationTokenEntity, {
        userId: user.id,
        tokenHash,
        expiresAt: tokenExpiresAt,
        usedAt: null,
      });
      await manager.save(EmailVerificationTokenEntity, token);
    });

    // Send email
    try {
      await this.emailSender.sendVerificationEmail(user.email, rawToken);
    } catch (err: unknown) {
      this.logger.error(
        `Failed to resend verification email to ${user.email}: ${(err as Error).message}`,
      );
    }

    return genericResponse;
  }
}
