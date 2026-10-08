import { Logger } from '@nestjs/common';
import { RedisThrottlerStorage } from './redis-throttler.storage';

describe('RedisThrottlerStorage', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('runs the script on per-throttler keys and converts ms to seconds', async () => {
    const evalScript = jest
      .fn<Promise<unknown>, unknown[]>()
      .mockResolvedValue([3, 59_500, 0]);
    const storage = new RedisThrottlerStorage({ eval: evalScript });

    const record = await storage.increment('k', 60_000, 60, 60_000, 'minute');

    expect(evalScript).toHaveBeenCalledWith(
      expect.any(String),
      2,
      'throttle:minute:k:hits',
      'throttle:minute:k:blocked',
      60_000,
      60,
      60_000,
    );
    expect(record).toEqual({
      totalHits: 3,
      timeToExpire: 60,
      isBlocked: false,
      timeToBlockExpire: 0,
    });
  });

  it('reports a block while the block key is alive', async () => {
    const storage = new RedisThrottlerStorage({
      eval: () => Promise.resolve([61, 30_000, 60_000]),
    });
    expect(await storage.increment('k', 60_000, 60, 60_000, 'minute')).toEqual({
      totalHits: 61,
      timeToExpire: 30,
      isBlocked: true,
      timeToBlockExpire: 60,
    });
  });

  it('fails open and logs when Redis errors', async () => {
    const logError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const storage = new RedisThrottlerStorage({
      eval: () => Promise.reject(new Error('connection refused')),
    });

    expect(await storage.increment('k', 60_000, 60, 60_000, 'minute')).toEqual({
      totalHits: 0,
      timeToExpire: 0,
      isBlocked: false,
      timeToBlockExpire: 0,
    });
    expect(logError).toHaveBeenCalled();
  });

  it('fails open when Redis does not answer in time', async () => {
    jest.useFakeTimers();
    const logError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const storage = new RedisThrottlerStorage({
      eval: () => new Promise<never>(() => undefined),
    });

    const pending = storage.increment('k', 60_000, 60, 60_000, 'minute');
    jest.advanceTimersByTime(1_000);

    expect(await pending).toEqual({
      totalHits: 0,
      timeToExpire: 0,
      isBlocked: false,
      timeToBlockExpire: 0,
    });
    expect(logError).toHaveBeenCalled();
  });
});
