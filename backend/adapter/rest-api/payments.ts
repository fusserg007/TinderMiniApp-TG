import { HttpRoute } from './entities/http-route';
import { HttpRequest } from './entities/http-request';
import { HttpResponse } from './entities/http-response';
import { PaymentService } from '../app/payments';
import { shouldBeAuth } from './middlewares/should-be-auth';
import { ValidationError } from '../app/errors/validation-error';

const paymentService = new PaymentService();

/**
 * Маршруты для платежей
 */
export const paymentsRoutes: HttpRoute[] = [
  {
    method: 'POST',
    path: '/api/payments/create',
    before: [shouldBeAuth],
    handler: async (request: HttpRequest, response: HttpResponse, user) => {
      const amount = request.getBodyParam<number>('amount');
      const description = request.getBodyParam<string>('description', 'Покупка очков');
      
      if (!amount || amount <= 0) {
        throw new ValidationError('Сумма должна быть больше 0', 'amount');
      }

      const payment = await paymentService.createPayment(
        user!.id,
        amount,
        'XTR', // Telegram Stars
        description
      );
      
      response.success(payment);
    }
  },

  {
    method: 'GET',
    path: '/api/payments/history',
    before: [shouldBeAuth],
    handler: async (request: HttpRequest, response: HttpResponse, user) => {
      const page = request.getQueryParam<number>('page', 1);
      const limit = request.getQueryParam<number>('limit', 10);
      
      const payments = await paymentService.getUserPayments(user!.id, page, limit);
      
      response.success(payments);
    }
  },

  {
    method: 'POST',
    path: '/api/payments/verify',
    before: [shouldBeAuth],
    handler: async (request: HttpRequest, response: HttpResponse, user) => {
      const paymentId = request.getBodyParam<string>('paymentId');
      const transactionId = request.getBodyParam<string>('transactionId');
      
      if (!paymentId) {
        throw new ValidationError('Параметр paymentId обязателен', 'paymentId');
      }
      
      if (!transactionId) {
        throw new ValidationError('Параметр transactionId обязателен', 'transactionId');
      }

      const result = await paymentService.verifyPayment(paymentId, transactionId);
      
      response.success(result);
    }
  }
];
