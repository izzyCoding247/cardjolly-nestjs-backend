import { UnprocessableEntityException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class ValidationException extends UnprocessableEntityException {
  constructor(readonly fields: Record<string, string>) {
    super('Validation failed');
  }

  static fromErrors(errors: ValidationError[]): ValidationException {
    return new ValidationException(collectFields(errors));
  }
}

function collectFields(
  errors: ValidationError[],
  prefix = '',
): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const error of errors) {
    const path = prefix + error.property;
    const [message] = Object.values(error.constraints ?? {});
    if (message !== undefined) {
      fields[path] = message;
    }
    Object.assign(fields, collectFields(error.children ?? [], `${path}.`));
  }
  return fields;
}
