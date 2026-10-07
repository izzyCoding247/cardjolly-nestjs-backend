import { ValidationError } from 'class-validator';
import { ValidationException } from './validation.exception';

function validationError(
  property: string,
  constraints?: Record<string, string>,
  children: ValidationError[] = [],
): ValidationError {
  return Object.assign(new ValidationError(), {
    property,
    constraints,
    children,
  });
}

describe('ValidationException', () => {
  it('is a 422 with a fixed message', () => {
    const exception = ValidationException.fromErrors([]);
    expect(exception.getStatus()).toBe(422);
    expect(exception.message).toBe('Validation failed');
  });

  it('keeps the first message for each field', () => {
    const { fields } = ValidationException.fromErrors([
      validationError('name', {
        isString: 'name must be a string',
        isNotEmpty: 'name should not be empty',
      }),
      validationError('email', { isEmail: 'email must be an email' }),
    ]);
    expect(fields).toEqual({
      name: 'name must be a string',
      email: 'email must be an email',
    });
  });

  it('uses dot paths for nested fields', () => {
    const { fields } = ValidationException.fromErrors([
      validationError('address', undefined, [
        validationError('city', { isString: 'city must be a string' }),
      ]),
      validationError('items', undefined, [
        validationError('0', undefined, [
          validationError('name', { isString: 'name must be a string' }),
        ]),
      ]),
    ]);
    expect(fields).toEqual({
      'address.city': 'city must be a string',
      'items.0.name': 'name must be a string',
    });
  });
});
