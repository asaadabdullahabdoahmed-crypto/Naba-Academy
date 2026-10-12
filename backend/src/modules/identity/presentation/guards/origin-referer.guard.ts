import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { InvalidOriginException } from '../../domain/identity.errors';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class OriginRefererGuard implements CanActivate {
  private readonly allowedOrigins: string[];

  constructor(private readonly configService: ConfigService) {
    this.allowedOrigins = this.configService.get<string[]>('app.corsOrigins', [
      'http://localhost:3000',
    ]);
  }

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();

    // Only inspect state-changing requests
    if (!STATE_CHANGING_METHODS.has(req.method.toUpperCase())) {
      return true;
    }

    const origin = req.headers['origin'] as string | undefined;
    const referer = req.headers['referer'] as string | undefined;
    const secFetchSite = req.headers['sec-fetch-site'] as string | undefined;

    // 1. Direct Origin verification (primary browser mechanism)
    if (origin && typeof origin === 'string') {
      const trimmedOrigin = origin.trim();
      if (!this.allowedOrigins.includes(trimmedOrigin)) {
        throw new InvalidOriginException(
          `CORS/Origin policy violation: '${trimmedOrigin}' is not in trusted allowlist`,
        );
      }
      return true;
    }

    // 2. Referer fallback (if Origin omitted by older browsers)
    if (referer && typeof referer === 'string') {
      try {
        const refOrigin = new URL(referer).origin;
        if (!this.allowedOrigins.includes(refOrigin)) {
          throw new InvalidOriginException(
            `CORS/Referer policy violation: '${refOrigin}' is not in trusted allowlist`,
          );
        }
        return true;
      } catch {
        throw new InvalidOriginException('Malformed Referer header in state-changing request');
      }
    }

    // 3. Browser metadata check: if Sec-Fetch-Site indicates cross-site, reject
    if (secFetchSite === 'cross-site') {
      throw new InvalidOriginException(
        'Cross-site state-changing request rejected without matching Origin',
      );
    }

    // Direct non-browser clients (curl, test harnesses, native apps) omitting browser origin headers
    return true;
  }
}
