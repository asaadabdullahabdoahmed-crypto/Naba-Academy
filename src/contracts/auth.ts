/**
 * API Transport Contracts — Authentication
 * Naba Academy — أكاديمية نبأ للتعلم الإلكتروني
 *
 * Target API Version: /api/v1
 *
 * IMPORTANT ARCHITECTURAL NOTE:
 * - The session transport mechanism is intentionally UNDECIDED at this stage (e.g. HTTP-only
 *   secure session cookies vs server-managed session tokens).
 * - Do NOT assume JWT; do NOT introduce `accessToken` or `refreshToken` fields into these contracts.
 * - Explicit Non-Goals for V1 (ADR-14/15): No 2FA, No SSO, No National SSO (Nafath) in these wire contracts.
 */

import type { UserProfileContract, UserSummaryContract, UserSessionContract } from './identity';

/**
 * Login Request Contract
 * POST /api/v1/auth/login
 */
export interface LoginRequest {
  /** National ID or verified institutional email */
  identifier: string;
  password: string;
  /** Optional client fingerprint or device description */
  deviceInfo?: string;
}

/**
 * Login Response Contract
 * Note: Session authentication credentials (e.g. Set-Cookie or session header) are handled
 * by the HTTP transport layer and are not exposed as arbitrary token strings here.
 */
export interface LoginResponse {
  user: UserSummaryContract;
  message?: string;
}

/**
 * Registration Request Contract (Public Applicant Onboarding)
 * POST /api/v1/auth/register
 */
export interface RegisterRequest {
  nationalId: string;
  fullNameAr: string;
  fullNameEn: string;
  email: string;
  phone: string;
  password: string;
  programCode: string;
  highSchoolGpa?: number;
  qudratScore?: number;
  tahsiliScore?: number;
}

/**
 * Registration Response Contract
 */
export interface RegisterResponse {
  applicationId: string;
  applicantNameAr: string;
  applicantNameEn: string;
  email: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';
  message: string;
}

/**
 * Email Verification Request Contract
 * POST /api/v1/auth/verify-email
 */
export interface VerifyEmailRequest {
  email: string;
  code: string;
}

/**
 * Email Verification Response Contract
 */
export interface VerifyEmailResponse {
  verified: boolean;
  message: string;
}

/**
 * Forgot Password Request Contract
 * POST /api/v1/auth/forgot-password
 */
export interface ForgotPasswordRequest {
  email: string;
  nationalId?: string;
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
  newPassword: string;
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
  user: UserProfileContract;
}

/**
 * Active Sessions List Contract
 * GET /api/v1/auth/sessions
 */
export interface SessionListResponse {
  sessions: UserSessionContract[];
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

/**
 * Admissions Application Status Lookup Request Contract
 * POST /api/v1/auth/application-status
 */
export interface ApplicationStatusLookupRequest {
  nationalId: string;
  applicationNumber?: string;
}

/**
 * Admissions Application Status Lookup Response Contract
 */
export interface ApplicationStatusLookupResponse {
  applicationId: string;
  applicantNameAr: string;
  applicantNameEn: string;
  nationalId: string;
  programNameAr: string;
  programNameEn: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'DOCUMENT_REQUIRED';
  submissionDate: string;
  notes?: string;
}
