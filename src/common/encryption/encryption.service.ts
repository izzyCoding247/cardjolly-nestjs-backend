import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { securityConfig } from '../../config/config.sections';

const VERSION = 'v1';
const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;
const AUTH_TAG_BYTES = 16;

@Injectable()
export class EncryptionService {
  constructor(
    @Inject(securityConfig.KEY)
    private readonly security: ConfigType<typeof securityConfig>,
  ) {}

  encrypt(plaintext: string): string {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(
      ALGORITHM,
      this.security.cardCodeEncryptionKey,
      iv,
    );
    const ciphertext = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    return [
      VERSION,
      iv.toString('base64'),
      cipher.getAuthTag().toString('base64'),
      ciphertext.toString('base64'),
    ].join(':');
  }

  decrypt(value: string): string {
    const parts = value.split(':');
    if (parts.length !== 4 || parts[0] !== VERSION) {
      throw new Error('Unsupported encrypted value format');
    }
    const [iv, authTag, ciphertext] = parts
      .slice(1)
      .map((part) => Buffer.from(part, 'base64'));
    try {
      // A fixed tag length stops GCM from accepting truncated tags.
      const decipher = createDecipheriv(
        ALGORITHM,
        this.security.cardCodeEncryptionKey,
        iv,
        { authTagLength: AUTH_TAG_BYTES },
      );
      decipher.setAuthTag(authTag);
      return Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]).toString('utf8');
    } catch {
      throw new Error('Encrypted value failed authentication');
    }
  }
}
