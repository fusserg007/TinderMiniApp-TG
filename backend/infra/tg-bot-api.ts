import fetch from 'node-fetch';

/**
 * Класс для взаимодействия с Telegram Bot API
 */
export class TgBotApi {
  private readonly baseUrl: string;

  constructor(private readonly botToken: string) {
    this.baseUrl = `https://api.telegram.org/bot${botToken}`;
  }

  /**
   * Установка вебхука для получения обновлений
   */
  async setWebhook(url: string): Promise<void> {
    const response = await this.query('setWebhook', {
      url: url,
      allowed_updates: ['message', 'callback_query']
    });

    if (!response.ok) {
      throw new Error(`Не удалось установить вебхук: ${response.description}`);
    }
  }

  /**
   * Отправка сообщения пользователю
   */
  async sendMessage(
    chatId: number,
    text: string,
    options: any = {}
  ): Promise<any> {
    return await this.query('sendMessage', {
      chat_id: chatId,
      text: text,
      ...options
    });
  }

  /**
   * Отправка фото пользователю
   */
  async sendPhoto(
    chatId: number,
    photo: string,
    caption?: string,
    options: any = {}
  ): Promise<any> {
    return await this.query('sendPhoto', {
      chat_id: chatId,
      photo: photo,
      caption: caption,
      ...options
    });
  }

  /**
   * Ответ на callback query
   */
  async answerCallbackQuery(
    callbackQueryId: string,
    text?: string,
    showAlert: boolean = false
  ): Promise<any> {
    return await this.query('answerCallbackQuery', {
      callback_query_id: callbackQueryId,
      text: text,
      show_alert: showAlert
    });
  }

  /**
   * Получение информации о пользователе
   */
  async getMe(): Promise<any> {
    return await this.query('getMe');
  }

  /**
   * Выполнение запроса к Telegram Bot API
   */
  async query(method: string, params: any = {}): Promise<any> {
    try {
      const url = `${this.baseUrl}/${method}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(`Telegram API Error: ${data.description}`);
      }

      return data.result;
    } catch (error) {
      console.error(`Ошибка при выполнении запроса ${method}:`, error);
      throw error;
    }
  }
}
