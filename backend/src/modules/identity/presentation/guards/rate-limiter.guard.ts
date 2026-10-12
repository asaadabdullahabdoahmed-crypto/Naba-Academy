import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import {
  RATE_LIMIT_METADATA_KEY,
  RateLimitOptions,
} from './rate-limiter.decorator';
import { IdentityRateLimiterService } from '../../infrastructure/security/rate-limiter.service';
import { getClientIp } from '../../infrastructure/security/client-ip.util';
import { RateLimitExceededException } from '../../domain/identity.errors';

@Injectable()
export class RateLimiterGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimiterService: IdentityRateLimiterService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<RateLimitOptions | undefined>(
      RATE_LIMIT_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) {
      return true;
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const trustProxy = this.configService.get<boolean>('app.trustProxy', false);
    const clientIp = getClientIp(req, trustProxy);

    const result = await this.rateLimiterService.consume(
      options.action,
      clientIp,
      options.limit,
      options.windowSeconds,
    );

    if (res && typeof res.setHeader === 'function') {
      res.setHeader('X-RateLimit-Limit', String(options.limit));
      res.setHeader('X-RateLimit-Remaining', String(result.remaining));
      res.setHeader('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));
    }

    if (!result.allowed) {
      throw new RateLimitExceededException();
    }

    return true;
  }
}
