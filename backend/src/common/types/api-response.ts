/**
 * Canonical Backend Transport Envelope Types
 * Naba Academy — أكاديمية نبأ للتعلم الإلكتروني
 *
 * Aligned with docs/API_CONTRACTS.md and src/contracts/common.ts
 */

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ValidationErrorDetail[] | Record<string, unknown> | null;
  trace_id: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

export type ApiResponseContract<T> = ApiSuccess<T> | ApiErrorResponse;
