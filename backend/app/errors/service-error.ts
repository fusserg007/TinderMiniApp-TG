/**
 * Базовый класс для ошибок сервиса
 */
export class ServiceError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string = 'SERVICE_ERROR', statusCode: number = 500) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.statusCode = statusCode;

    // Сохраняем правильный stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServiceError);
    }
  }
}
