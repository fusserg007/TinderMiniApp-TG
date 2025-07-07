import { HttpRoute } from './entities/http-route';
import { HttpRequest } from './entities/http-request';
import { HttpResponse } from './entities/http-response';
import { MatcherService } from '../app/matcher';
import { shouldBeAuth } from './middlewares/should-be-auth';
import { shouldBeNotLimited } from './middlewares/should-be-not-limited';

const matcherService = new MatcherService();

/**
 * Маршруты для рекомендаций
 */
export const recommendationsRoutes: HttpRoute[] = [
  {
    method: 'GET',
    path: '/api/recommendations',
    before: [shouldBeAuth],
    handler: async (request: HttpRequest, response: HttpResponse, user) => {
      const limit = request.getQueryParam<number>('limit', 10);
      
      const recommendations = await matcherService.getRecommendations(user!.id, limit);
      
      response.success(recommendations);
    }
  },

  {
    method: 'GET',
    path: '/api/matches',
    before: [shouldBeAuth],
    handler: async (request: HttpRequest, response: HttpResponse, user) => {
      const matches = await matcherService.getUserMatches(user!.id);
      
      response.success(matches);
    }
  }
];
