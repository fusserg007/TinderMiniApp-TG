/**
 * Модель сообщения в чате
 */
export interface Message {
  id: string;
  matchId: string;
  senderId: number;
  content: string;
  type: 'text' | 'image' | 'sticker';
  createdAt: Date;
  readAt?: Date;
}
