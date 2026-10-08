import { assertTestRedis } from './assert-test-redis';

describe('assertTestRedis', () => {
  it('accepts local Redis database 1', () => {
    expect(() => assertTestRedis('redis://localhost:6379/1')).not.toThrow();
  });

  it('rejects a missing URL', () => {
    expect(() => assertTestRedis(undefined)).toThrow('REDIS_URL is not set');
  });

  it('rejects an invalid URL', () => {
    expect(() => assertTestRedis('not a url')).toThrow('is not a valid URL');
  });

  it('rejects database 0, written or implied', () => {
    expect(() => assertTestRedis('redis://localhost:6379/0')).toThrow(
      'must use Redis database 1, got 0',
    );
    expect(() => assertTestRedis('redis://localhost:6379')).toThrow(
      'must use Redis database 1, got 0',
    );
  });

  it('rejects a remote host', () => {
    expect(() =>
      assertTestRedis('redis://default:secret@redis.railway.internal:6379/1'),
    ).toThrow('must use a local Redis');
  });
});
