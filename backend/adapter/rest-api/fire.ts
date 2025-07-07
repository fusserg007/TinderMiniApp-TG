import { HttpRoute } from './entities/http-route';
import { HttpRequest } from './entities/http-request';
import { HttpResponse } from './entities/http-response';
import { MatcherService } from '../app/matcher';
import { shouldBeAuth } from './middlewares/should-be-auth';
import { shouldBeNotLimited } from './middlewares/should-be-not-limited';
import { ValidationError } from '../app/errors/validation-error';
import { di } from '../app/di';

const matcherService = new MatcherService();

/**
 * Маршруты для оценки пользователей (лайк/дизлайк)
 */
export const fireRoutes: HttpRoute[] = [
  {
    method: 'POST',
    path: '/api/fire',
    before: [shouldBeAuth, shouldBeNotLimited],
    handler: async (request: HttpRequest, response: HttpResponse, user) => {
      const targetUserId = request.getBodyParam<number>('targetUserId');
      const isLike = request.getBodyParam<boolean>('isLike');
      
      if (!targetUserId) {
        throw new ValidationError('Параметр targetUserId обязателен', 'targetUserId');
      }
      
      if (typeof isLike !== 'boolean') {
        throw new ValidationError('Параметр isLike должен быть boolean', 'isLike');
      }

      // Создаем оценку
      const result = await matcherService.createMatch(user!.id, targetUserId, isLike);
      
      // Уменьшаем количество очков пользователя
      const mongoStore = di.getMongoStore();
      await mongoStore.users.updateOne(
        { id: user!.id },
        { $inc: { restScores: -1 } }
      );
      
      response.success({
        isMatch: result.isMatch,
        match: result.match,
        restScores: user!.restScores - 1
      });
    }
  }
];
