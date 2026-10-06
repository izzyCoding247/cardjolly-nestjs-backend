import { assertTestDatabase } from './assert-test-database';

describe('assertTestDatabase', () => {
  it('accepts a local *_test database', () => {
    expect(() =>
      assertTestDatabase(
        'postgresql://cardjolly:cardjolly@localhost:5434/cardjolly_test',
      ),
    ).not.toThrow();
  });

  it('rejects a missing URL', () => {
    expect(() => assertTestDatabase(undefined)).toThrow(
      'DATABASE_URL is not set',
    );
  });

  it('rejects an invalid URL', () => {
    expect(() => assertTestDatabase('not a url')).toThrow('is not a valid URL');
  });

  it('rejects a database not ending in _test', () => {
    expect(() =>
      assertTestDatabase(
        'postgresql://cardjolly:cardjolly@localhost:5433/cardjolly_dev',
      ),
    ).toThrow('must use a *_test database');
  });

  it('rejects a remote host', () => {
    expect(() =>
      assertTestDatabase(
        'postgresql://user:pass@db.railway.internal:5432/cardjolly_test',
      ),
    ).toThrow('must use a local database');
  });
});
