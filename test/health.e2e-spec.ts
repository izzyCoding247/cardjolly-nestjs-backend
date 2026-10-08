import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { createTestApp } from './support/create-test-app';

describe('GET /api/v1/health (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('reports the database and Redis as up', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200, {
        data: { status: 'ok', checks: { database: 'up', redis: 'up' } },
      });
  });
});
