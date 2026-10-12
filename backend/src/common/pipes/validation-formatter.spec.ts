import { ValidationError } from '@nestjs/common';
import { formatValidationErrors, ValidationException } from './validation-formatter';

describe('ValidationFormatter', () => {
  it('should format flat class-validator errors into structured ValidationErrorDetail array', () => {
    const error: ValidationError = {
      property: 'email',
      constraints: {
        isEmail: 'email must be an email',
        isNotEmpty: 'email should not be empty',
      },
    };

    const result = formatValidationErrors([error]);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      field: 'email',
      message: 'email must be an email',
      code: 'ISEMAIL',
    });
    expect(result[1]).toEqual({
      field: 'email',
      message: 'email should not be empty',
      code: 'ISNOTEMPTY',
    });
  });

  it('should format nested class-validator errors with dot-notation path', () => {
    const nestedError: ValidationError = {
      property: 'address',
      children: [
        {
          property: 'zipCode',
          constraints: {
            isPostalCode: 'zipCode must be a valid postal code',
          },
        },
      ],
    };

    const result = formatValidationErrors([nestedError]);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      field: 'address.zipCode',
      message: 'zipCode must be a valid postal code',
      code: 'ISPOSTALCODE',
    });
  });

  it('should construct ValidationException with code VALIDATION_ERROR and details', () => {
    const details = [
      {
        field: 'username',
        message: 'username is required',
        code: 'ISNOTEMPTY',
      },
    ];

    const exception = new ValidationException(details);

    expect(exception.getStatus()).toBe(400);
    expect(exception.details).toEqual(details);
    const response = exception.getResponse() as Record<string, unknown>;
    expect(response.code).toBe('VALIDATION_ERROR');
    expect(response.message).toBe('Validation failed');
    expect(response.details).toEqual(details);
  });
});
