import { LOCAL_HOSTS } from './assert-test-database';

export function assertTestRedis(
  redisUrl: string | undefined,
): asserts redisUrl is string {
  if (!redisUrl) {
    throw new Error('REDIS_URL is not set for e2e tests');
  }

  let url: URL;
  try {
    url = new URL(redisUrl);
  } catch {
    throw new Error('REDIS_URL is not a valid URL');
  }

  if (!LOCAL_HOSTS.has(url.hostname)) {
    throw new Error(
      `e2e tests must use a local Redis, got host ${url.hostname}`,
    );
  }

  const database = url.pathname.slice(1) || '0';
  if (database !== '1') {
    throw new Error(`e2e tests must use Redis database 1, got ${database}`);
  }
}
