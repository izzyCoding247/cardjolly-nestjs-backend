import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { ClientIpTestController } from './support/client-ip-test.controller';
import { createTestApp } from './support/create-test-app';

const PATH = '/api/v1/client-ip-test';

describe('@ClientIp() (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp([ClientIpTestController]);
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the address the proxy added to X-Forwarded-For', () => {
    return request(app.getHttpServer())
      .get(PATH)
      .set('X-Forwarded-For', '1.2.3.4')
      .expect(200, { data: { ip: '1.2.3.4' } });
  });

  it('ignores addresses a client spoofs in front of it', () => {
    return request(app.getHttpServer())
      .get(PATH)
      .set('X-Forwarded-For', '6.6.6.6, 1.2.3.4')
      .expect(200, { data: { ip: '1.2.3.4' } });
  });
});
