/**
 * API Transport Contracts — Common & Primitives
 * Naba Academy — أكاديمية نبأ للتعلم الإلكتروني
 *
 * Target API Version: /api/v1
 *
 * Standard transport envelopes, error definitions, and pagination primitives.
 * These contracts define data crossing the future HTTP wire boundary.
 */

/**
 * Standard validation error detail for form/payload attributes
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  code?: string;
}

/**
 * Canonical API Error object according to ADR-03 / ADR-04.
 * Public wire error never exposes raw stack traces or internal database exceptions.
 */
export interface ApiError {
  /** Machine-readable error code (e.g. 'VALIDATION_FAILED', 'UNAUTHORIZED', 'NOT_FOUND') */
  code: string;
  /** Human-readable localized or default error message */
  message: string;
  /** Structured validation errors or contextual error metadata */
  details?: Record<string, unknown> | ValidationErrorDetail[] | unknown;
  /** Unique correlation/tracing ID for log inspection */
  trace_id: string;
}

/**
 * Canonical API Success envelope
 */
export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

/**
 * Canonical API Error response envelope
 */
export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

/**
 * Unified API Response union
 */
export type ApiResponseContract<T> = ApiSuccess<T> | ApiErrorResponse;

/**
 * Canonical Pagination Query parameters for list endpoints
 */
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

/**
 * Canonical Pagination Metadata returned in list responses
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Standard Paginated Response container
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}
