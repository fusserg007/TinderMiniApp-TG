import { HttpRequest } from './http-request';
import { HttpResponse } from './http-response';
import { User } from '../../../domain/user';

/**
 * Тип для middleware функций
 */
export type RequestMiddleware = (
  request: HttpRequest,
  response: HttpResponse,
  user: User | null
) => Promise<void>;
