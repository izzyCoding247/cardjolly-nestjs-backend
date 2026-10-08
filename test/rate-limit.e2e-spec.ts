import { NestExpressApplication } from '@nestjs/platform-express';
import { randomInt } from 'node:crypto';
import request from 'supertest';
import { createTestApp } from './support/create-test-app';
import { RateLimitTestController } from './support/rate-limit-test.controller';

const PATH = '/api/v1/rate-limit-test';
const TIMEOUT_MS = 30_000;

function randomIp(): string {
  return `10.${randomInt(256)}.${randomInt(256)}.${randomInt(1, 255)}`;
}

describe('Rate limiting (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp([RateLimitTestController]);
  });

  afterAll(async () => {
    await app.close();
  });

  function getAs(ip: string, path = PATH) {
    return request(app.getHttpServer()).get(path).set('X-Forwarded-For', ip);
  }

  async function useUpMinuteLimit(ip: string): Promise<void> {
    for (let i = 0; i < 60; i += 1) {
      await getAs(ip).expect(200);
    }
  }

  it(
    'returns TOO_MANY_REQUESTS after 60 requests in a minute',
    async () => {
      const ip = randomIp();
      await useUpMinuteLimit(ip);
      await getAs(ip).expect(429, {
        error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests' },
      });
    },
    TIMEOUT_MS,
  );

  it(
    'keeps separate limits for different client IPs',
    async () => {
      await useUpMinuteLimit(randomIp());
      await getAs(randomIp()).expect(200, { data: { ok: true } });
    },
    TIMEOUT_MS,
  );

  it(
    'never throttles /health',
    async () => {
      const ip = randomIp();
      for (let i = 0; i < 70; i += 1) {
        await getAs(ip, '/api/v1/health').expect(200);
      }
    },
    TIMEOUT_MS,
  );
});
