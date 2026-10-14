/**
 * Centralized API Client for Naba Academy Frontend
 *
 * Connects to NestJS Backend API (/api/v1).
 * Features:
 * - Reads VITE_API_BASE_URL (defaults to production backend https://naba-academy.onrender.com/api/v1)
 * - Automatic credentials: 'include' for HttpOnly session cookie transport (naba_session)
 * - Automatic CSRF double-submit token injection (X-CSRF-Token) from cookie or auth response
 * - Standard ApiSuccess unwrapping and structured ApiError throwing
 */

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'https://naba-academy.onrender.com/api/v1'
).replace(/\/+$/, '');

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;
  traceId?: string;

  constructor(message: string, code = 'API_ERROR', status = 500, details?: unknown, traceId?: string) {
    super(message);
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

  const response = await fetch(url, {
    ...options,
    method,
    headers,
    credentials: 'include', // Ensure HttpOnly session cookies are transmitted cross-origin
  });

  // Keep CSRF token in sync if sent in response headers
  const headerCsrf = response.headers.get('x-csrf-token');
  if (headerCsrf) {
    setCsrfToken(headerCsrf);
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  let data: any = null;
  if (isJson) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorObj = data && typeof data === 'object' && data.error ? data.error : null;
    const message =
      (errorObj && errorObj.message) ||
      (typeof data === 'string' && data.length > 0 ? data : null) ||
      `Request failed with status ${response.status}`;
    const code = (errorObj && errorObj.code) || `HTTP_${response.status}`;
    const details = errorObj ? errorObj.details : undefined;
    const traceId = data?.traceId || response.headers.get('x-trace-id') || undefined;

    throw new ApiError(message, code, response.status, details, traceId);
  }

  // If response has NestJS ApiSuccess envelope `{ success: true, data: ... }`, unwrap data
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    // If the data payload contains a csrfToken, capture it
    if (data.data && typeof data.data === 'object' && 'csrfToken' in data.data && typeof data.data.csrfToken === 'string') {
      setCsrfToken(data.data.csrfToken);
    }
    return data.data as T;
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
