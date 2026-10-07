import { randomBytes } from 'node:crypto';
import { EncryptionService } from './encryption.service';

function serviceWithKey(key = randomBytes(32)): EncryptionService {
  return new EncryptionService({ cardCodeEncryptionKey: key });
}

function tamperCiphertext(value: string): string {
  const parts = value.split(':');
  const ciphertext = Buffer.from(parts[3], 'base64');
  ciphertext[0] ^= 1;
  parts[3] = ciphertext.toString('base64');
  return parts.join(':');
}

describe('EncryptionService', () => {
  const service = serviceWithKey();

  it('decrypts what it encrypted', () => {
    const plaintext = 'X7KQ-9MPL-3RTD-8WNB';
    expect(service.decrypt(service.encrypt(plaintext))).toBe(plaintext);
  });

  it('gives different output for the same input', () => {
    const first = service.encrypt('same code');
    const second = service.encrypt('same code');
    expect(first).not.toBe(second);
    expect(service.decrypt(first)).toBe('same code');
    expect(service.decrypt(second)).toBe('same code');
  });

  it('tags values with the current version', () => {
    expect(service.encrypt('code')).toMatch(/^v1:/);
  });

  it('throws on tampered ciphertext', () => {
    const tampered = tamperCiphertext(service.encrypt('code'));
    expect(() => service.decrypt(tampered)).toThrow(
      'Encrypted value failed authentication',
    );
  });

  it('throws for a value encrypted with a different key', () => {
    const encrypted = serviceWithKey().encrypt('code');
    expect(() => service.decrypt(encrypted)).toThrow(
      'Encrypted value failed authentication',
    );
  });

  it('throws for an unknown version tag', () => {
    const encrypted = service.encrypt('code').replace(/^v1:/, 'v9:');
    expect(() => service.decrypt(encrypted)).toThrow(
      'Unsupported encrypted value format',
    );
  });
});
