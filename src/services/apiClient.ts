/**
 * Centralized API Client for Naba Academy Frontend
 *
 * Connects to NestJS Backend API (/api/v1).
 * Features:
 * - Reads VITE_API_BASE_URL (uses the local Vite proxy in development)
 * - Automatic credentials: 'include' for HttpOnly session cookie transport (naba_session)
 * - Automatic CSRF double-submit token injection (X-CSRF-Token) from cookie or auth response
 * - Standard ApiSuccess unwrapping and structured ApiError throwing
 */

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '/api/v1' : 'https://naba-academy.onrender.com/api/v1')
).replace(/\/+$/, '');

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;
  traceId?: string;

  constructor(
    message: string,
    code = 'API_ERROR',
    status = 500,
    details?: unknown,
    traceId?: string,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.traceId = traceId;
  }
}

let inMemoryCsrfToken: string | null = null;

export function setCsrfToken(token: string | null): void {
  inMemoryCsrfToken = token;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[-.$*]/g, '\\$&')}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getCsrfToken(): string | null {
  return inMemoryCsrfToken || getCookie('naba_csrf');
}

export interface RequestOptions extends RequestInit {
  skipCsrf?: boolean;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const method = (options.method || 'GET').toUpperCase();
  const headers = new Headers(options.headers || {});

  // Default to application/json if sending a JSON body
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Double-submit CSRF token for state-changing HTTP requests
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  if (isStateChanging && !options.skipCsrf) {
    const csrfToken = getCsrfToken();
    if (csrfToken && !headers.has('X-CSRF-Token')) {
      headers.set('X-CSRF-Token', csrfToken);
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      method,
      headers,
      credentials: 'include', // Ensure HttpOnly session cookies are transmitted cross-origin
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    throw new ApiError(
      'Unable to reach the API. Check the API URL and network connection.',
      'NETWORK_ERROR',
      0,
      undefined,
      undefined,
      error,
    );
  }

  // Keep CSRF token in sync if sent in response headers
  const headerCsrf = response.headers.get('x-csrf-token');
  if (headerCsrf) {
    setCsrfToken(headerCsrf);
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.toLowerCase().includes('json');

  let data: unknown = null;
  if (isJson) {
    try {
      data = await response.json();
    } catch {
      if (response.ok) {
        throw new ApiError(
          'The API returned an invalid JSON response.',
          'INVALID_JSON_RESPONSE',
          response.status,
          undefined,
          response.headers.get('x-trace-id') || undefined,
        );
      }
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const payload = data && typeof data === 'object' ? data as Record<string, unknown> : null;
    const errorObj =
      payload?.error && typeof payload.error === 'object'
        ? payload.error as Record<string, unknown>
        : null;
    const message =
      (typeof errorObj?.message === 'string' && errorObj.message) ||
      (typeof payload?.message === 'string' && payload.message) ||
      (typeof data === 'string' && data.length > 0 ? data : null) ||
      `Request failed with status ${response.status}`;
    const code = typeof errorObj?.code === 'string' ? errorObj.code : `HTTP_${response.status}`;
    const details = errorObj?.details;
    const traceId =
      (typeof payload?.traceId === 'string' && payload.traceId) ||
      (typeof errorObj?.trace_id === 'string' && errorObj.trace_id) ||
      response.headers.get('x-trace-id') ||
      undefined;

    throw new ApiError(message, code, response.status, details, traceId);
  }

  // If response has NestJS ApiSuccess envelope `{ success: true, data: ... }`, unwrap data
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    // If the data payload contains a csrfToken, capture it
    const responseData = data.data;
    if (
      responseData &&
      typeof responseData === 'object' &&
      'csrfToken' in responseData &&
      typeof responseData.csrfToken === 'string'
    ) {
      setCsrfToken(responseData.csrfToken);
    }
    const responseMeta =
      'meta' in data && data.meta && typeof data.meta === 'object'
        ? data.meta as Record<string, unknown>
        : null;
    if (
      Array.isArray(responseData) &&
      responseMeta &&
      typeof responseMeta.page === 'number' &&
      typeof responseMeta.pageSize === 'number' &&
      typeof responseMeta.totalItems === 'number'
    ) {
      return { data: responseData, meta: responseMeta } as T;
    }
    return responseData as T;
  }

  return data as T;
}

export const apiClient = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
  post: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
