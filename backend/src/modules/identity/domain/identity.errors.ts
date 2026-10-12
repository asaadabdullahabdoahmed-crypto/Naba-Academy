import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

export const IDENTITY_ERROR_CODES = {
  PASSWORD_POLICY_VIOLATION: 'PASSWORD_POLICY_VIOLATION',
  EMAIL_ALREADY_REGISTERED: 'EMAIL_ALREADY_REGISTERED',
  INVALID_VERIFICATION_TOKEN: 'INVALID_VERIFICATION_TOKEN',
  VERIFICATION_TOKEN_EXPIRED: 'VERIFICATION_TOKEN_EXPIRED',
  VERIFICATION_TOKEN_ALREADY_USED: 'VERIFICATION_TOKEN_ALREADY_USED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_REVOKED: 'SESSION_REVOKED',
  INVALID_CSRF_TOKEN: 'INVALID_CSRF_TOKEN',
  PASSWORD_RESET_INVALID_OR_EXPIRED: 'PASSWORD_RESET_INVALID_OR_EXPIRED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  ORIGIN_FORBIDDEN: 'ORIGIN_FORBIDDEN',
} as const;

export type IdentityErrorCode =
  (typeof IDENTITY_ERROR_CODES)[keyof typeof IDENTITY_ERROR_CODES];

export class PasswordPolicyViolationException extends BadRequestException {
  readonly code = IDENTITY_ERROR_CODES.PASSWORD_POLICY_VIOLATION;

  constructor(
    message = 'Password does not satisfy security policy requirements',
  ) {
    super({
      code: IDENTITY_ERROR_CODES.PASSWORD_POLICY_VIOLATION,
      message,
    });
  }
}

export class EmailAlreadyRegisteredException extends ConflictException {
  readonly code = IDENTITY_ERROR_CODES.EMAIL_ALREADY_REGISTERED;

  constructor(message = 'An account with this email address already exists') {
    super({
      code: IDENTITY_ERROR_CODES.EMAIL_ALREADY_REGISTERED,
      message,
    });
  }
}

export class InvalidVerificationTokenException extends BadRequestException {
  readonly code = IDENTITY_ERROR_CODES.INVALID_VERIFICATION_TOKEN;

  constructor(message = 'The verification token is invalid or does not exist') {
    super({
      code: IDENTITY_ERROR_CODES.INVALID_VERIFICATION_TOKEN,
      message,
    });
  }
}

export class VerificationTokenExpiredException extends BadRequestException {
  readonly code = IDENTITY_ERROR_CODES.VERIFICATION_TOKEN_EXPIRED;

  constructor(message = 'The verification token has expired') {
    super({
      code: IDENTITY_ERROR_CODES.VERIFICATION_TOKEN_EXPIRED,
      message,
    });
  }
}

export class VerificationTokenAlreadyUsedException extends BadRequestException {
  readonly code = IDENTITY_ERROR_CODES.VERIFICATION_TOKEN_ALREADY_USED;

  constructor(message = 'The verification token has already been used') {
    super({
      code: IDENTITY_ERROR_CODES.VERIFICATION_TOKEN_ALREADY_USED,
      message,
    });
  }
}

export class UserNotFoundException extends NotFoundException {
  readonly code = IDENTITY_ERROR_CODES.USER_NOT_FOUND;

  constructor(message = 'User account not found') {
    super({
      code: IDENTITY_ERROR_CODES.USER_NOT_FOUND,
      message,
    });
  }
}

export class AccountDisabledException extends ForbiddenException {
  readonly code = IDENTITY_ERROR_CODES.ACCOUNT_DISABLED;

  constructor(message = 'User account is disabled') {
    super({
      code: IDENTITY_ERROR_CODES.ACCOUNT_DISABLED,
      message,
    });
  }
}

export class AccountLockedException extends ForbiddenException {
  readonly code = IDENTITY_ERROR_CODES.ACCOUNT_LOCKED;

  constructor(
    message = 'Account is temporarily locked due to consecutive failed login attempts. Please try again later.',
  ) {
    super({
      code: IDENTITY_ERROR_CODES.ACCOUNT_LOCKED,
      message,
    });
  }
}

export class InvalidCredentialsException extends BadRequestException {
  readonly code = IDENTITY_ERROR_CODES.INVALID_CREDENTIALS;

  constructor(message = 'Invalid email or password') {
    super({
      code: IDENTITY_ERROR_CODES.INVALID_CREDENTIALS,
      message,
    });
  }
}

export class SessionRevokedException extends ForbiddenException {
  readonly code = IDENTITY_ERROR_CODES.SESSION_REVOKED;

  constructor(message = 'Session has been revoked or expired') {
    super({
      code: IDENTITY_ERROR_CODES.SESSION_REVOKED,
      message,
    });
  }
}

export class InvalidCsrfTokenException extends ForbiddenException {
  readonly code = IDENTITY_ERROR_CODES.INVALID_CSRF_TOKEN;

  constructor(message = 'Invalid or missing CSRF token') {
    super({
      code: IDENTITY_ERROR_CODES.INVALID_CSRF_TOKEN,
      message,
    });
  }
}

export class PasswordResetInvalidOrExpiredException extends BadRequestException {
  readonly code = IDENTITY_ERROR_CODES.PASSWORD_RESET_INVALID_OR_EXPIRED;

  constructor(
    message = 'The password reset token is invalid, expired, or has already been used.',
  ) {
    super({
      code: IDENTITY_ERROR_CODES.PASSWORD_RESET_INVALID_OR_EXPIRED,
      message,
    });
  }
}

export class RateLimitExceededException extends HttpException {
  readonly code = IDENTITY_ERROR_CODES.TOO_MANY_REQUESTS;

  constructor(
    message = 'Too many requests. Please slow down and try again later.',
  ) {
    super(
      {
        code: IDENTITY_ERROR_CODES.TOO_MANY_REQUESTS,
        message,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

export class InvalidOriginException extends ForbiddenException {
  readonly code = IDENTITY_ERROR_CODES.ORIGIN_FORBIDDEN;

  constructor(message = 'Request origin or referer is not in the trusted allowlist') {
    super({
      code: IDENTITY_ERROR_CODES.ORIGIN_FORBIDDEN,
      message,
    });
  }
}


