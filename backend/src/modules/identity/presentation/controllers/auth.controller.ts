import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import {
  RegistrationService,
  RegisterUserResult,
} from '../../application/services/registration.service';
import {
  EmailVerificationService,
  VerifyEmailResult,
  ResendVerificationResult,
} from '../../application/services/email-verification.service';
import {
  AuthenticationService,
  SafeUserProfile,
} from '../../application/services/authentication.service';
import {
  SessionService,
  ActiveSessionItem,
} from '../../application/services/session.service';
import {
  PasswordResetService,
  ForgotPasswordResult,
  ResetPasswordResult,
} from '../../application/services/password-reset.service';
import { RegisterDto } from '../dto/register.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResendVerificationDto } from '../dto/resend-verification.dto';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import {
  setAuthCookies,
  clearAuthCookies,
  extractSessionToken,
  extractCsrfToken,
  getCsrfCookieOptions,
  AUTH_COOKIE_NAMES,
} from '../../infrastructure/security/cookie.config';
import {
  SessionRevokedException,
  InvalidCsrfTokenException,
} from '../../domain/identity.errors';
import { SessionAuthGuard } from '../guards/session-auth.guard';
import { CsrfGuard } from '../guards/csrf.guard';
import { OriginRefererGuard } from '../guards/origin-referer.guard';
import { RateLimiterGuard } from '../guards/rate-limiter.guard';
import { RateLimit } from '../guards/rate-limiter.decorator';
import { UserEntity } from '../../infrastructure/persistence/entities/user.entity';
import { UserSessionEntity } from '../../infrastructure/persistence/entities/user-session.entity';

export interface LoginResponseData {
  user: SafeUserProfile;
  csrfToken: string;
  message: string;
}

export interface LogoutResponseData {
  loggedOut: boolean;
  message: string;
}

export interface CurrentUserResponseData {
  user: SafeUserProfile;
}

export interface CsrfResponseData {
  csrfToken: string;
}

export interface SessionListResponseData {
  sessions: ActiveSessionItem[];
  currentSessionId: string;
}

export interface LogoutOtherSessionsResponseData {
  revokedCount: number;
  message: string;
}

export interface RevokeSessionResponseData {
  revoked: boolean;
  message: string;
}

@Controller('auth')
@UseGuards(OriginRefererGuard)
export class AuthController {
  constructor(
    private readonly registrationService: RegistrationService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly authenticationService: AuthenticationService,
    private readonly sessionService: SessionService,
    private readonly passwordResetService: PasswordResetService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @UseGuards(RateLimiterGuard)
  @RateLimit('register', 10, 3600)
  @HttpCode(HttpStatus.ACCEPTED)
  async register(@Body() dto: RegisterDto): Promise<RegisterUserResult> {
    return this.registrationService.register(dto);
  }

  @Post('verify-email')
  @UseGuards(RateLimiterGuard)
  @RateLimit('verify-email', 20, 900)
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<VerifyEmailResult> {
    return this.emailVerificationService.verifyEmail(dto.token);
  }

  @Post('resend-verification')
  @UseGuards(RateLimiterGuard)
  @RateLimit('resend-verification', 10, 900)
  @HttpCode(HttpStatus.OK)
  async resendVerification(
    @Body() dto: ResendVerificationDto,
  ): Promise<ResendVerificationResult> {
    return this.emailVerificationService.resendVerification(dto.email);
  }

  /**
   * STEP 07D-1: Forgot Password Endpoint (POST /api/v1/auth/forgot-password).
   *
   * Flow:
   * 1. Returns 202 Accepted with generic neutral anti-enumeration response.
   * 2. Issues 30-minute one-time cryptographically secure reset token for eligible accounts.
   * 3. Dispatches localized email with URL fragment token handoff.
   */
  @Post('forgot-password')
  @UseGuards(RateLimiterGuard)
  @RateLimit('forgot-password', 10, 900)
  @HttpCode(HttpStatus.ACCEPTED)
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<ForgotPasswordResult> {
    return this.passwordResetService.forgotPassword(dto);
  }

  /**
   * STEP 07D-4 to 07D-7: Reset Password Endpoint (POST /api/v1/auth/reset-password).
   *
   * Flow:
   * 1. Validates token (unused, unexpired, matching hash) or throws 400 PASSWORD_RESET_INVALID_OR_EXPIRED.
   * 2. Reuses strict password policy and updates Argon2id password hash.
   * 3. Resets login failure count and unlocks account.
   * 4. Consumes token and invalidates all outstanding tokens for the user.
   * 5. Revokes all active sessions for the user.
   * 6. Clears auth cookies if present; does NOT auto-login.
   */
  @Post('reset-password')
  @UseGuards(RateLimiterGuard)
  @RateLimit('reset-password', 10, 900)
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResetPasswordResult> {
    const isProduction =
      this.configService.get<string>('app.nodeEnv') === 'production';
    clearAuthCookies(res, isProduction);
    return this.passwordResetService.resetPassword(dto);
  }

  /**
   * STEP 07C-2: HTTP Login Endpoint with Secure Cookie Transport.
   *
   * Flow:
   * 1. Authenticates credentials against Argon2id hash & account status checks.
   * 2. Issues 256-bit random session and CSRF tokens (stored solely as SHA-256 hashes).
   * 3. Sets HttpOnly naba_session cookie and accessible naba_csrf cookie.
   * 4. Returns safe public profile and CSRF token in standard ApiSuccess envelope.
   * 5. Password hashes and internal session secrets are never returned.
   */
  @Post('login')
  @UseGuards(RateLimiterGuard)
  @RateLimit('login', 15, 900)
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseData> {
    if (res && typeof res.setHeader === 'function') {
      res.setHeader('Cache-Control', 'no-store');
    }

    const userAgent = (req.headers['user-agent'] as string) || null;
    const ipAddress = (req.ip || req.socket.remoteAddress || null) as string | null;
    const deviceLabel = (req.headers['x-device-label'] as string) || null;

    // 1. Authenticate user credentials
    const authenticated = await this.authenticationService.authenticate({
      email: dto.email,
      password: dto.password,
    });

    // 2. Create server-side session
    const sessionTokens = await this.sessionService.createSession({
      userId: authenticated.id,
      userAgent,
      ipAddress,
      deviceLabel,
    });

    // 3. Set HttpOnly session cookie and accessible CSRF cookie
    const isProduction = this.configService.get<string>('app.nodeEnv') === 'production';
    setAuthCookies(res, sessionTokens.rawSessionToken, sessionTokens.rawCsrfToken, isProduction);

    // 4. Retrieve complete safe user profile
    const userProfile = await this.authenticationService.getUserProfile(authenticated.id);

    return {
      user: userProfile,
      csrfToken: sessionTokens.rawCsrfToken,
      message: 'Login successful',
    };
  }

  /**
   * STEP 07C-3: HTTP Logout Endpoint with CSRF Enforcement.
   *
   * Flow:
   * 1. Checks if a session cookie is present.
   * 2. If NO session cookie exists, returns 200 OK idempotently.
   * 3. If a session cookie IS supplied, strictly requires valid session authentication
   *    and CSRF verification matching the session's stored CSRF hash before revoking that session.
   *    Cross-site requests lacking the secret CSRF token are blocked with 403 Forbidden.
   * 4. Revokes the authenticated session in PostgreSQL.
   * 5. Clears naba_session and naba_csrf cookies.
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponseData> {
    if (res && typeof res.setHeader === 'function') {
      res.setHeader('Cache-Control', 'no-store');
    }

    const sessionToken = extractSessionToken(req);
    const isProduction = this.configService.get<string>('app.nodeEnv') === 'production';

    // 1. Safe idempotent behavior when unauthenticated
    if (!sessionToken) {
      clearAuthCookies(res, isProduction);
      return {
        loggedOut: true,
        message: 'Logged out successfully',
      };
    }

    // 2. Authenticated logout requires valid session and CSRF verification
    const { session } = await this.sessionService.validateSession(sessionToken);

    const headerToken = (
      req.headers['x-csrf-token'] ||
      req.headers['x-xsrf-token'] ||
      (req.body && typeof req.body === 'object' && (req.body as Record<string, unknown>)._csrf)
    ) as string | undefined;

    if (!headerToken || typeof headerToken !== 'string' || headerToken.trim().length === 0) {
      throw new InvalidCsrfTokenException('Missing CSRF token header');
    }

    const trimmedToken = headerToken.trim();

    // Verify submitted token against the authenticated session's stored hash
    const isValidCsrf = this.sessionService.validateCsrfToken(session, trimmedToken);
    if (!isValidCsrf) {
      throw new InvalidCsrfTokenException('CSRF token does not match active session');
    }

    // Defense-in-depth: check double-submit cookie if sent
    const cookieToken = extractCsrfToken(req);
    if (cookieToken && cookieToken !== trimmedToken) {
      throw new InvalidCsrfTokenException('CSRF token mismatch between header and cookie');
    }

    // 3. Revoke the specific session and clear cookies
    await this.sessionService.revokeSession(session.id, 'User logged out');
    clearAuthCookies(res, isProduction);

    return {
      loggedOut: true,
      message: 'Logged out successfully',
    };
  }

  /**
   * STEP 07C-3: Current Authenticated User Endpoint (GET /api/v1/auth/me).
   * Protected by SessionAuthGuard.
   */
  @Get('me')
  @UseGuards(SessionAuthGuard)
  @HttpCode(HttpStatus.OK)
  async me(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CurrentUserResponseData> {
    if (res && typeof res.setHeader === 'function') {
      res.setHeader('Cache-Control', 'no-store');
    }

    const user = (req as unknown as { user: UserEntity }).user;
    const userProfile = await this.authenticationService.getUserProfile(user.id);

    return {
      user: userProfile,
    };
  }

  /**
   * STEP 07C-3: CSRF Token Retrieval Endpoint (GET /api/v1/auth/csrf).
   *
   * Flow:
   * 1. Requires an authenticated session via SessionAuthGuard.
   * 2. If existing naba_csrf cookie contains a valid token matching the session's stored CSRF hash, returns it.
   * 3. If cookie is missing or invalid:
   *    - Generates a new 256-bit cryptographically secure CSRF token.
   *    - Updates the authenticated session's CSRF hash in PostgreSQL.
   *    - Sets a new naba_csrf cookie.
   *    - Returns the new token.
   * 4. Cache-Control: no-store header applied.
   */
  @Get('csrf')
  @UseGuards(SessionAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getCsrf(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CsrfResponseData> {
    if (res && typeof res.setHeader === 'function') {
      res.setHeader('Cache-Control', 'no-store');
    }

    const session = (req as unknown as { session: UserSessionEntity }).session;
    const existingCookieToken = extractCsrfToken(req);

    if (
      existingCookieToken &&
      this.sessionService.validateCsrfToken(session, existingCookieToken)
    ) {
      return { csrfToken: existingCookieToken };
    }

    // Cookie missing or invalid -> rotate token in database and update cookie
    const isProduction = this.configService.get<string>('app.nodeEnv') === 'production';
    const newCsrf = await this.sessionService.rotateSessionCsrfToken(session.id);
    res.cookie(AUTH_COOKIE_NAMES.CSRF, newCsrf, getCsrfCookieOptions(isProduction));

    return { csrfToken: newCsrf };
  }

  /**
   * STEP 07C-3: Active Sessions List Endpoint (GET /api/v1/auth/sessions).
   * Returns all active non-revoked devices/sessions for the authenticated user.
   */
  @Get('sessions')
  @UseGuards(SessionAuthGuard)
  @HttpCode(HttpStatus.OK)
  async listSessions(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SessionListResponseData> {
    if (res && typeof res.setHeader === 'function') {
      res.setHeader('Cache-Control', 'no-store');
    }

    const user = (req as unknown as { user: UserEntity }).user;
    const session = (req as unknown as { session: UserSessionEntity }).session;

    return this.sessionService.listActiveSessions(user.id, session.id);
  }

  /**
   * STEP 07C-3: Logout Other Sessions (POST /api/v1/auth/sessions/logout-others).
   * Revokes all active sessions for the current user EXCEPT the current session.
   * Protected by SessionAuthGuard and CsrfGuard.
   */
  @Post('sessions/logout-others')
  @UseGuards(SessionAuthGuard, CsrfGuard)
  @HttpCode(HttpStatus.OK)
  async logoutOtherSessions(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutOtherSessionsResponseData> {
    if (res && typeof res.setHeader === 'function') {
      res.setHeader('Cache-Control', 'no-store');
    }

    const user = (req as unknown as { user: UserEntity }).user;
    const session = (req as unknown as { session: UserSessionEntity }).session;

    const revokedCount = await this.sessionService.revokeOtherSessions(user.id, session.id);

    return {
      revokedCount,
      message: 'Other sessions logged out successfully',
    };
  }

  /**
   * STEP 07C-3: Revoke Single Session by ID (DELETE /api/v1/auth/sessions/:id).
   * Revokes a specific session belonging to the authenticated user.
   * Strictly enforces session ownership.
   * Protected by SessionAuthGuard and CsrfGuard.
   */
  @Delete('sessions/:id')
  @UseGuards(SessionAuthGuard, CsrfGuard)
  @HttpCode(HttpStatus.OK)
  async revokeSession(
    @Param('id') targetSessionId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RevokeSessionResponseData> {
    if (res && typeof res.setHeader === 'function') {
      res.setHeader('Cache-Control', 'no-store');
    }

    const user = (req as unknown as { user: UserEntity }).user;
    const currentSession = (req as unknown as { session: UserSessionEntity }).session;
    const isProduction = this.configService.get<string>('app.nodeEnv') === 'production';

    const revoked = await this.sessionService.revokeUserSession(user.id, targetSessionId);

    // If revoking current session, clear auth cookies
    if (targetSessionId === currentSession.id) {
      clearAuthCookies(res, isProduction);
    }

    return {
      revoked,
      message: 'Session revoked successfully',
    };
  }
}

