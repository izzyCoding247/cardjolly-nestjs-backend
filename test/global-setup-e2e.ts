import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { Redis } from 'ioredis';
import { assertTestDatabase } from './support/assert-test-database';
import { assertTestRedis } from './support/assert-test-redis';
import { loadTestEnv } from './support/load-test-env';

export default async function globalSetup(): Promise<void> {
  loadTestEnv();
  const databaseUrl = process.env.DATABASE_URL;
  const redisUrl = process.env.REDIS_URL;
  assertTestDatabase(databaseUrl);
  assertTestRedis(redisUrl);

  execFileSync(
    process.execPath,
    [
      join(__dirname, '..', 'node_modules', 'prisma', 'build', 'index.js'),
      'migrate',
      'deploy',
    ],
    { stdio: 'inherit' },
  );

  const redis = new Redis(redisUrl, { lazyConnect: true });
  await redis.connect();
  await redis.flushdb();
  await redis.quit();
}
