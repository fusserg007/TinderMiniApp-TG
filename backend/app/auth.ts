import crypto from 'crypto';
import { User } from '../domain/user';
import { Session } from '../domain/session';
import { di } from './di';
import { ServiceError } from './errors/service-error';

/**
 * Сервис аутентификации пользователей через Telegram
 */
export class AuthService {
  private readonly BOT_TOKEN = process.env.BOT_TOKEN || '';

  /**
   * Проверяет валидность данных инициализации Telegram
   */
  validateInitData(initData: string): boolean {
    if (!this.BOT_TOKEN) {
      throw new ServiceError('BOT_TOKEN не настроен');
    }

    try {
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get('hash');
      
      if (!hash) {
        return false;
      }

      urlParams.delete('hash');
      
      // Сортируем параметры и создаем строку для проверки
      const dataCheckString = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      // Создаем секретный ключ
      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(this.BOT_TOKEN)
        .digest();

      // Вычисляем хеш
      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      return calculatedHash === hash;
    } catch (error) {
      console.error('Ошибка при валидации initData:', error);
      return false;
    }
  }

  /**
   * Извлекает данные пользователя из initData
   */
  parseUserFromInitData(initData: string): Partial<User> {
    try {
      const urlParams = new URLSearchParams(initData);
      const userParam = urlParams.get('user');
      
      if (!userParam) {
        throw new ServiceError('Параметр user не найден в initData');
      }

      const userData = JSON.parse(decodeURIComponent(userParam));
      
      return {
        id: userData.id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        username: userData.username,
        languageCode: userData.language_code || 'ru'
      };
    } catch (error) {
      throw new ServiceError('Не удалось распарсить данные пользователя');
    }
  }

  /**
   * Создает или обновляет пользователя в базе данных
   */
  async createOrUpdateUser(userData: Partial<User>): Promise<User> {
    const mongoStore = di.getMongoStore();
    const usersCollection = mongoStore.users;

    if (!userData.id) {
      throw new ServiceError('ID пользователя обязателен');
    }

    // Проверяем, существует ли пользователь
    const existingUser = await usersCollection.findOne({ id: userData.id });
    
    if (existingUser) {
      // Обновляем существующего пользователя
      const updatedUser = {
        ...existingUser,
        ...userData,
        updatedAt: new Date()
      };
      
      await usersCollection.updateOne(
        { id: userData.id },
        { $set: updatedUser }
      );
      
      return updatedUser as User;
    } else {
      // Создаем нового пользователя
      const newUser: User = {
        id: userData.id,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        username: userData.username || '',
        languageCode: userData.languageCode || 'ru',
        gender: 'not_specified',
        interestsGender: 'not_specified',
        ageRange: 'not_specified',
        photo: '',
        restScores: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await usersCollection.insertOne(newUser);
      return newUser;
    }
  }

  /**
   * Создает новую сессию для пользователя
   */
  async createSession(userId: number): Promise<Session> {
    const mongoStore = di.getMongoStore();
    const sessionsCollection = mongoStore.sessions;

    // Генерируем уникальный ID сессии
    const sessionId = crypto.randomBytes(32).toString('hex');
    
    const session: Session = {
      id: sessionId,
      userId: userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 дней
    };

    await sessionsCollection.insertOne(session);
    return session;
  }

  /**
   * Получает сессию по ID
   */
  async getSession(sessionId: string): Promise<Session | null> {
    const mongoStore = di.getMongoStore();
    const sessionsCollection = mongoStore.sessions;

    const session = await sessionsCollection.findOne({ id: sessionId });
    
    if (!session) {
      return null;
    }

    // Проверяем, не истекла ли сессия
    if (session.expiresAt && session.expiresAt < new Date()) {
      await sessionsCollection.deleteOne({ id: sessionId });
      return null;
    }

    return session;
  }

  /**
   * Получает пользователя по сессии
   */
  async getUserBySession(sessionId: string): Promise<User | null> {
    const session = await this.getSession(sessionId);
    
    if (!session) {
      return null;
    }

    const mongoStore = di.getMongoStore();
    const usersCollection = mongoStore.users;
    
    return await usersCollection.findOne({ id: session.userId });
  }
}
