import { Request, Response } from 'express';
import {
  AUTH_COOKIE_NAMES,
  AUTH_COOKIE_MAX_AGE_MS,
  getSessionCookieOptions,
  getCsrfCookieOptions,
  getSessionClearCookieOptions,
  getCsrfClearCookieOptions,
  setAuthCookies,
  clearAuthCookies,
  extractSessionToken,
  extractCsrfToken,
} from './cookie.config';

describe('Cookie Configuration & Transport Utilities', () => {
  describe('Cookie Options', () => {
    it('generates secure session cookie options in production', () => {
      const opts = getSessionCookieOptions(true);
      expect(opts).toEqual({
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: AUTH_COOKIE_MAX_AGE_MS,
      });
      expect(opts.maxAge).toBe(604800000); // 7 days in ms
    });

    it('generates session cookie options with secure=false in development', () => {
      const opts = getSessionCookieOptions(false);
      expect(opts.httpOnly).toBe(true);
      expect(opts.secure).toBe(false);
      expect(opts.sameSite).toBe('lax');
      expect(opts.path).toBe('/');
    });

    it('generates CSRF cookie options with httpOnly=false for client accessibility', () => {
      const optsProd = getCsrfCookieOptions(true);
      expect(optsProd).toEqual({
        httpOnly: false,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: AUTH_COOKIE_MAX_AGE_MS,
      });

      const optsDev = getCsrfCookieOptions(false);
      expect(optsDev.httpOnly).toBe(false);
      expect(optsDev.secure).toBe(false);
    });

    it('generates matching clearing cookie options', () => {
      const sessionClear = getSessionClearCookieOptions(true);
      expect(sessionClear).toEqual({
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
      });

      const csrfClear = getCsrfClearCookieOptions(true);
      expect(csrfClear).toEqual({
        httpOnly: false,
        secure: true,
        sameSite: 'none',
        path: '/',
      });
    });
  });

  describe('setAuthCookies', () => {
    it('sets both naba_session and naba_csrf cookies with correct options', () => {
      const res = {
        cookie: jest.fn(),
      } as unknown as Response;

      setAuthCookies(res, 'raw-session-token-123', 'raw-csrf-token-456', true);

      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(res.cookie).toHaveBeenCalledWith(
        AUTH_COOKIE_NAMES.SESSION,
        'raw-session-token-123',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          path: '/',
        }),
      );
      expect(res.cookie).toHaveBeenCalledWith(
        AUTH_COOKIE_NAMES.CSRF,
        'raw-csrf-token-456',
        expect.objectContaining({
          httpOnly: false,
          secure: true,
          sameSite: 'none',
          path: '/',
        }),
      );
    });
  });

  describe('clearAuthCookies', () => {
    it('clears both cookies with matching path and flags', () => {
      const res = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      clearAuthCookies(res, true);

      expect(res.clearCookie).toHaveBeenCalledTimes(2);
      expect(res.clearCookie).toHaveBeenCalledWith(
        AUTH_COOKIE_NAMES.SESSION,
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          path: '/',
        }),
      );
      expect(res.clearCookie).toHaveBeenCalledWith(
        AUTH_COOKIE_NAMES.CSRF,
        expect.objectContaining({
          httpOnly: false,
          secure: true,
          sameSite: 'none',
          path: '/',
        }),
      );
    });
  });

  describe('extractSessionToken and extractCsrfToken', () => {
    it('extracts session token from req.cookies', () => {
      const req = {
        cookies: {
          naba_session: 'my-session-token',
        },
      } as unknown as Request;

      expect(extractSessionToken(req)).toBe('my-session-token');
    });

    it('extracts csrf token from req.cookies', () => {
      const req = {
        cookies: {
          naba_csrf: 'my-csrf-token',
        },
      } as unknown as Request;

      expect(extractCsrfToken(req)).toBe('my-csrf-token');
    });

    it('extracts from headers.cookie fallback if req.cookies is missing', () => {
      const req = {
        headers: {
          cookie: 'other=123; naba_session=header-session; naba_csrf=header-csrf',
        },
      } as unknown as Request;

      expect(extractSessionToken(req)).toBe('header-session');
      expect(extractCsrfToken(req)).toBe('header-csrf');
    });

    it('returns null if token is not found', () => {
      const req = {
        cookies: {},
        headers: {},
      } as unknown as Request;

      expect(extractSessionToken(req)).toBeNull();
      expect(extractCsrfToken(req)).toBeNull();
    });
  });
});
