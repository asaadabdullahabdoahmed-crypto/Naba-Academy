import {
  buildScopedStorageKey,
  sanitizeStorageKey,
} from './storage-key.util';

describe('StorageKeyUtil', () => {
  it('should trim leading and trailing slashes and normalize duplicate slashes', () => {
    const raw = '///students//documents///photo.png///';
    expect(sanitizeStorageKey(raw)).toBe('students/documents/photo.png');
  });

  it('should reject directory traversal attempts with double dots', () => {
    expect(() => sanitizeStorageKey('../../etc/passwd')).toThrow(
      /Path traversal sequences are strictly forbidden/,
    );
    expect(() => sanitizeStorageKey('students/../secret')).toThrow(
      /Path traversal sequences are strictly forbidden/,
    );
  });

  it('should reject backslashes', () => {
    expect(() => sanitizeStorageKey('students\\documents')).toThrow(
      /Path traversal sequences are strictly forbidden/,
    );
  });

  it('should reject control characters or empty strings', () => {
    expect(() => sanitizeStorageKey('')).toThrow(/Storage key cannot be empty/);
    expect(() => sanitizeStorageKey('test\x00file')).toThrow(/illegal control characters/);
  });

  it('should build safe scoped keys with multiple segments', () => {
    const key = buildScopedStorageKey(
      'students',
      'student-123',
      'documents',
      'cert-456.pdf',
    );
    expect(key).toBe('students/student-123/documents/cert-456.pdf');
  });
});
