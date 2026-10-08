import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Redis } from 'ioredis';
import { redisConfig } from '../../config/config.sections';

// Calls that must stay fast (health, rate limiting) give up after this, even on a connection that is open but dead.
export const REDIS_CHECK_TIMEOUT_MS = 1_000;

@Injectable()
export class RedisService
  extends Redis
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(redisConfig.KEY) redis: ConfigType<typeof redisConfig>) {
    super(redis.url, { lazyConnect: true, maxRetriesPerRequest: 1 });
    this.on('error', (error: Error) => {
      this.logger.error(
        `Redis connection error: ${error.message || error.name}`,
      );
    });
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.quit();
  }
}
