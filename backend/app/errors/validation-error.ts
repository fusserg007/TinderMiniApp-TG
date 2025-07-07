/**
 * Ошибка валидации данных
 */
export class ValidationError extends Error {
  public readonly field: string;
  public readonly code: string;
  public readonly statusCode: number = 400;

  constructor(message: string, field: string, code: string = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = code;

    // Сохраняем правильный stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}
