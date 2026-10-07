import { ConfigType } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { appConfig } from '../src/config/config.sections';
import { setupApp } from '../src/setup-app';

function jsonBodyOfSize(bytes: number): string {
  return JSON.stringify({ padding: 'x'.repeat(bytes) });
}

describe('App (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>();
    setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns a JSON 404 for unknown routes', () => {
    return request(app.getHttpServer())
      .get('/api/v1/does-not-exist')
      .expect('Content-Type', /json/)
      .expect(404, {
        message: 'Cannot GET /api/v1/does-not-exist',
        error: 'Not Found',
        statusCode: 404,
      });
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
      .send(jsonBodyOfSize(200 * 1024))
      .expect(404);
  });

  it('rejects JSON bodies over 1 MB', () => {
    return request(app.getHttpServer())
      .post('/api/v1/does-not-exist')
      .set('Content-Type', 'application/json')
      .send(jsonBodyOfSize(1100 * 1024))
      .expect(413);
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
