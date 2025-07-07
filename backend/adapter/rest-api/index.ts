import { HttpRoute } from './entities/http-route';
import { commonRoutes } from './common';
import { authRoutes } from './auth';
import { paymentsRoutes } from './payments';
import { fireRoutes } from './fire';
import { recommendationsRoutes } from './recommendations';
import { webhookRoutes } from './webhook';

/**
 * Все маршруты REST API
 */
export const restApiRoutes: HttpRoute[] = [
  ...commonRoutes,
  ...authRoutes,
  ...paymentsRoutes,
  ...fireRoutes,
  ...recommendationsRoutes,
  ...webhookRoutes
];
