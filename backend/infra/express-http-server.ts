import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import { HttpServer } from './entities/http-server';
import { HttpRoute } from '../adapter/rest-api/entities/http-route';
import { HttpRequest } from '../adapter/rest-api/entities/http-request';
import { HttpResponse } from '../adapter/rest-api/entities/http-response';
import { ValidationError } from '../app/errors/validation-error';
import { ServiceError } from '../app/errors/service-error';
import { AuthService } from '../app/auth';

/**
 * Express.js реализация HTTP сервера
 */
export class ExpressHttpServer implements HttpServer {
  private app: Express;
  private authService: AuthService;

  constructor(private routes: HttpRoute[]) {
    this.app = express();
    this.authService = new AuthService();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Настройка middleware
   */
  private setupMiddleware(): void {
    // CORS
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'https://your-telegram-mini-app.com',
      credentials: true
    }));

    // Парсинг JSON
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Логирование запросов
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
      next();
    });

    // Сессии
    this.app.use(session({
      secret: process.env.SESSION_SECRET || 'your-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 дней
      }
    }));
  }

  /**
   * Настройка маршрутов
   */
  private setupRoutes(): void {
    // Статические файлы для изображений
    this.app.use('/image', express.static('uploads'));

    // API маршруты
    for (const route of this.routes) {
      const handler = async (req: Request, res: Response, next: NextFunction) => {
        try {
          // Создаем объекты запроса и ответа
          const httpRequest = new HttpRequest(
            route.method === 'GET' ? req.query : req.body,
            req.query,
            req.get('User-Agent') || '',
            req.ip || req.connection.remoteAddress || ''
          );

          const httpResponse = new HttpResponse();

          // Получаем пользователя из сессии (если требуется аутентификация)
          let user = null;
          if (req.session && (req.session as any).userId) {
            user = await this.authService.getUserBySession((req.session as any).sessionId);
          }

          // Выполняем middleware (если есть)
          if (route.before) {
            for (const middleware of route.before) {
              await middleware(httpRequest, httpResponse, user);
            }
          }

          // Выполняем основной обработчик
          await route.handler(httpRequest, httpResponse, user);

          // Отправляем ответ
          res.status(httpResponse.statusCode).json(httpResponse.body);
        } catch (error) {
          next(error);
        }
      };

      // Регистрируем маршрут
      if (route.method === 'GET') {
        this.app.get(route.path, handler);
      } else if (route.method === 'POST') {
        this.app.post(route.path, handler);
      }
    }

    // Обработка 404
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        error: 'Маршрут не найден',
        path: req.originalUrl
      });
    });
  }

  /**
   * Настройка обработки ошибок
   */
  private setupErrorHandling(): void {
    this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Ошибка сервера:', error);

      if (error instanceof ValidationError) {
        return res.status(error.statusCode).json({
          error: error.message,
          field: error.field,
          code: error.code
        });
      }

      if (error instanceof ServiceError) {
        return res.status(error.statusCode).json({
          error: error.message,
          code: error.code
        });
      }

      // Общая ошибка сервера
      res.status(500).json({
        error: 'Внутренняя ошибка сервера',
        code: 'INTERNAL_SERVER_ERROR'
      });
    });
  }

  /**
   * Запуск сервера
   */
  async listen(port: number): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(port, () => {
        console.log(`🚀 HTTP сервер запущен на порту ${port}`);
        resolve();
      });
    });
  }
}
