import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { appConfig } from './config/config.sections';

export function setupApp(app: NestExpressApplication): void {
  const { corsOrigins } = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);

  app.set('trust proxy', 1);
  app.use(helmet());
  app.enableCors({ origin: corsOrigins, credentials: true });
  app.useBodyParser('json', { limit: '1mb' });
  app.useBodyParser('urlencoded', { limit: '1mb', extended: true });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  );
  app.enableShutdownHooks();
}
