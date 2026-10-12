import { BadRequestException, ValidationError } from '@nestjs/common';
import { ValidationErrorDetail } from '../types/api-response';

/**
 * Formats class-validator ValidationError hierarchy into flat, typed ValidationErrorDetail objects.
 * Supports nested object properties (e.g. "address.postalCode").
 */
export function formatValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): ValidationErrorDetail[] {
  const details: ValidationErrorDetail[] = [];

  for (const err of errors) {
    const propertyPath = parentPath ? `${parentPath}.${err.property}` : err.property;

    if (err.constraints) {
      for (const [constraintName, message] of Object.entries(err.constraints)) {
        details.push({
          field: propertyPath,
          message,
          code: constraintName.toUpperCase(),
        });
      }
    }

    if (err.children && err.children.length > 0) {
      details.push(...formatValidationErrors(err.children, propertyPath));
    }
  }

  return details;
}

/**
 * Structured validation exception carrying typed validation details.
 */
export class ValidationException extends BadRequestException {
  public readonly details: ValidationErrorDetail[];

  constructor(details: ValidationErrorDetail[]) {
    super({
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details,
    });
    this.details = details;
  }
}
