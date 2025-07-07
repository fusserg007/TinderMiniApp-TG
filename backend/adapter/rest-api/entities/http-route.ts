import { HttpRequest } from './http-request';
import { HttpResponse } from './http-response';
import { RequestMiddleware } from './request-middleware';
import { User } from '../../../domain/user';

/**
 * Интерфейс для описания HTTP маршрута
 */
export interface HttpRoute {
  method: 'GET' | 'POST';
  path: string;
  before?: RequestMiddleware[];
  handler: (request: HttpRequest, response: HttpResponse, user: User | null) => Promise<void>;
}
