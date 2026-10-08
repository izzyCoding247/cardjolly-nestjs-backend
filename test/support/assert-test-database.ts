export const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export function assertTestDatabase(
  databaseUrl: string | undefined,
): asserts databaseUrl is string {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set for e2e tests');
  }

  let url: URL;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL is not a valid URL');
  }

  if (!LOCAL_HOSTS.has(url.hostname)) {
    throw new Error(
      `e2e tests must use a local database, got host ${url.hostname}`,
    );
  }

  const databaseName = url.pathname.slice(1);
  if (!databaseName.endsWith('_test')) {
    throw new Error(
      `e2e tests must use a *_test database, got ${databaseName}`,
    );
  }
}
