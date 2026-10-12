import { normalizeEmail } from './email-normalizer';

describe('Email Normalizer', () => {
  it('removes leading and trailing spaces while retaining display casing in email', () => {
    const raw = '  User.Name@Example.COM  ';
    const result = normalizeEmail(raw);

    expect(result.email).toBe('User.Name@Example.COM');
    expect(result.normalizedEmail).toBe('user.name@example.com');
  });

  it('produces lowercased string for normalizedEmail', () => {
    const raw = 'STUDENT.One@NABA.EDU.SA';
    const result = normalizeEmail(raw);

    expect(result.email).toBe('STUDENT.One@NABA.EDU.SA');
    expect(result.normalizedEmail).toBe('student.one@naba.edu.sa');
  });

  it('preserves plus aliases in both display and normalized email', () => {
    const raw = '  omar+admissions@naba.edu.sa  ';
    const result = normalizeEmail(raw);

    expect(result.email).toBe('omar+admissions@naba.edu.sa');
    expect(result.normalizedEmail).toBe('omar+admissions@naba.edu.sa');
  });

  it('preserves dots in email username without stripping (no Gmail dot-removal)', () => {
    const raw = 'john.doe.first@gmail.com';
    const result = normalizeEmail(raw);

    expect(result.email).toBe('john.doe.first@gmail.com');
    expect(result.normalizedEmail).toBe('john.doe.first@gmail.com');
  });

  it('does not perform any provider-specific domain or username rewriting', () => {
    const raw = '  User.Test+tag@googlemail.com  ';
    const result = normalizeEmail(raw);

    expect(result.email).toBe('User.Test+tag@googlemail.com');
    expect(result.normalizedEmail).toBe('user.test+tag@googlemail.com');
    // Specifically must not rewrite googlemail to gmail
    expect(result.normalizedEmail).toContain('@googlemail.com');
  });

  it('handles empty or whitespace-only inputs safely', () => {
    const result = normalizeEmail('   ');
    expect(result.email).toBe('');
    expect(result.normalizedEmail).toBe('');
  });
});
