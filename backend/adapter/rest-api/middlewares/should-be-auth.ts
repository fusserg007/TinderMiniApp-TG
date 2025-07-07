import { RequestMiddleware } from '../entities/request-middleware';
import { ValidationError } from '../../app/errors/validation-error';

/**
 * Middleware для проверки аутентификации пользователя
 */
export const shouldBeAuth: RequestMiddleware = async (request, response, user) => {
  if (!user) {
    throw new ValidationError('Требуется авторизация', 'auth', 'UNAUTHORIZED');
  }
};
