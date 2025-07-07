/**
 * Модель совпадения между пользователями
 */
export interface Match {
  userId: number;
  targetUserId: number;
  isLike: boolean;
  isMatch?: boolean;
  createdAt: Date;
  matchedAt?: Date;
}
