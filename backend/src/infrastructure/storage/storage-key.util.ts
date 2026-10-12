/**
 * Validates and normalizes object storage keys to prevent path traversal,
 * null byte injection, and illegal characters.
 *
 * Security Invariants:
 * 1. User-submitted raw filenames MUST NOT be used directly as authoritative storage keys.
 * 2. Directory traversal sequences (..) are strictly rejected.
 * 3. Leading and trailing slashes are trimmed to ensure deterministic key formatting.
 */
export function sanitizeStorageKey(rawKey: string): string {
  if (!rawKey || typeof rawKey !== 'string') {
    throw new Error('[StorageSecurityError] Storage key cannot be empty');
  }

  // Reject null bytes or control characters
  if (/[\x00-\x1f\x7f]/.test(rawKey)) {
    throw new Error('[StorageSecurityError] Storage key contains illegal control characters');
  }

  // Reject directory traversal attempts
  if (rawKey.includes('..') || rawKey.includes('\\')) {
    throw new Error('[StorageSecurityError] Path traversal sequences are strictly forbidden');
  }

  // Normalize: remove leading/trailing slashes and collapse duplicate slashes
  const normalized = rawKey
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .replace(/\/+/g, '/');

  if (!normalized) {
    throw new Error('[StorageSecurityError] Storage key evaluated to empty string after normalization');
  }

  return normalized;
}

/**
 * Builds a deterministic storage key using an entity partition, entity ID, subfolder, and UUID.
 * Example: buildScopedStorageKey('students', studentId, 'documents', uuid)
 * -> students/123e4567-e89b-12d3-a456-426614174000/documents/550e8400-e29b-41d4-a716-446655440000
 */
export function buildScopedStorageKey(...segments: string[]): string {
  const cleanSegments = segments.map((seg) => sanitizeStorageKey(seg));
  return cleanSegments.join('/');
}
