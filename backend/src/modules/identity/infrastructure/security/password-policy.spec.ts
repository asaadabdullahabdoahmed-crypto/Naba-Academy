import {
  validatePasswordPolicy,
  assertPasswordPolicy,
} from './password-policy';
import { PasswordPolicyViolationException } from '../../domain/identity.errors';

describe('Password Policy Validation', () => {
  describe('validatePasswordPolicy', () => {
    it('rejects passwords shorter than 12 characters (11 characters)', () => {
      // 10 letters + 1 number = 11 characters
      const result = validatePasswordPolicy('Abcdefghij1');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 12 characters long');
    });

    it('rejects passwords longer than 128 characters (129 characters)', () => {
      // 128 letters + 1 number = 129 characters
      const longPassword = 'A'.repeat(128) + '1';
      const result = validatePasswordPolicy(longPassword);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must not exceed 128 characters');
    });

    it('rejects passwords with letters only', () => {
      const result = validatePasswordPolicy('Abcdefghijklmnop');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one Unicode numeric character',
      );
    });

    it('rejects passwords with numbers only', () => {
      const result = validatePasswordPolicy('123456789012345');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one Unicode letter',
      );
    });

    it('accepts valid 12+ character passwords with letters and numbers', () => {
      const result = validatePasswordPolicy('ValidPassword123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('accepts passwords with Arabic letters and numeric characters', () => {
      // Arabic letters with Arabic-Indic or ASCII digits
      const result1 = validatePasswordPolicy('كلمةالسرالآمنة2026');
      expect(result1.valid).toBe(true);
      expect(result1.errors).toHaveLength(0);

      const result2 = validatePasswordPolicy('جامعةنبأالذكية١٢٣٤');
      expect(result2.valid).toBe(true);
      expect(result2.errors).toHaveLength(0);
    });

    it('accepts spaces in valid passwords', () => {
      const result = validatePasswordPolicy('Naba Pass Phrase 2026');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('does NOT trim passwords automatically', () => {
      // '   Ab1   ' is 9 characters untrimmed -> rejected as < 12
      const resultShortWithSpaces = validatePasswordPolicy('   Ab1   ');
      expect(resultShortWithSpaces.valid).toBe(false);
      expect(resultShortWithSpaces.errors).toContain(
        'Password must be at least 12 characters long',
      );

      // '   Abcdef1   ' is 13 characters with spaces -> valid because spaces count and are not trimmed
      const resultValidWithSpaces = validatePasswordPolicy('   Abcdef1   ');
      expect(resultValidWithSpaces.valid).toBe(true);
    });

    it('accepts symbols as optional characters', () => {
      const result = validatePasswordPolicy('Secure#Pass!2026$');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('assertPasswordPolicy', () => {
    it('does not throw for a valid password', () => {
      expect(() => assertPasswordPolicy('ValidPassword2026')).not.toThrow();
    });

    it('throws PasswordPolicyViolationException for an invalid password', () => {
      try {
        assertPasswordPolicy('short1');
        fail('Expected exception was not thrown');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(PasswordPolicyViolationException);
        const ex = err as PasswordPolicyViolationException;
        expect(ex.code).toBe('PASSWORD_POLICY_VIOLATION');
        // Crucial security check: Error message must NEVER contain the password itself
        expect(ex.message).not.toContain('short1');
      }
    });
  });
});
