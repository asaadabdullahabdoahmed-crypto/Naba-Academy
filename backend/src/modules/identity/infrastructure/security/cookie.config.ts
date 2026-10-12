import { CookieOptions, Request, Response } from 'express';

export const AUTH_COOKIE_NAMES = {
  SESSION: 'naba_session',
  CSRF: 'naba_csrf',
} as const;

// 7 days in milliseconds: 7 * 24 * 60 * 60 * 1000 = 604,800,000 ms (604,800 seconds)
export const AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Returns centralized cookie options for the HttpOnly session cookie.
 */
export function getSessionCookieOptions(isProduction: boolean): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
  };
}

/**
 * Returns centralized cookie options for the CSRF cookie.
 * Note: httpOnly is intentionally false so the client application can read the CSRF token
 * and include it in state-changing request headers (e.g. X-CSRF-Token).
 */
export function getCsrfCookieOptions(isProduction: boolean): CookieOptions {
  return {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
  };
}

/**
 * Returns clearing options for the session cookie with matching path, sameSite, and security.
 */
export function getSessionClearCookieOptions(isProduction: boolean): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  };
}

/**
 * Returns clearing options for the CSRF cookie with matching path, sameSite, and security.
 */
export function getCsrfClearCookieOptions(isProduction: boolean): CookieOptions {
  return {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  };
}

/**
 * Centralized utility to set both authentication cookies on an Express response.
 */
export function setAuthCookies(
  res: Response,
  sessionToken: string,
  csrfToken: string,
  isProduction: boolean,
): void {
  res.cookie(AUTH_COOKIE_NAMES.SESSION, sessionToken, getSessionCookieOptions(isProduction));
  res.cookie(AUTH_COOKIE_NAMES.CSRF, csrfToken, getCsrfCookieOptions(isProduction));
}

/**
 * Centralized utility to clear both authentication cookies on an Express response.
 */
export function clearAuthCookies(res: Response, isProduction: boolean): void {
  res.clearCookie(AUTH_COOKIE_NAMES.SESSION, getSessionClearCookieOptions(isProduction));
  res.clearCookie(AUTH_COOKIE_NAMES.CSRF, getCsrfClearCookieOptions(isProduction));
}

/**
 * Safely extracts the session token from parsed cookies or raw Cookie header if available.
 */
export function extractSessionToken(req: Request): string | null {
  if (req.cookies && typeof req.cookies[AUTH_COOKIE_NAMES.SESSION] === 'string') {
    const val = req.cookies[AUTH_COOKIE_NAMES.SESSION].trim();
    return val.length > 0 ? val : null;
  }

  // Fallback manual parse if cookie-parser middleware was not invoked
  if (req.headers && typeof req.headers.cookie === 'string') {
    const cookies = parseCookieHeader(req.headers.cookie);
    const val = cookies[AUTH_COOKIE_NAMES.SESSION];
    return val && val.trim().length > 0 ? val.trim() : null;
  }

  return null;
}

/**
 * Safely extracts the CSRF token from parsed cookies or raw Cookie header if available.
 */
export function extractCsrfToken(req: Request): string | null {
  if (req.cookies && typeof req.cookies[AUTH_COOKIE_NAMES.CSRF] === 'string') {
    const val = req.cookies[AUTH_COOKIE_NAMES.CSRF].trim();
    return val.length > 0 ? val : null;
  }

  if (req.headers && typeof req.headers.cookie === 'string') {
    const cookies = parseCookieHeader(req.headers.cookie);
    const val = cookies[AUTH_COOKIE_NAMES.CSRF];
    return val && val.trim().length > 0 ? val.trim() : null;
  }

  return null;
}

/**
 * Lightweight cookie header parser for robust fallback.
 */
function parseCookieHeader(header: string): Record<string, string> {
  const result: Record<string, string> = {};
  const pairs = header.split(';');
  for (const pair of pairs) {
    const index = pair.indexOf('=');
    if (index > 0) {
      const key = pair.substring(0, index).trim();
      const val = pair.substring(index + 1).trim();
      try {
        result[key] = decodeURIComponent(val);
      } catch {
        result[key] = val;
      }
    }
  }
  return result;
}
