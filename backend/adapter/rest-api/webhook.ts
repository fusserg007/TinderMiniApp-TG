import { HttpRoute } from './entities/http-route';
import { HttpRequest } from './entities/http-request';
import { HttpResponse } from './entities/http-response';
import { di } from '../app/di';

/**
 * Маршруты для вебхуков
 */
export const webhookRoutes: HttpRoute[] = [
  {
    method: 'POST',
    path: '/api/webhook/telegram',
    handler: async (request: HttpRequest, response: HttpResponse) => {
      const update = request.body;
      
      console.log('Получено обновление от Telegram:', JSON.stringify(update, null, 2));
      
      // Здесь можно добавить обработку различных типов обновлений
      if (update.message) {
        // Обработка сообщений
        console.log('Получено сообщение:', update.message);
      }
      
      if (update.callback_query) {
        // Обработка callback запросов
        console.log('Получен callback query:', update.callback_query);
      }
      
      if (update.pre_checkout_query) {
        // Обработка предварительных запросов на оплату
        console.log('Получен pre_checkout_query:', update.pre_checkout_query);
        
        const tgBotApi = di.getTgBotApi();
        await tgBotApi.query('answerPreCheckoutQuery', {
          pre_checkout_query_id: update.pre_checkout_query.id,
          ok: true
        });
      }
      
      if (update.successful_payment) {
        // Обработка успешных платежей
        console.log('Получен successful_payment:', update.successful_payment);
        
        // Здесь можно добавить логику обновления баланса пользователя
      }
      
      response.success({ received: true });
    }
  },

  {
    method: 'POST',
    path: '/api/webhook/payment',
    handler: async (request: HttpRequest, response: HttpResponse) => {
      const paymentData = request.body;
      
      console.log('Получено уведомление о платеже:', JSON.stringify(paymentData, null, 2));
      
      // Здесь можно добавить обработку уведомлений о платежах от внешних систем
      
      response.success({ received: true });
    }
  }
];
