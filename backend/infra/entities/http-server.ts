/**
 * Интерфейс HTTP сервера
 */
export interface HttpServer {
  /**
   * Запуск сервера на указанном порту
   */
  listen(port: number): Promise<void>;
}
