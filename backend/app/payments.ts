import crypto from 'crypto';
import { Payment } from '../domain/payment';
import { di } from './di';
import { ServiceError } from './errors/service-error';

/**
 * Сервис для работы с платежами
 */
export class PaymentService {
  /**
   * Создание нового платежа
   */
  async createPayment(
    userId: number,
    amount: number,
    currency: string,
    description: string
  ): Promise<Payment> {
    const mongoStore = di.getMongoStore();
    const paymentsCollection = mongoStore.payments;

    const payment: Payment = {
      id: crypto.randomUUID(),
      userId: userId,
      amount: amount,
      currency: currency,
      description: description,
      status: 'pending',
      createdAt: new Date()
    };

    await paymentsCollection.insertOne(payment);
    return payment;
  }

  /**
   * Получение платежей пользователя
   */
  async getUserPayments(
    userId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<Payment[]> {
    const mongoStore = di.getMongoStore();
    const paymentsCollection = mongoStore.payments;

    const skip = (page - 1) * limit;

    return await paymentsCollection
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /**
   * Получение платежа по ID
   */
  async getPayment(paymentId: string): Promise<Payment | null> {
    const mongoStore = di.getMongoStore();
    const paymentsCollection = mongoStore.payments;

    return await paymentsCollection.findOne({ id: paymentId });
  }

  /**
   * Подтверждение платежа
   */
  async verifyPayment(
    paymentId: string,
    transactionId: string
  ): Promise<{ success: boolean; payment?: Payment; addedScores?: number }> {
    const mongoStore = di.getMongoStore();
    const paymentsCollection = mongoStore.payments;
    const usersCollection = mongoStore.users;

    // Получаем платеж
    const payment = await paymentsCollection.findOne({ id: paymentId });
    
    if (!payment) {
      throw new ServiceError('Платеж не найден', 'PAYMENT_NOT_FOUND', 404);
    }

    if (payment.status !== 'pending') {
      throw new ServiceError('Платеж уже обработан', 'PAYMENT_ALREADY_PROCESSED', 400);
    }

    // Обновляем статус платежа
    const updatedPayment: Payment = {
      ...payment,
      status: 'completed',
      transactionId: transactionId,
      completedAt: new Date()
    };

    await paymentsCollection.updateOne(
      { id: paymentId },
      { $set: updatedPayment }
    );

    // Вычисляем количество очков для добавления
    // Например: 1 XTR = 10 очков
    const addedScores = payment.amount * 10;

    // Добавляем очки пользователю
    await usersCollection.updateOne(
      { id: payment.userId },
      { $inc: { restScores: addedScores } }
    );

    return {
      success: true,
      payment: updatedPayment,
      addedScores: addedScores
    };
  }

  /**
   * Отмена платежа
   */
  async cancelPayment(paymentId: string): Promise<Payment> {
    const mongoStore = di.getMongoStore();
    const paymentsCollection = mongoStore.payments;

    const payment = await paymentsCollection.findOne({ id: paymentId });
    
    if (!payment) {
      throw new ServiceError('Платеж не найден', 'PAYMENT_NOT_FOUND', 404);
    }

    if (payment.status !== 'pending') {
      throw new ServiceError('Можно отменить только ожидающие платежи', 'PAYMENT_CANNOT_BE_CANCELLED', 400);
    }

    const updatedPayment: Payment = {
      ...payment,
      status: 'cancelled'
    };

    await paymentsCollection.updateOne(
      { id: paymentId },
      { $set: updatedPayment }
    );

    return updatedPayment;
  }
}
