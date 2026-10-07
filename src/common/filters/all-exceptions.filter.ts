import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { errorCodeFor } from '../errors/error-codes';
import { ValidationException } from '../errors/validation.exception';

interface ErrorDetails {
  status: number;
  message: string;
  fields?: Record<string, string>;
}

function isClientHttpError(
  error: unknown,
): error is Error & { status: number } {
  return (
    error instanceof Error &&
    'expose' in error &&
    error.expose === true &&
    'status' in error &&
    typeof error.status === 'number'
  );
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const { status, message, fields } = this.toErrorDetails(exception);
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(status)
      .json({ error: { code: errorCodeFor(status), message, fields } });
  }

  private toErrorDetails(exception: unknown): ErrorDetails {
    if (exception instanceof HttpException && exception.getStatus() < 500) {
      return {
        status: exception.getStatus(),
        message: exception.message,
        fields:
          exception instanceof ValidationException
            ? exception.fields
            : undefined,
      };
    }
    if (isClientHttpError(exception)) {
      return { status: exception.status, message: exception.message };
    }
    this.logger.error(exception instanceof Error ? exception.stack : exception);
    return {
      status:
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }
}
