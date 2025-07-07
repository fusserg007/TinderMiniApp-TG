import { MongoClient, Db, Collection } from 'mongodb';
import { User } from '../domain/user';
import { Session } from '../domain/session';
import { Match } from '../domain/match';
import { Message } from '../domain/message';
import { Payment } from '../domain/payment';

/**
 * Класс для управления подключением к MongoDB
 */
export class MongoStore {
  private client: MongoClient;
  private db: Db | null = null;

  constructor(private readonly connectionString: string) {
    this.client = new MongoClient(connectionString);
  }

  /**
   * Подключение к базе данных
   */
  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db();
      console.log('✅ Подключение к MongoDB установлено');
    } catch (error) {
      console.error('❌ Ошибка подключения к MongoDB:', error);
      throw error;
    }
  }

  /**
   * Отключение от базы данных
   */
  async disconnect(): Promise<void> {
    try {
      await this.client.close();
      console.log('✅ Подключение к MongoDB закрыто');
    } catch (error) {
      console.error('❌ Ошибка при отключении от MongoDB:', error);
      throw error;
    }
  }

  /**
   * Получение коллекции пользователей
   */
  get users(): Collection<User> {
    if (!this.db) {
      throw new Error('База данных не подключена');
    }
    return this.db.collection<User>('users');
  }

  /**
   * Получение коллекции сессий
   */
  get sessions(): Collection<Session> {
    if (!this.db) {
      throw new Error('База данных не подключена');
    }
    return this.db.collection<Session>('sessions');
  }

  /**
   * Получение коллекции совпадений
   */
  get matches(): Collection<Match> {
    if (!this.db) {
      throw new Error('База данных не подключена');
    }
    return this.db.collection<Match>('matches');
  }

  /**
   * Получение коллекции сообщений
   */
  get messages(): Collection<Message> {
    if (!this.db) {
      throw new Error('База данных не подключена');
    }
    return this.db.collection<Message>('messages');
  }

  /**
   * Получение коллекции платежей
   */
  get payments(): Collection<Payment> {
    if (!this.db) {
      throw new Error('База данных не подключена');
    }
    return this.db.collection<Payment>('payments');
  }
}
