import { RequestMiddleware } from '../entities/request-middleware';
import { ValidationError } from '../../app/errors/validation-error';

/**
 * Middleware для проверки лимитов пользователя
 */
export const shouldBeNotLimited: RequestMiddleware = async (request, response, user) => {
  if (!user) {
    throw new ValidationError('Требуется авторизация', 'auth', 'UNAUTHORIZED');
  }

  if (user.restScores <= 0) {
    throw new ValidationError('Недостаточно очков для выполнения действия', 'restScores', 'INSUFFICIENT_SCORES');
  }
};
