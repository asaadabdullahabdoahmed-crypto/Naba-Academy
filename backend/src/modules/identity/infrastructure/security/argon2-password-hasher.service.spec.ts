import { Argon2PasswordHasherService } from './argon2-password-hasher.service';

describe('Argon2PasswordHasherService', () => {
  let service: Argon2PasswordHasherService;

  beforeEach(() => {
    service = new Argon2PasswordHasherService();
  });

  it('hash("ValidPassword123") returns an encoded Argon2 hash', async () => {
    const hash = await service.hash('ValidPassword123');
    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.startsWith('$argon2id$')).toBe(true);
  });

  it('hash identifies Argon2id variant and correct configuration parameters', async () => {
    const hash = await service.hash('ValidPassword123');
    const parts = hash.split('$');
    // Standard format: ['', 'argon2id', 'v=19', 'm=65536,p=1,t=3', '<salt>', '<hash>']
    expect(parts[1]).toBe('argon2id');

    const params = parts[3];
    expect(params).toContain('m=65536');
    expect(params).toContain('t=3');
    expect(params).toContain('p=1');

    // Verify hashLength is 32 bytes (decoded from base64)
    const rawHashBytes = Buffer.from(parts[5], 'base64');
    expect(rawHashBytes.length).toBe(32);
  });

  it('verify returns true for the correct password', async () => {
    const password = 'CorrectPassword123!';
    const hash = await service.hash(password);
    const isValid = await service.verify(hash, password);
    expect(isValid).toBe(true);
  });

  it('verify returns false for an incorrect password', async () => {
    const password = 'CorrectPassword123!';
    const hash = await service.hash(password);
    const isValid = await service.verify(hash, 'WrongPassword456!');
    expect(isValid).toBe(false);
  });

  it('verify returns false gracefully for malformed hash strings', async () => {
    const isValid = await service.verify('invalid_hash_string', 'password');
    expect(isValid).toBe(false);
  });

  it('hashing the same password twice produces different encoded hashes due to random salt', async () => {
    const password = 'SamePassword123!';
    const hash1 = await service.hash(password);
    const hash2 = await service.hash(password);

    expect(hash1).not.toEqual(hash2);
    expect(await service.verify(hash1, password)).toBe(true);
    expect(await service.verify(hash2, password)).toBe(true);
  });
});
