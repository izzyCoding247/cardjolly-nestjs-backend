import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { assertTestDatabase } from './support/assert-test-database';
import { loadTestEnv } from './support/load-test-env';

export default function globalSetup(): void {
  loadTestEnv();
  assertTestDatabase(process.env.DATABASE_URL);
  execFileSync(
    process.execPath,
    [
      join(__dirname, '..', 'node_modules', 'prisma', 'build', 'index.js'),
      'migrate',
      'deploy',
    ],
    { stdio: 'inherit' },
  );
}
