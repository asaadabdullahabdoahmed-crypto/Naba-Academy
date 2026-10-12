import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';
import { SessionService } from '../../application/services/session.service';
import {
  extractCsrfToken,
  extractSessionToken,
} from '../../infrastructure/security/cookie.config';
import { InvalidCsrfTokenException } from '../../domain/identity.errors';
import { UserSessionEntity } from '../../infrastructure/persistence/entities/user-session.entity';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();

    // Idempotent/safe HTTP methods do not mutate state and are exempt from CSRF
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    // Extract CSRF token submitted by client (header or request body fallback)
    const headerToken = (
      request.headers['x-csrf-token'] ||
      request.headers['x-xsrf-token'] ||
      (request.body && typeof request.body === 'object' && (request.body as Record<string, unknown>)._csrf)
    ) as string | undefined;

    if (!headerToken || typeof headerToken !== 'string' || headerToken.trim().length === 0) {
      throw new InvalidCsrfTokenException('Missing CSRF token header');
    }

    const trimmedToken = headerToken.trim();

    // 1. Resolve active session (either pre-attached via SessionAuthGuard or from naba_session cookie)
    let session = (request as unknown as { session?: UserSessionEntity }).session;
    if (!session) {
      const sessionToken = extractSessionToken(request);
      if (sessionToken) {
        try {
          const validated = await this.sessionService.validateSession(sessionToken);
          session = validated.session;
          (request as unknown as Record<string, unknown>).session = session;
          (request as unknown as Record<string, unknown>).user = validated.user;
        } catch {
          // Invalid or expired session
        }
      }
    }

    // A valid authenticated session is strictly required for CSRF validation
    // Arbitrary standalone cookies or forged headers without a verified database session are rejected
    if (!session || !session.csrfTokenHash) {
      throw new InvalidCsrfTokenException('Active authenticated session required for CSRF validation');
    }

    // 2. Validate submitted header token against the authenticated session's stored CSRF hash in PostgreSQL
    const isValid = this.sessionService.validateCsrfToken(session, trimmedToken);
    if (!isValid) {
      throw new InvalidCsrfTokenException('CSRF token does not match active session');
    }

    // 3. Double-submit cookie verification as additional defense-in-depth:
    // If naba_csrf cookie is provided, its value must also match the submitted header token using constant-time comparison
    const cookieToken = extractCsrfToken(request);
    if (cookieToken) {
      const headerBuf = Buffer.from(trimmedToken);
      const cookieBuf = Buffer.from(cookieToken);
      if (
        headerBuf.length !== cookieBuf.length ||
        !crypto.timingSafeEqual(headerBuf, cookieBuf)
      ) {
        throw new InvalidCsrfTokenException('CSRF token mismatch between header and cookie');
      }
    }

    return true;
  }
}

