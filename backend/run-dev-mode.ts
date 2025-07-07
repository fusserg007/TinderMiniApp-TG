import { MongoStore } from './infra/mongo-store';
import { ObjectStorage } from './infra/object-storage';
import { TgBotApi } from './infra/tg-bot-api';
import { ExpressHttpServer } from './infra/express-http-server';
import { restApiRoutes } from './adapter/rest-api';
import { di } from './app/di';

const PORT = Number(process.env.PORT) || 4000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://root:example@localhost:27017/dating_app?authSource=admin';
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const MINIO_PORT = Number(process.env.MINIO_PORT) || 9000;
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin';
const MINIO_BUCKET = process.env.MINIO_BUCKET || 'photos';
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const WEBHOOK_URL = process.env.WEBHOOK_URL || '';

async function main() {
  console.log('🚀 Запуск приложения в режиме разработки...');

  // Инициализация MongoDB
  const mongoStore = new MongoStore(MONGO_URL);
  await mongoStore.connect();
  console.log('✅ MongoDB подключена');

  // Инициализация объектного хранилища
  const objectStorage = new ObjectStorage({
    endPoint: MINIO_ENDPOINT,
    port: MINIO_PORT,
    useSSL: false,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
    bucket: MINIO_BUCKET
  });
  console.log('✅ Object Storage инициализировано');

  // Инициализация Telegram Bot API
  const tgBotApi = new TgBotApi(BOT_TOKEN);
  console.log('✅ Telegram Bot API инициализировано');

  // Настройка вебхука (если указан)
  if (WEBHOOK_URL) {
    try {
      await tgBotApi.setWebhook(WEBHOOK_URL);
      console.log('✅ Вебхук установлен:', WEBHOOK_URL);
    } catch (error) {
      console.warn('⚠️ Не удалось установить вебхук:', error);
    }
  }

  // Регистрация зависимостей
  di.register('mongoStore', mongoStore);
  di.register('objectStorage', objectStorage);
  di.register('tgBotApi', tgBotApi);

  // Инициализация HTTP сервера
  const httpServer = new ExpressHttpServer(restApiRoutes);
  
  // Запуск сервера
  await httpServer.listen(PORT);
  console.log(`🌐 HTTP сервер запущен на порту ${PORT}`);
  console.log(`📱 API доступно по адресу: http://localhost:${PORT}`);
  
  // Обработка завершения процесса
  process.on('SIGINT', async () => {
    console.log('\n🛑 Получен сигнал завершения...');
    await mongoStore.disconnect();
    console.log('✅ MongoDB отключена');
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('💥 Ошибка при запуске приложения:', error);
  process.exit(1);
});
