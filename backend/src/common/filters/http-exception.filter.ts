import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { ApiErrorResponse, ValidationErrorDetail } from '../types/api-response';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Retrieve authoritative trace ID from request or generate if filter executes before middleware
    const traceId = request?.traceId || randomUUID();

    // Ensure X-Trace-Id response header is set
    if (response && !response.getHeader('X-Trace-Id')) {
      response.setHeader('X-Trace-Id', traceId);
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected internal error occurred';
    let details: ValidationErrorDetail[] | Record<string, unknown> | null = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        code = this.mapStatusToErrorCode(status);
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resObj = exceptionResponse as Record<string, unknown>;
        message = (resObj.message as string) || exception.message;
        code = (resObj.code as string) || this.mapStatusToErrorCode(status);

        if (Array.isArray(resObj.details)) {
          details = resObj.details as ValidationErrorDetail[];
        } else if (resObj.details && typeof resObj.details === 'object') {
          details = resObj.details as Record<string, unknown>;
        } else if (Array.isArray(resObj.message)) {
          // Class-validator default string messages fallback
          details = resObj.message.map((msg: string) => ({
            field: 'payload',
            message: msg,
            code: 'VALIDATION_ERROR',
          }));
          code = 'VALIDATION_ERROR';
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(`[${traceId}] Unhandled server exception: ${exception.message}`, exception.stack);
      // Strictly sanitize public output: never expose stack traces, SQL errors, or system paths
      message = 'An unexpected internal error occurred';
      code = 'INTERNAL_ERROR';
    } else {
      this.logger.error(`[${traceId}] Unknown exception thrown: ${String(exception)}`);
    }

    const errorPayload: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message,
        details,
        trace_id: traceId,
      },
    };

    response.status(status).json(errorPayload);
  }

  private mapStatusToErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RATE_LIMIT_EXCEEDED';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'SERVICE_UNAVAILABLE';
      default:
        return 'INTERNAL_ERROR';
    }
  }
}
