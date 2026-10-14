/**
 * Authentication Service for Naba Academy Frontend
 *
 * Implements wire-level contracts against NestJS Auth Controller:
 * - POST /auth/register
 * - POST /auth/login
 * - POST /auth/logout
 * - GET  /auth/me
 * - GET  /auth/csrf
 * - POST /auth/verify-email
 * - POST /auth/resend-verification
 * - POST /auth/forgot-password
 * - POST /auth/reset-password
 * - GET  /auth/sessions
 * - POST /auth/sessions/logout-others
 * - DELETE /auth/sessions/:id
 */

import { apiClient, setCsrfToken } from './apiClient';

export interface SafeUserRole {
  code: string;
  nameAr?: string;
  nameEn?: string;
  scopeType?: string;
  scopeId?: string | null;
}

export interface SafeUserProfile {
  id: string;
  email: string;
  nameAr?: string;
  nameEn?: string;
  nationalId?: string;
  accountStatus: string;
  primaryRole: string;
  roles: SafeUserRole[];
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  user: SafeUserProfile;
  csrfToken: string;
  message: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  nationalId: string;
  fullNameAr: string;
  fullNameEn: string;
  phone?: string;
}

export interface RegisterResult {
  status: 'verification_required';
  message: string;
}

export interface VerifyEmailResult {
  success: boolean;
  email: string;
  message: string;
}

export interface ResendVerificationResult {
  success: boolean;
  message: string;
}

export interface ForgotPasswordInput {
  email: string;
  locale?: 'ar' | 'en';
}

export interface ForgotPasswordResult {
  sent: boolean;
  message: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface ResetPasswordResult {
  reset: boolean;
  message: string;
}

export interface ActiveSessionItem {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  deviceLabel: string | null;
  createdAt: string;
  lastActivityAt: string;
  isCurrent: boolean;
}

export interface SessionListResult {
  sessions: ActiveSessionItem[];
  currentSessionId: string;
}

export const authService = {
  /**
   * Authenticate with email & password, establishing an HttpOnly session cookie
   */
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const result = await apiClient.post<LoginResult>('/auth/login', credentials);
    if (result.csrfToken) {
      setCsrfToken(result.csrfToken);
    }
    return result;
  },

  /**
   * Self-service registration creating an unverified student account
   */
  async register(data: RegisterInput): Promise<RegisterResult> {
    return apiClient.post<RegisterResult>('/auth/register', {
      email: data.email.trim(),
      password: data.password,
      nationalId: data.nationalId.trim(),
      fullNameAr: data.fullNameAr.trim(),
      fullNameEn: data.fullNameEn.trim(),
      phone: data.phone?.trim() || undefined,
    });
  },

  /**
   * Fetch current authenticated user profile using HttpOnly cookie session
   */
  async getMe(): Promise<SafeUserProfile> {
    const response = await apiClient.get<{ user: SafeUserProfile }>('/auth/me');
    return response.user;
  },

  /**
   * Retrieve active CSRF token for current session
   */
  async getCsrf(): Promise<string> {
    const response = await apiClient.get<{ csrfToken: string }>('/auth/csrf');
    if (response.csrfToken) {
      setCsrfToken(response.csrfToken);
    }
    return response.csrfToken;
  },

  /**
   * Revoke current session and clear cookies
   */
  async logout(): Promise<{ loggedOut: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ loggedOut: boolean; message: string }>('/auth/logout');
      setCsrfToken(null);
      return response;
    } catch (err) {
      setCsrfToken(null);
      throw err;
    }
  },

  /**
   * Verify email using secure token
   */
  async verifyEmail(token: string): Promise<VerifyEmailResult> {
    return apiClient.post<VerifyEmailResult>('/auth/verify-email', {
      token: token.trim(),
    });
  },

  /**
   * Request resend of email verification token
   */
  async resendVerification(email: string): Promise<ResendVerificationResult> {
    return apiClient.post<ResendVerificationResult>('/auth/resend-verification', {
      email: email.trim(),
    });
  },

  /**
   * Request password reset link
   */
  async forgotPassword(data: ForgotPasswordInput): Promise<ForgotPasswordResult> {
    return apiClient.post<ForgotPasswordResult>('/auth/forgot-password', {
      email: data.email.trim(),
      locale: data.locale,
    });
  },

  /**
   * Reset password with valid token
   */
  async resetPassword(data: ResetPasswordInput): Promise<ResetPasswordResult> {
    return apiClient.post<ResetPasswordResult>('/auth/reset-password', {
      token: data.token.trim(),
      password: data.password,
    });
  },

  /**
   * List active sessions for the authenticated user
   */
  async listSessions(): Promise<SessionListResult> {
    return apiClient.get<SessionListResult>('/auth/sessions');
  },

  /**
   * Revoke all other active sessions except current
   */
  async logoutOtherSessions(): Promise<{ revokedCount: number; message: string }> {
    return apiClient.post<{ revokedCount: number; message: string }>('/auth/sessions/logout-others');
  },

  /**
   * Revoke a specific session by ID
   */
  async revokeSession(sessionId: string): Promise<{ revoked: boolean; message: string }> {
    return apiClient.delete<{ revoked: boolean; message: string }>(`/auth/sessions/${encodeURIComponent(sessionId)}`);
  },
};
