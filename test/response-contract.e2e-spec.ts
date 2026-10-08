import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { ContractTestController } from './support/contract-test.controller';
import { createTestApp } from './support/create-test-app';

const BASE = '/api/v1/contract-test';

describe('Response contract (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp([ContractTestController]);
  });

  afterAll(async () => {
    await app.close();
  });

  it('wraps a success in data', () => {
    return request(app.getHttpServer())
      .get(`${BASE}/item`)
      .expect(200, { data: { id: 1, name: 'Item' } });
  });

  it('wraps a list in data and meta', () => {
    return request(app.getHttpServer())
      .get(`${BASE}/list`)
      .expect(200, {
        data: [{ id: 1 }, { id: 2 }],
        meta: { page: 1, pageSize: 2, total: 5, totalPages: 3 },
      });
  });

  it('returns NOT_FOUND for unknown routes', () => {
    return request(app.getHttpServer())
      .get('/api/v1/does-not-exist')
      .expect('Content-Type', /json/)
      .expect(404, {
        error: {
          code: 'NOT_FOUND',
          message: 'Cannot GET /api/v1/does-not-exist',
        },
      });
  });

  it('returns METHOD_NOT_ALLOWED', () => {
    return request(app.getHttpServer())
      .get(`${BASE}/method-not-allowed`)
      .expect(405, {
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Method Not Allowed' },
      });
  });

  it('returns PAYLOAD_TOO_LARGE for bodies over 1 MB', () => {
    return request(app.getHttpServer())
      .post(`${BASE}/validate`)
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ padding: 'x'.repeat(1100 * 1024) }))
      .expect(413, {
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: 'request entity too large',
        },
      });
  });

  it('returns UNSUPPORTED_MEDIA_TYPE for an unsupported charset', () => {
    return request(app.getHttpServer())
      .post(`${BASE}/validate`)
      .set('Content-Type', 'application/json; charset=latin1')
      .send('{}')
      .expect(415, {
        error: {
          code: 'UNSUPPORTED_MEDIA_TYPE',
          message: 'unsupported charset "LATIN1"',
        },
      });
  });

  it('returns TOO_MANY_REQUESTS', () => {
    return request(app.getHttpServer())
      .get(`${BASE}/too-many`)
      .expect(429, {
        error: { code: 'TOO_MANY_REQUESTS', message: 'Too Many Requests' },
      });
  });

  it('returns VALIDATION_FAILED with fields', () => {
    return request(app.getHttpServer())
      .post(`${BASE}/validate`)
      .send({ address: {}, extra: true })
      .expect(422, {
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Validation failed',
          fields: {
            name: 'name must be a string',
            'address.city': 'city must be a string',
            extra: 'property extra should not exist',
          },
        },
      });
  });

  it('returns BAD_REQUEST for invalid JSON', () => {
    return request(app.getHttpServer())
      .post(`${BASE}/validate`)
      .set('Content-Type', 'application/json')
      .send('{"name":')
      .expect(400)
      .expect(({ body }) => {
        expect(body).toMatchObject({ error: { code: 'BAD_REQUEST' } });
      });
  });

  it('returns a generic INTERNAL_ERROR without leaking details', async () => {
    const response = await request(app.getHttpServer())
      .get(`${BASE}/crash`)
      .expect(500, {
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      });
    expect(response.text).not.toContain('db-internal');
  });

  it('maps a Prisma unique violation to CONFLICT', () => {
    return request(app.getHttpServer())
      .get(`${BASE}/prisma/P2002`)
      .expect(409, {
        error: {
          code: 'CONFLICT',
          message: 'A record with these values already exists',
        },
      });
  });

  it('maps a missing Prisma record to NOT_FOUND', () => {
    return request(app.getHttpServer())
      .get(`${BASE}/prisma/P2025`)
      .expect(404, {
        error: { code: 'NOT_FOUND', message: 'Record not found' },
      });
  });

  it('hides other Prisma errors behind INTERNAL_ERROR', async () => {
    const response = await request(app.getHttpServer())
      .get(`${BASE}/prisma/P2003`)
      .expect(500, {
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      });
    expect(response.text).not.toContain('P2003');
  });

  it('returns SERVICE_UNAVAILABLE', () => {
    return request(app.getHttpServer())
      .get(`${BASE}/unavailable`)
      .expect(503, {
        error: { code: 'SERVICE_UNAVAILABLE', message: 'Service unavailable' },
      });
  });
});
