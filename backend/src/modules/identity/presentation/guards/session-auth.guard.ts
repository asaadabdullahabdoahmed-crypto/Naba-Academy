import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import { SessionService } from '../../application/services/session.service';
import { extractSessionToken } from '../../infrastructure/security/cookie.config';
import { SessionRevokedException } from '../../domain/identity.errors';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionToken = extractSessionToken(request);

    if (!sessionToken) {
      throw new SessionRevokedException('Authentication required: Missing session cookie');
    }

    const { session, user } = await this.sessionService.validateSession(sessionToken);

    // Attach validated session and user to request object
    (request as unknown as Record<string, unknown>).session = session;
    (request as unknown as Record<string, unknown>).user = user;

    return true;
  }
}
