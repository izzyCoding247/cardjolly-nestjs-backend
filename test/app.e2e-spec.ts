import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns a JSON 404 for unknown routes', () => {
    return request(app.getHttpServer())
      .get('/does-not-exist')
      .expect('Content-Type', /json/)
      .expect(404, {
        message: 'Cannot GET /does-not-exist',
        error: 'Not Found',
        statusCode: 404,
      });
  });
});
