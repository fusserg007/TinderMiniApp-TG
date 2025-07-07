import { User } from '../domain/user';
import { Match } from '../domain/match';
import { di } from './di';
import { ServiceError } from './errors/service-error';

/**
 * Сервис для поиска совпадений между пользователями
 */
export class MatcherService {
  /**
   * Получает рекомендации для пользователя
   */
  async getRecommendations(userId: number, limit: number = 10): Promise<User[]> {
    const mongoStore = di.getMongoStore();
    const usersCollection = mongoStore.users;
    const matchesCollection = mongoStore.matches;

    // Получаем текущего пользователя
    const currentUser = await usersCollection.findOne({ id: userId });
    if (!currentUser) {
      throw new ServiceError('Пользователь не найден');
    }

    // Получаем список пользователей, которых уже оценили
    const existingMatches = await matchesCollection
      .find({ userId: userId })
      .toArray();
    
    const excludedUserIds = existingMatches.map(match => match.targetUserId);
    excludedUserIds.push(userId); // Исключаем самого себя

    // Формируем фильтр для поиска
    const filter: any = {
      id: { $nin: excludedUserIds }
    };

    // Фильтруем по полу, если указан интерес
    if (currentUser.interestsGender && currentUser.interestsGender !== 'not_specified') {
      filter.gender = currentUser.interestsGender;
    }

    // Получаем рекомендации
    const recommendations = await usersCollection
      .find(filter)
      .limit(limit)
      .toArray();

    return recommendations;
  }

  /**
   * Создает оценку (лайк/дизлайк)
   */
  async createMatch(userId: number, targetUserId: number, isLike: boolean): Promise<{ isMatch: boolean; match?: Match }> {
    const mongoStore = di.getMongoStore();
    const usersCollection = mongoStore.users;
    const matchesCollection = mongoStore.matches;

    // Проверяем, что пользователи существуют
    const [user, targetUser] = await Promise.all([
      usersCollection.findOne({ id: userId }),
      usersCollection.findOne({ id: targetUserId })
    ]);

    if (!user || !targetUser) {
      throw new ServiceError('Один из пользователей не найден');
    }

    // Проверяем, что оценка еще не была сделана
    const existingMatch = await matchesCollection.findOne({
      userId: userId,
      targetUserId: targetUserId
    });

    if (existingMatch) {
      throw new ServiceError('Оценка уже была сделана');
    }

    // Создаем запись об оценке
    const match: Match = {
      userId: userId,
      targetUserId: targetUserId,
      isLike: isLike,
      createdAt: new Date()
    };

    await matchesCollection.insertOne(match);

    // Если это лайк, проверяем взаимность
    if (isLike) {
      const reciprocalMatch = await matchesCollection.findOne({
        userId: targetUserId,
        targetUserId: userId,
        isLike: true
      });

      if (reciprocalMatch) {
        // Взаимный лайк! Обновляем обе записи
        await matchesCollection.updateMany(
          {
            $or: [
              { userId: userId, targetUserId: targetUserId },
              { userId: targetUserId, targetUserId: userId }
            ]
          },
          {
            $set: {
              isMatch: true,
              matchedAt: new Date()
            }
          }
        );

        return {
          isMatch: true,
          match: {
            ...match,
            isMatch: true,
            matchedAt: new Date()
          }
        };
      }
    }

    return { isMatch: false, match };
  }

  /**
   * Получает список совпадений пользователя
   */
  async getUserMatches(userId: number): Promise<User[]> {
    const mongoStore = di.getMongoStore();
    const usersCollection = mongoStore.users;
    const matchesCollection = mongoStore.matches;

    // Получаем все взаимные лайки
    const matches = await matchesCollection
      .find({
        userId: userId,
        isLike: true,
        isMatch: true
      })
      .toArray();

    // Получаем данные пользователей
    const matchedUserIds = matches.map(match => match.targetUserId);
    const matchedUsers = await usersCollection
      .find({ id: { $in: matchedUserIds } })
      .toArray();

    return matchedUsers;
  }

  /**
   * Проверяет, есть ли совпадение между двумя пользователями
   */
  async checkMatch(userId: number, targetUserId: number): Promise<boolean> {
    const mongoStore = di.getMongoStore();
    const matchesCollection = mongoStore.matches;

    const match = await matchesCollection.findOne({
      $or: [
        { userId: userId, targetUserId: targetUserId, isMatch: true },
        { userId: targetUserId, targetUserId: userId, isMatch: true }
      ]
    });

    return !!match;
  }
}
