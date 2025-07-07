/**
 * Модель платежа
 */
export interface Payment {
  id: string;
  userId: number;
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transactionId?: string;
  createdAt: Date;
  completedAt?: Date;
}
