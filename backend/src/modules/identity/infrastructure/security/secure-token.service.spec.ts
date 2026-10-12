import * as crypto from 'crypto';
import { SecureTokenService } from './secure-token.service';

describe('SecureTokenService', () => {
  let service: SecureTokenService;

  beforeEach(() => {
    service = new SecureTokenService();
  });

  it('generates raw token that is base64url-safe without standard base64 padding (+, /, =)', () => {
    for (let i = 0; i < 20; i++) {
      const { rawToken } = service.generateToken();
      expect(rawToken).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(rawToken).not.toContain('+');
      expect(rawToken).not.toContain('/');
      expect(rawToken).not.toContain('=');
    }
  });

  it('raw token corresponds to exactly 32 bytes of cryptographically random entropy', () => {
    const { rawToken } = service.generateToken();
    const entropyBuffer = Buffer.from(rawToken, 'base64url');
    expect(entropyBuffer.length).toBe(32);
  });

  it('tokenHash length is exactly 64 characters and is lowercase hexadecimal', () => {
    const { tokenHash } = service.generateToken();
    expect(tokenHash).toHaveLength(64);
    expect(tokenHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('the same raw token always hashes identically (deterministic SHA-256)', () => {
    const { rawToken, tokenHash } = service.generateToken();
    const computedHash1 = service.hashToken(rawToken);
    const computedHash2 = service.hashToken(rawToken);

    expect(computedHash1).toBe(tokenHash);
    expect(computedHash2).toBe(tokenHash);
  });

  it('hash algorithm matches standard SHA-256 digest', () => {
    const sampleToken = 'test-token-value-sample-1234567890';
    const expectedSha256 = crypto
      .createHash('sha256')
      .update(sampleToken, 'utf8')
      .digest('hex');

    expect(service.hashToken(sampleToken)).toBe(expectedSha256);
  });

  it('different generated tokens differ in both raw token and tokenHash', () => {
    const tokenA = service.generateToken();
    const tokenB = service.generateToken();

    expect(tokenA.rawToken).not.toBe(tokenB.rawToken);
    expect(tokenA.tokenHash).not.toBe(tokenB.tokenHash);
  });
});
