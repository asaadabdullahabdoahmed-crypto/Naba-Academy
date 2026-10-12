import { PasswordPolicyViolationException } from '../../domain/identity.errors';

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a password against Naba Academy V1 password policy:
 * - Minimum: 12 characters
 * - Maximum: 128 characters
 * - At least one Unicode letter (\p{L})
 * - At least one Unicode numeric character (\p{N})
 * - Symbols optional
 * - Spaces allowed
 * - Case-sensitive
 * - Neither trimmed nor Unicode normalized
 */
export function validatePasswordPolicy(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // Passwords MUST NOT be trimmed; validate exact input length
  const length = [...password].length;

  if (length < 12) {
    errors.push('Password must be at least 12 characters long');
  }

  if (length > 128) {
    errors.push('Password must not exceed 128 characters');
  }

  if (!/\p{L}/u.test(password)) {
    errors.push('Password must contain at least one Unicode letter');
  }

  if (!/\p{N}/u.test(password)) {
    errors.push('Password must contain at least one Unicode numeric character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Asserts password policy, throwing PasswordPolicyViolationException if invalid.
 * Never leaks the actual password string in errors or logs.
 */
export function assertPasswordPolicy(password: string): void {
  const result = validatePasswordPolicy(password);
  if (!result.valid) {
    throw new PasswordPolicyViolationException(
      result.errors[0] || 'Password does not satisfy security policy requirements',
    );
  }
}
