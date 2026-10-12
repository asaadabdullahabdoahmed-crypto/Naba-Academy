import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    // Generate authoritative server trace ID (ignoring unverified client-provided trace headers)
    const traceId = randomUUID();
    req.traceId = traceId;
    req.startTime = Date.now();

    // Attach trace ID to outgoing response header
    res.setHeader('X-Trace-Id', traceId);

    // Structured, safe request logging on completion
    res.on('finish', () => {
      const durationMs = Date.now() - (req.startTime ?? Date.now());
      const { method, originalUrl } = req;
      const { statusCode } = res;

      // Safe logging: only traceId, method, path, status, and duration
      // Sensitive fields (passwords, tokens, authorization headers, cookies, request bodies) are NEVER logged
      this.logger.log(
        `[${traceId}] ${method} ${originalUrl} -> ${statusCode} (${durationMs}ms)`,
      );
    });

    next();
  }
}
