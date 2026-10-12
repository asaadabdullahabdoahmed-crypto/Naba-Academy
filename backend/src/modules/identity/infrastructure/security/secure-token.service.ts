import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

export interface GeneratedToken {
  rawToken: string;
  tokenHash: string;
}

@Injectable()
export class SecureTokenService {
  /**
   * Generates a high-entropy cryptographically secure random token (32 bytes = 256 bits),
   * encoded in base64url for transport, and returns both the raw token and its
   * lowercase 64-character SHA-256 hash for database storage.
   *
   * Raw tokens must never be persisted or logged.
   */
  generateToken(): GeneratedToken {
    const rawBytes = crypto.randomBytes(32);
    const rawToken = rawBytes.toString('base64url');
    const tokenHash = this.hashToken(rawToken);

    return {
      rawToken,
      tokenHash,
    };
  }

  /**
   * Computes the canonical lowercase SHA-256 hex hash of a raw token.
   * Deterministic: The exact same raw token input always yields the identical hash.
   */
  hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken, 'utf8').digest('hex');
  }
}
