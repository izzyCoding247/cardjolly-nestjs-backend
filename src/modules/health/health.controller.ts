import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { withTimeout } from '../../common/utils/with-timeout';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { SKIP_ALL_THROTTLERS } from '../../infra/rate-limit/throttlers';
import {
  REDIS_CHECK_TIMEOUT_MS,
  RedisService,
} from '../../infra/redis/redis.service';

@SkipThrottle(SKIP_ALL_THROTTLERS)
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      throw new ServiceUnavailableException('Database unavailable', {
        cause: error,
      });
    }
    try {
      await withTimeout(
        this.redis.ping(),
        REDIS_CHECK_TIMEOUT_MS,
        'Redis ping timed out',
      );
    } catch (error) {
      throw new ServiceUnavailableException('Redis unavailable', {
        cause: error,
      });
    }
    return { status: 'ok', checks: { database: 'up', redis: 'up' } };
  }
}
