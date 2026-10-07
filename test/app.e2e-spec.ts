import { ConfigType } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { appConfig } from '../src/config/config.sections';
import { createTestApp } from './support/create-test-app';

describe('App (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('applies the PORT and HOST defaults', () => {
    const config = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);
    expect(config.port).toBe(5000);
    expect(config.host).toBe('0.0.0.0');
  });

  it('accepts JSON bodies above the 100 KB Express default', () => {
    return request(app.getHttpServer())
      .post('/api/v1/does-not-exist')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ padding: 'x'.repeat(200 * 1024) }))
      .expect(404);
  });

  it('allows CORS preflight from a configured origin', () => {
    return request(app.getHttpServer())
      .options('/api/v1/does-not-exist')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST')
      .expect(204)
      .expect('Access-Control-Allow-Origin', 'http://localhost:3000')
      .expect('Access-Control-Allow-Credentials', 'true');
  });

  it('does not allow CORS from other origins', async () => {
    const response = await request(app.getHttpServer())
      .options('/api/v1/does-not-exist')
      .set('Origin', 'https://evil.example')
      .set('Access-Control-Request-Method', 'POST');
    expect(response.get('Access-Control-Allow-Origin')).toBeUndefined();
  });

  it('sends Helmet security headers', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/v1/does-not-exist',
    );
    expect(response.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.get('X-Powered-By')).toBeUndefined();
  });
});
