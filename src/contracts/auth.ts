/**
 * API Transport Contracts — Authentication
 * Naba Academy — أكاديمية نبأ للتعلم الإلكتروني
 *
 * Target API Version: /api/v1
 *
 * Source of truth: Backend Identity DTOs & src/services/authService.ts
 * Session transport uses HttpOnly secure session cookies (naba_session) and anti-CSRF cookies (naba_csrf).
 */

import type { SafeUserProfile, ActiveSessionItem } from '../services/authService';

/**
 * Login Request Contract
 * POST /api/v1/auth/login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login Response Contract
 * Note: Session authentication credentials (HttpOnly cookie) and CSRF tokens
 * are handled by the transport layer and returned in the login payload.
 */
export interface LoginResponse {
  user: SafeUserProfile;
  csrfToken: string;
  message: string;
}

/**
 * Self-Service Registration Request Contract
 * POST /api/v1/auth/register
 */
export interface RegisterRequest {
  email: string;
  password: string;
  nationalId: string;
  fullNameAr: string;
  fullNameEn: string;
  phone?: string;
}

/**
 * Registration Response Contract
 */
export interface RegisterResponse {
  status: 'verification_required';
  message: string;
}

/**
 * Email Verification Request Contract
 * POST /api/v1/auth/verify-email
 */
export interface VerifyEmailRequest {
  token: string;
}

/**
 * Email Verification Response Contract
 */
export interface VerifyEmailResponse {
  success: boolean;
  email: string;
  message: string;
}

/**
 * Resend Verification Email Request Contract
 * POST /api/v1/auth/resend-verification
 */
export interface ResendVerificationRequest {
  email: string;
}

/**
 * Resend Verification Email Response Contract
 */
export interface ResendVerificationResponse {
  success: boolean;
  message: string;
}

/**
 * Forgot Password Request Contract
 * POST /api/v1/auth/forgot-password
 */
export interface ForgotPasswordRequest {
  email: string;
  locale?: 'ar' | 'en';
}

/**
 * Forgot Password Response Contract
 */
export interface ForgotPasswordResponse {
  sent: boolean;
  message: string;
}

/**
 * Reset Password Request Contract
 * POST /api/v1/auth/reset-password
 */
export interface ResetPasswordRequest {
  token: string;
  password: string;
}

/**
 * Reset Password Response Contract
 */
export interface ResetPasswordResponse {
  reset: boolean;
  message: string;
}

/**
 * Logout Response Contract
 * POST /api/v1/auth/logout
 */
export interface LogoutResponse {
  loggedOut: boolean;
  message?: string;
}

/**
 * Current User Profile Contract
 * GET /api/v1/auth/me
 */
export interface CurrentUserResponse {
  user: SafeUserProfile;
}

/**
 * Active Sessions List Contract
 * GET /api/v1/auth/sessions
 */
export interface SessionListResponse {
  sessions: ActiveSessionItem[];
  currentSessionId: string;
}

/**
 * Logout Other Sessions Request Contract
 * POST /api/v1/auth/sessions/logout-others
 */
export interface LogoutOtherSessionsRequest {
  currentSessionId?: string;
}

/**
 * Logout Other Sessions Response Contract
 */
export interface LogoutOtherSessionsResponse {
  revokedCount: number;
  message: string;
}
