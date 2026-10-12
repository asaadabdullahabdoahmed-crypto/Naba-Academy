import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccess } from '../types/api-response';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiSuccess<T> | T>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccess<T> | T> {
    return next.handle().pipe(
      map((data: T) => {
        // Prevent double-wrapping if already in ApiSuccess or ApiError shape
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          typeof (data as Record<string, unknown>).success === 'boolean'
        ) {
          return data;
        }

        // Support responses that already provide data and meta fields (e.g. paginated lists)
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'meta' in data
        ) {
          const resObj = data as { data: unknown; meta?: Record<string, unknown> };
          return {
            success: true,
            data: resObj.data as T,
            meta: resObj.meta,
          };
        }

        return {
          success: true,
          data,
        };
      }),
    );
  }
}
