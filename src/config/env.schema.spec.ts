import { validateEnv } from './env.schema';

const validEnv: Record<string, string> = {
  NODE_ENV: 'test',
  DATABASE_URL:
    'postgresql://cardjolly:cardjolly@localhost:5434/cardjolly_test',
  REDIS_URL: 'redis://localhost:6379/1',
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
  RESEND_API_KEY: 're_test',
  RESEND_FROM_EMAIL: 'CardJolly <noreply@mail.cardjolly.com>',
  CLOUDINARY_CLOUD_NAME: 'test',
  CLOUDINARY_API_KEY: 'test',
  CLOUDINARY_API_SECRET: 'test',
  FRONTEND_URL: 'http://localhost:3000',
  CORS_ORIGINS: 'http://localhost:3000, https://cardjolly.com',
  NEXTJS_REVALIDATE_URL: 'http://localhost:3000',
  NEXTJS_REVALIDATE_SECRET: 'c'.repeat(32),
  CARD_CODE_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString('base64'),
};

function errorMessage(run: () => unknown): string {
  try {
    run();
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
  }
  throw new Error('expected validateEnv to throw');
}

describe('validateEnv', () => {
  it('accepts a complete environment and applies defaults', () => {
    const env = validateEnv(validEnv);
    expect(env.PORT).toBe(5000);
    expect(env.HOST).toBe('0.0.0.0');
  });

  it('converts PORT to a number', () => {
    expect(validateEnv({ ...validEnv, PORT: '8080' }).PORT).toBe(8080);
  });

  it('lists every missing variable without echoing submitted values', () => {
    const message = errorMessage(() =>
      validateEnv({ JWT_ACCESS_SECRET: 'too-short-secret-value' }),
    );
    for (const name of Object.keys(validEnv)) {
      expect(message).toContain(name);
    }
    expect(message).not.toContain('too-short-secret-value');
  });

  it.each([
    ['31 bytes', Buffer.alloc(31, 1).toString('base64')],
    ['33 bytes', Buffer.alloc(33, 1).toString('base64')],
    ['not base64', 'not-base64-at-all!'],
  ])('rejects a card encryption key that is %s', (_label, key) => {
    expect(
      errorMessage(() =>
        validateEnv({ ...validEnv, CARD_CODE_ENCRYPTION_KEY: key }),
      ),
    ).toContain('CARD_CODE_ENCRYPTION_KEY');
  });

  it.each(['http://localhost:3000,not-a-url', 'https://cardjolly.com/'])(
    'rejects CORS_ORIGINS %s',
    (origins) => {
      expect(
        errorMessage(() => validateEnv({ ...validEnv, CORS_ORIGINS: origins })),
      ).toContain('CORS_ORIGINS');
    },
  );
});
