import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';
import { PrismaModule } from './infra/prisma/prisma.module';
import { RateLimitModule } from './infra/rate-limit/rate-limit.module';
import { RedisModule } from './infra/redis/redis.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    RedisModule,
    RateLimitModule,
    HealthModule,
  ],
})
export class AppModule {}
