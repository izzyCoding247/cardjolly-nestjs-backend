import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { RedisService } from '../../infra/redis/redis.service';
import { HealthController } from './health.controller';

const up = () => Promise.resolve('ok');
const down = () => Promise.reject(new Error('connection refused'));

async function healthController(
  database: () => Promise<unknown>,
  redis: () => Promise<unknown>,
): Promise<HealthController> {
  const moduleRef = await Test.createTestingModule({
    controllers: [HealthController],
    providers: [
      { provide: PrismaService, useValue: { $queryRaw: database } },
      { provide: RedisService, useValue: { ping: redis } },
    ],
  }).compile();
  return moduleRef.get(HealthController);
}

describe('HealthController', () => {
  it('reports both checks as up', async () => {
    expect(await (await healthController(up, up)).check()).toEqual({
      status: 'ok',
      checks: { database: 'up', redis: 'up' },
    });
  });

  it('is unavailable when the database query fails', async () => {
    const check = (await healthController(down, up)).check();
    await expect(check).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(check).rejects.toThrow('Database unavailable');
  });

  it('is unavailable when Redis does not answer', async () => {
    const check = (await healthController(up, down)).check();
    await expect(check).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(check).rejects.toThrow('Redis unavailable');
  });
});
