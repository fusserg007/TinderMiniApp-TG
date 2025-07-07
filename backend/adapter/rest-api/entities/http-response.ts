/**
 * Класс для формирования HTTP ответа
 */
export class HttpResponse {
  public statusCode: number = 200;
  public body: any = {};
  public headers: Record<string, string> = {};

  /**
   * Установка статус кода
   */
  setStatusCode(code: number): HttpResponse {
    this.statusCode = code;
    return this;
  }

  /**
   * Установка тела ответа
   */
  setBody(data: any): HttpResponse {
    this.body = data;
    return this;
  }

  /**
   * Установка заголовка
   */
  setHeader(name: string, value: string): HttpResponse {
    this.headers[name] = value;
    return this;
  }

  /**
   * Успешный ответ
   */
  success(data: any = null): HttpResponse {
    this.statusCode = 200;
    this.body = {
      success: true,
      data: data
    };
    return this;
  }

  /**
   * Ответ с ошибкой
   */
  error(message: string, code: string = 'ERROR', statusCode: number = 400): HttpResponse {
    this.statusCode = statusCode;
    this.body = {
      success: false,
      error: message,
      code: code
    };
    return this;
  }

  /**
   * Ответ "не найдено"
   */
  notFound(message: string = 'Ресурс не найден'): HttpResponse {
    return this.error(message, 'NOT_FOUND', 404);
  }

  /**
   * Ответ "не авторизован"
   */
  unauthorized(message: string = 'Требуется авторизация'): HttpResponse {
    return this.error(message, 'UNAUTHORIZED', 401);
  }

  /**
   * Ответ "доступ запрещен"
   */
  forbidden(message: string = 'Доступ запрещен'): HttpResponse {
    return this.error(message, 'FORBIDDEN', 403);
  }
}
