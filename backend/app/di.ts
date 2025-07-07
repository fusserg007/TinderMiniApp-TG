import { MongoStore } from '../infra/mongo-store';
import { ObjectStorage } from '../infra/object-storage';
import { TgBotApi } from '../infra/tg-bot-api';

/**
 * Простой контейнер внедрения зависимостей
 */
class DependencyInjection {
  private dependencies = new Map<string, any>();

  register<T>(name: string, instance: T): void {
    this.dependencies.set(name, instance);
  }

  get<T>(name: string): T {
    const dependency = this.dependencies.get(name);
    if (!dependency) {
      throw new Error(`Зависимость '${name}' не найдена`);
    }
    return dependency;
  }

  getMongoStore(): MongoStore {
    return this.get<MongoStore>('mongoStore');
  }

  getObjectStorage(): ObjectStorage {
    return this.get<ObjectStorage>('objectStorage');
  }

  getTgBotApi(): TgBotApi {
    return this.get<TgBotApi>('tgBotApi');
  }
}

export const di = new DependencyInjection();
