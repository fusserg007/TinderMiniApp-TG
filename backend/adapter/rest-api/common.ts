import { HttpRoute } from './entities/http-route';
import { HttpRequest } from './entities/http-request';
import { HttpResponse } from './entities/http-response';

/**
 * Общие маршруты API
 */
export const commonRoutes: HttpRoute[] = [
  {
    method: 'GET',
    path: '/api/health',
    handler: async (request: HttpRequest, response: HttpResponse) => {
      response.success({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    }
  },

  {
    method: 'GET',
    path: '/api/version',
    handler: async (request: HttpRequest, response: HttpResponse) => {
      response.success({
        version: '1.0.0',
        name: 'TinderMiniApp API',
        description: 'API для мини-приложения знакомств в Telegram'
      });
    }
  }
];
