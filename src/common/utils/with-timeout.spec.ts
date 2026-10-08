import { withTimeout } from './with-timeout';

describe('withTimeout', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves with the value when the promise settles in time', async () => {
    await expect(
      withTimeout(Promise.resolve('ok'), 1_000, 'too slow'),
    ).resolves.toBe('ok');
  });

  it('passes the original error through when the promise fails in time', async () => {
    await expect(
      withTimeout(Promise.reject(new Error('boom')), 1_000, 'too slow'),
    ).rejects.toThrow('boom');
  });

  it('rejects with the timeout message when the promise is too slow', async () => {
    jest.useFakeTimers();
    const pending = withTimeout(
      new Promise<never>(() => undefined),
      1_000,
      'Redis ping timed out',
    );
    jest.advanceTimersByTime(1_000);
    await expect(pending).rejects.toThrow('Redis ping timed out');
  });

  it('leaves no timer behind once the promise settles', async () => {
    jest.useFakeTimers();
    await withTimeout(Promise.resolve('ok'), 1_000, 'too slow');
    await expect(
      withTimeout(Promise.reject(new Error('boom')), 1_000, 'too slow'),
    ).rejects.toThrow('boom');
    expect(jest.getTimerCount()).toBe(0);
  });
});
