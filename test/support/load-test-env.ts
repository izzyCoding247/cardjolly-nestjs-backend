import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseEnv } from 'node:util';

export function loadTestEnv(): void {
  const testEnv = parseEnv(
    readFileSync(join(__dirname, '..', '..', '.env.test'), 'utf8'),
  );
  for (const [key, value] of Object.entries(testEnv)) {
    process.env[key] ??= value;
  }
}
