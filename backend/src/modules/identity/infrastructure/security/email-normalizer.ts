export interface NormalizedEmailResult {
  email: string;
  normalizedEmail: string;
}

/**
 * Normalizes email according to Naba Academy V1 identity standards:
 * - display email: trim leading and trailing whitespace only
 * - normalized email: trim leading and trailing whitespace + lowercase
 *
 * Explicit Non-goals:
 * - Does NOT remove Gmail dots
 * - Does NOT strip plus aliases
 * - Does NOT alter provider-specific addressing
 */
export function normalizeEmail(rawEmail: string): NormalizedEmailResult {
  const trimmed = (rawEmail ?? '').trim();
  return {
    email: trimmed,
    normalizedEmail: trimmed.toLowerCase(),
  };
}
