import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PasswordHasher } from '../../application/ports/password-hasher.port';

@Injectable()
export class Argon2PasswordHasherService implements PasswordHasher {
  private readonly options: argon2.HashOptions = {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
    hashLength: 32,
  };

  async hash(password: string): Promise<string> {
    try {
      const hashed = await argon2.hash(password, this.options);
      return hashed as string;
    } catch {
      throw new Error('Failed to compute password hash');
    }
  }

  async verify(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }
}
