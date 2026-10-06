import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
  Validate,
  ValidationArguments,
  ValidationError,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  validateSync,
} from 'class-validator';

export const NODE_ENVS = ['development', 'test', 'production'] as const;
export type NodeEnv = (typeof NODE_ENVS)[number];

export function splitOrigins(value: string): string[] {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

function isHttpOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.origin === value
    );
  } catch {
    return false;
  }
}

@ValidatorConstraint({ name: 'isBase64Key32' })
class IsBase64Key32 implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    const decoded = Buffer.from(value, 'base64');
    return decoded.length === 32 && decoded.toString('base64') === value;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be base64 that decodes to exactly 32 bytes`;
  }
}

@ValidatorConstraint({ name: 'isOriginList' })
class IsOriginList implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    const origins = splitOrigins(value);
    return origins.length > 0 && origins.every(isHttpOrigin);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a comma-separated list of http(s) origins`;
  }
}

const HTTP_URL = {
  protocols: ['http', 'https'],
  require_tld: false,
  require_protocol: true,
};

export class EnvironmentVariables {
  @IsIn(NODE_ENVS)
  NODE_ENV: NodeEnv;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 5000;

  @IsString()
  @IsNotEmpty()
  HOST: string = '0.0.0.0';

  @IsUrl({
    protocols: ['postgresql', 'postgres'],
    require_tld: false,
    require_protocol: true,
  })
  DATABASE_URL: string;

  @IsUrl({
    protocols: ['redis', 'rediss'],
    require_tld: false,
    require_protocol: true,
  })
  REDIS_URL: string;

  @IsString()
  @MinLength(32)
  JWT_ACCESS_SECRET: string;

  @IsString()
  @MinLength(32)
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsNotEmpty()
  RESEND_API_KEY: string;

  @IsString()
  @IsNotEmpty()
  RESEND_FROM_EMAIL: string;

  @IsString()
  @IsNotEmpty()
  CLOUDINARY_CLOUD_NAME: string;

  @IsString()
  @IsNotEmpty()
  CLOUDINARY_API_KEY: string;

  @IsString()
  @IsNotEmpty()
  CLOUDINARY_API_SECRET: string;

  @IsUrl(HTTP_URL)
  FRONTEND_URL: string;

  @Validate(IsOriginList)
  CORS_ORIGINS: string;

  @IsUrl(HTTP_URL)
  NEXTJS_REVALIDATE_URL: string;

  @IsString()
  @MinLength(32)
  NEXTJS_REVALIDATE_SECRET: string;

  @Validate(IsBase64Key32)
  CARD_CODE_ENCRYPTION_KEY: string;
}

function formatError(error: ValidationError): string {
  return `- ${Object.values(error.constraints ?? {}).join(', ')}`;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const env = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(env);
  if (errors.length > 0) {
    throw new Error(
      `Invalid environment variables:\n${errors.map(formatError).join('\n')}`,
    );
  }
  return env;
}
