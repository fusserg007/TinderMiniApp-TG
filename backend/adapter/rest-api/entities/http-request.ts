/**
 * Класс для инкапсуляции данных входящего HTTP запроса
 */
export class HttpRequest {
  constructor(
    public readonly body: any,
    public readonly query: any,
    public readonly userAgent: string,
    public readonly ip: string
  ) {}

  /**
   * Получение значения из body
   */
  getBodyParam<T>(key: string, defaultValue?: T): T {
    return this.body[key] ?? defaultValue;
  }

  /**
   * Получение значения из query параметров
   */
  getQueryParam<T>(key: string, defaultValue?: T): T {
    return this.query[key] ?? defaultValue;
  }

  /**
   * Проверка наличия параметра в body
   */
  hasBodyParam(key: string): boolean {
    return key in this.body;
  }

  /**
   * Проверка наличия параметра в query
   */
  hasQueryParam(key: string): boolean {
    return key in this.query;
  }
}
