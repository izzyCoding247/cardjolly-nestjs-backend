import { Logger } from '@nestjs/common';
import type { ThrottlerStorage } from '@nestjs/throttler';
import { withTimeout } from '../../common/utils/with-timeout';
import { REDIS_CHECK_TIMEOUT_MS } from '../redis/redis.service';

type ThrottlerStorageRecord = Awaited<
  ReturnType<ThrottlerStorage['increment']>
>;

interface ScriptRunner {
  eval(
    script: string,
    numKeys: number,
    ...args: (string | number)[]
  ): Promise<unknown>;
}

const INCREMENT_SCRIPT = `
local hits = redis.call('INCR', KEYS[1])
local ttl = redis.call('PTTL', KEYS[1])
if ttl <= 0 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
local blockTtl = redis.call('PTTL', KEYS[2])
if blockTtl <= 0 and hits > tonumber(ARGV[2]) then
  redis.call('SET', KEYS[2], 1, 'PX', ARGV[3])
  blockTtl = tonumber(ARGV[3])
end
if blockTtl < 0 then
  blockTtl = 0
end
return { hits, ttl, blockTtl }
`;

export class RedisThrottlerStorage implements ThrottlerStorage {
  private readonly logger = new Logger(RedisThrottlerStorage.name);

  constructor(private readonly redis: ScriptRunner) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const prefix = `throttle:${throttlerName}:${key}`;
    try {
      const [totalHits, expiresInMs, blockExpiresInMs] = (await withTimeout(
        this.redis.eval(
          INCREMENT_SCRIPT,
          2,
          `${prefix}:hits`,
          `${prefix}:blocked`,
          ttl,
          limit,
          blockDuration,
        ),
        REDIS_CHECK_TIMEOUT_MS,
        'Rate limit script timed out',
      )) as [number, number, number];
      return {
        totalHits,
        timeToExpire: Math.ceil(expiresInMs / 1000),
        isBlocked: blockExpiresInMs > 0,
        timeToBlockExpire: Math.ceil(blockExpiresInMs / 1000),
      };
    } catch (error) {
      // Fail open: a Redis outage must not take the API down. /health reports it instead.
      this.logger.error(
        'Rate limit check failed, allowing the request',
        error instanceof Error ? error.stack : error,
      );
      return {
        totalHits: 0,
        timeToExpire: 0,
        isBlocked: false,
        timeToBlockExpire: 0,
      };
    }
  }
}
