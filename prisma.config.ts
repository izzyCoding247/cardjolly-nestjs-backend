import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  // Read directly instead of env(), which throws, so prisma generate works without a database URL.
  datasource: { url: process.env.DATABASE_URL ?? '' },
});
