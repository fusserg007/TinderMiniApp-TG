import { HttpRoute } from './entities/http-route';
import { HttpRequest } from './entities/http-request';
import { HttpResponse } from './entities/http-response';
import { AuthService } from '../app/auth';
import { ValidationError } from '../app/errors/validation-error';
import { shouldBeAuth } from './middlewares/should-be-auth';

const authService = new AuthService();

/**
 * Маршруты для аутентификации
 */
export const authRoutes: HttpRoute[] = [
  {
    method: 'POST',
    path: '/api/auth/login',
    handler: async (request: HttpRequest, response: HttpResponse) => {
      const initData = request.getBodyParam<string>('initData');
      
      if (!initData) {
        throw new ValidationError('Параметр initData обязателен', 'initData');
      }

      // Валидируем данные от Telegram
      const isValid = authService.validateInitData(initData);
      if (!isValid) {
        throw new ValidationError('Невалидные данные инициализации', 'initData', 'INVALID_INIT_DATA');
      }

      // Извлекаем данные пользователя
      const userData = authService.parseUserFromInitData(initData);
      
      // Создаем или обновляем пользователя
      const user = await authService.createOrUpdateUser(userData);
      
      // Создаем сессию
      const session = await authService.createSession(user.id);
      
      response.success({
        user: user,
        sessionId: session.id
      });
    }
  },

  {
    method: 'POST',
    path: '/api/get-user',
    handler: async (request: HttpRequest, response: HttpResponse) => {
      const initData = request.getBodyParam<string>('initData');
      
      if (!initData) {
        throw new ValidationError('Параметр initData обязателен', 'initData');
      }

      // Валидируем данные от Telegram
      const isValid = authService.validateInitData(initData);
      if (!isValid) {
        throw new ValidationError('Невалидные данные инициализации', 'initData', 'INVALID_INIT_DATA');
      }

      // Извлекаем данные пользователя
      const userData = authService.parseUserFromInitData(initData);
      
      // Создаем или обновляем пользователя
      const user = await authService.createOrUpdateUser(userData);
      
      response.success(user);
    }
  },

  {
    method: 'GET',
    path: '/api/auth/me',
    before: [shouldBeAuth],
    handler: async (request: HttpRequest, response: HttpResponse, user) => {
      response.success(user);
    }
  },

  {
    method: 'POST',
    path: '/api/auth/logout',
    before: [shouldBeAuth],
    handler: async (request: HttpRequest, response: HttpResponse) => {
      // В данной реализации просто возвращаем успех
      // В реальном приложении здесь можно удалить сессию
      response.success({ message: 'Выход выполнен успешно' });
    }
  }
];
