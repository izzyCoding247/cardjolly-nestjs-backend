import { ConfigModule } from '@nestjs/config';
import { configSections } from './config.sections';
import { validateEnv } from './env.schema';

export const AppConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  cache: true,
  load: configSections,
  validate: validateEnv,
  ignoreEnvFile: process.env.NODE_ENV === 'test',
});
