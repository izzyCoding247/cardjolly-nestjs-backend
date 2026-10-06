import { registerAs } from '@nestjs/config';
import { EnvironmentVariables, NodeEnv, splitOrigins } from './env.schema';

function env(name: keyof EnvironmentVariables): string {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

export const appConfig = registerAs('app', () => ({
  nodeEnv: env('NODE_ENV') as NodeEnv,
  port: Number(env('PORT')),
  host: env('HOST'),
  frontendUrl: env('FRONTEND_URL'),
  corsOrigins: splitOrigins(env('CORS_ORIGINS')),
  revalidateUrl: env('NEXTJS_REVALIDATE_URL'),
  revalidateSecret: env('NEXTJS_REVALIDATE_SECRET'),
}));

export const dbConfig = registerAs('db', () => ({
  url: env('DATABASE_URL'),
}));

export const jwtConfig = registerAs('jwt', () => ({
  accessSecret: env('JWT_ACCESS_SECRET'),
  refreshSecret: env('JWT_REFRESH_SECRET'),
}));

export const redisConfig = registerAs('redis', () => ({
  url: env('REDIS_URL'),
}));

export const mailConfig = registerAs('mail', () => ({
  resendApiKey: env('RESEND_API_KEY'),
  fromEmail: env('RESEND_FROM_EMAIL'),
}));

export const storageConfig = registerAs('storage', () => ({
  cloudinary: {
    cloudName: env('CLOUDINARY_CLOUD_NAME'),
    apiKey: env('CLOUDINARY_API_KEY'),
    apiSecret: env('CLOUDINARY_API_SECRET'),
  },
}));

export const securityConfig = registerAs('security', () => ({
  cardCodeEncryptionKey: Buffer.from(env('CARD_CODE_ENCRYPTION_KEY'), 'base64'),
}));

export const configSections = [
  appConfig,
  dbConfig,
  jwtConfig,
  redisConfig,
  mailConfig,
  storageConfig,
  securityConfig,
];
