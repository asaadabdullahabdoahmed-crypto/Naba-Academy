import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository, EntityManager } from 'typeorm';
import * as crypto from 'crypto';
import { UserSessionEntity } from '../../infrastructure/persistence/entities/user-session.entity';
import { UserEntity } from '../../infrastructure/persistence/entities/user.entity';
import { SecureTokenService } from '../../infrastructure/security/secure-token.service';
import {
  SessionRevokedException,
  AccountDisabledException,
} from '../../domain/identity.errors';

export interface CreateSessionInput {
  userId: string;
  userAgent?: string | null;
  deviceLabel?: string | null;
  ipAddress?: string | null;
}

export interface CreatedSessionTokens {
  sessionId: string;
  rawSessionToken: string;
  rawCsrfToken: string;
  expiresAt: Date;
}

export interface ValidatedSession {
  session: UserSessionEntity;
  user: UserEntity;
}

export interface ActiveSessionItem {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location?: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  // Absolute session lifetime: 7 days (604,800,000 ms) per architectural requirements
  public static readonly SESSION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

  constructor(
    @InjectRepository(UserSessionEntity)
    private readonly sessionRepository: Repository<UserSessionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly secureTokenService: SecureTokenService,
  ) {}

  /**
   * Creates a new server-side session for an authenticated user.
   *
   * Invariants:
   * 1. Generates 256-bit entropy random token in base64url for session identification.
   * 2. Generates an independent 256-bit random CSRF token in base64url.
   * 3. Stores only the SHA-256 hashes (token_hash and csrf_token_hash) in the database.
   * 4. Sets 7-day absolute lifetime for expires_at.
   * 5. Returns raw tokens exclusively to the caller for immediate HTTP transport headers/cookies.
   */
  async createSession(input: CreateSessionInput): Promise<CreatedSessionTokens> {
    const sessionTokenResult = this.secureTokenService.generateToken();
    const csrfTokenResult = this.secureTokenService.generateToken();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + SessionService.SESSION_LIFETIME_MS);

    const session = this.sessionRepository.create({
      userId: input.userId,
      tokenHash: sessionTokenResult.tokenHash,
      csrfTokenHash: csrfTokenResult.tokenHash,
      userAgent: input.userAgent || null,
      deviceLabel: input.deviceLabel || null,
      ipAddress: input.ipAddress || null,
      createdAt: now,
      lastSeenAt: now,
      expiresAt,
      revokedAt: null,
      revokeReason: null,
    });

    const savedSession = await this.sessionRepository.save(session);

    this.logger.log(`Created new session ${savedSession.id} for user ${input.userId}`);

    return {
      sessionId: savedSession.id,
      rawSessionToken: sessionTokenResult.rawToken,
      rawCsrfToken: csrfTokenResult.rawToken,
      expiresAt,
    };
  }

  /**
   * Validates a session by hashing the raw session token and checking against active records.
   *
   * Invariants:
   * 1. Rejects if session does not exist.
   * 2. Rejects if session is expired (expires_at <= now).
   * 3. Rejects if session is revoked (revoked_at is not null).
   * 4. Rejects if the associated user does not exist or has inactive/disabled account status.
   * 5. Updates `last_seen_at` on successful validation.
   */
  async validateSession(rawSessionToken: string): Promise<ValidatedSession> {
    if (!rawSessionToken || typeof rawSessionToken !== 'string') {
      throw new SessionRevokedException('Invalid or missing session token');
    }

    const tokenHash = this.secureTokenService.hashToken(rawSessionToken.trim());

    const session = await this.sessionRepository.findOne({
      where: { tokenHash },
    });

    if (!session) {
      throw new SessionRevokedException('Session not found or invalid');
    }

    const now = new Date();

    // Check revocation
    if (session.revokedAt) {
      throw new SessionRevokedException(`Session revoked: ${session.revokeReason || 'Revoked'}`);
    }

    // Check expiration
    if (session.expiresAt <= now) {
      throw new SessionRevokedException('Session has expired');
    }

    // Check user account status
    const user = await this.userRepository.findOne({
      where: { id: session.userId },
    });

    if (!user) {
      throw new SessionRevokedException('User associated with session not found');
    }

    if (user.accountStatus === 'disabled') {
      throw new AccountDisabledException('User account is disabled');
    }

    if (user.accountStatus !== 'active' || user.emailVerifiedAt === null) {
      throw new SessionRevokedException('User account is not active or email is not verified');
    }

    // Touch session last_seen_at
    await this.sessionRepository.update(session.id, {
      lastSeenAt: now,
    });

    return {
      session,
      user,
    };
  }

  /**
   * Revokes a session by raw session token (e.g. during user logout).
   * Hashes the raw token to locate the database session and marks it revoked.
   * If token is invalid or session does not exist, handles gracefully without error.
   */
  async revokeSessionByToken(rawSessionToken: string, reason = 'User logged out'): Promise<void> {
    if (!rawSessionToken || typeof rawSessionToken !== 'string') {
      return;
    }

    const tokenHash = this.secureTokenService.hashToken(rawSessionToken.trim());
    const session = await this.sessionRepository.findOne({
      where: { tokenHash },
    });

    if (session && !session.revokedAt) {
      await this.sessionRepository.update(session.id, {
        revokedAt: new Date(),
        revokeReason: reason,
      });
      this.logger.log(`Session ${session.id} successfully revoked via token. Reason: ${reason}`);
    }
  }

  /**
   * Validates a raw CSRF token against the stored hash in the session entity
   * using a constant-time comparison to prevent timing attacks.
   */
  validateCsrfToken(session: UserSessionEntity, rawCsrfToken: string): boolean {
    if (!rawCsrfToken || typeof rawCsrfToken !== 'string' || !session || !session.csrfTokenHash) {
      return false;
    }

    const tokenHash = this.secureTokenService.hashToken(rawCsrfToken.trim());
    const expectedBuf = Buffer.from(session.csrfTokenHash, 'hex');
    const actualBuf = Buffer.from(tokenHash, 'hex');

    if (expectedBuf.length !== 32 || actualBuf.length !== 32) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  }

  /**
   * Generates a new 256-bit cryptographically secure CSRF token,
   * updates the session's stored CSRF hash in PostgreSQL, and returns the raw token.
   */
  async rotateSessionCsrfToken(sessionId: string): Promise<string> {
    const tokenResult = this.secureTokenService.generateToken();
    await this.sessionRepository.update(sessionId, {
      csrfTokenHash: tokenResult.tokenHash,
    });
    this.logger.log(`Rotated CSRF token for session ${sessionId}`);
    return tokenResult.rawToken;
  }

  /**
   * Lists all currently active (non-revoked, not expired) sessions for a user,
   * identifying the calling session via isCurrent.
   */
  async listActiveSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<{ sessions: ActiveSessionItem[]; currentSessionId: string }> {
    const now = new Date();
    const activeSessions = await this.sessionRepository.find({
      where: {
        userId,
        revokedAt: IsNull(),
        expiresAt: MoreThan(now),
      },
      order: {
        lastSeenAt: 'DESC',
      },
    });

    const sessions: ActiveSessionItem[] = activeSessions.map((s) => ({
      id: s.id,
      device: s.deviceLabel || this.parseDevice(s.userAgent),
      browser: this.parseBrowser(s.userAgent),
      ipAddress: s.ipAddress || 'Unknown',
      createdAt: s.createdAt.toISOString(),
      lastActiveAt: s.lastSeenAt.toISOString(),
      isCurrent: s.id === currentSessionId,
    }));

    return {
      sessions,
      currentSessionId,
    };
  }

  /**
   * Revokes all active sessions for a user EXCEPT the current session.
   * Preserves the calling session while invalidating all other devices.
   */
  async revokeOtherSessions(
    userId: string,
    currentSessionId: string,
    reason = 'Logged out other sessions',
  ): Promise<number> {
    const result = await this.sessionRepository
      .createQueryBuilder()
      .update(UserSessionEntity)
      .set({
        revokedAt: new Date(),
        revokeReason: reason,
      })
      .where('userId = :userId', { userId })
      .andWhere('id != :currentSessionId', { currentSessionId })
      .andWhere('revokedAt IS NULL')
      .execute();

    const affected = result.affected || 0;
    this.logger.log(
      `Revoked ${affected} other sessions for user ${userId} (preserving session ${currentSessionId}). Reason: ${reason}`,
    );
    return affected;
  }

  /**
   * Revokes a specific session belonging to a user.
   * Strictly enforces session ownership: users cannot revoke sessions belonging to others.
   */
  async revokeUserSession(
    userId: string,
    targetSessionId: string,
    reason = 'Revoked by user',
  ): Promise<boolean> {
    const session = await this.sessionRepository.findOne({
      where: { id: targetSessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Cannot revoke a session belonging to another user');
    }

    if (session.revokedAt) {
      return false;
    }

    await this.sessionRepository.update(targetSessionId, {
      revokedAt: new Date(),
      revokeReason: reason,
    });

    this.logger.log(`Session ${targetSessionId} revoked by user ${userId}. Reason: ${reason}`);
    return true;
  }

  /**
   * Revokes a session by marking `revoked_at` and setting a `revoke_reason`.
   */
  async revokeSession(sessionId: string, reason = 'User logged out'): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      revokedAt: new Date(),
      revokeReason: reason,
    });

    this.logger.log(`Session ${sessionId} successfully revoked. Reason: ${reason}`);
  }

  /**
   * Revokes all active sessions for a given user (e.g. password change, administrative disable).
   * Supports execution inside an existing TypeORM EntityManager transaction to guarantee atomic rollback.
   */
  async revokeAllUserSessions(
    userId: string,
    reason = 'All sessions revoked',
    entityManager?: EntityManager,
  ): Promise<number> {
    const qb = entityManager
      ? entityManager.createQueryBuilder(UserSessionEntity, 'session')
      : this.sessionRepository.createQueryBuilder();

    const result = await qb
      .update(UserSessionEntity)
      .set({
        revokedAt: new Date(),
        revokeReason: reason,
      })
      .where('userId = :userId', { userId })
      .andWhere('revokedAt IS NULL')
      .execute();

    const affected = result.affected || 0;
    this.logger.log(`Revoked ${affected} sessions for user ${userId}. Reason: ${reason}`);
    return affected;
  }

  private parseDevice(userAgent?: string | null): string {
    if (!userAgent) return 'Desktop';
    const ua = userAgent.toLowerCase();
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'Apple iOS';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('mobile')) return 'Mobile';
    if (ua.includes('macintosh') || ua.includes('mac os')) return 'Macintosh';
    if (ua.includes('windows')) return 'Windows PC';
    if (ua.includes('linux')) return 'Linux PC';
    return 'Desktop';
  }

  private parseBrowser(userAgent?: string | null): string {
    if (!userAgent) return 'Web Browser';
    const ua = userAgent.toLowerCase();
    if (ua.includes('edg/')) return 'Edge';
    if (ua.includes('chrome/') && !ua.includes('edg/')) return 'Chrome';
    if (ua.includes('firefox/')) return 'Firefox';
    if (ua.includes('safari/') && !ua.includes('chrome/')) return 'Safari';
    return 'Web Browser';
  }
}
