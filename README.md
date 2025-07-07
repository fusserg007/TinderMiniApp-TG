# TinderMiniApp-TG

Telegram Mini App для знакомств в стиле Tinder с backend на Node.js/TypeScript и frontend на React.

## Описание

Это полнофункциональное приложение для знакомств, интегрированное в Telegram как Mini App. Включает в себя:

- **Backend**: Node.js + TypeScript + Express + MongoDB
- **Frontend**: React + TypeScript + Vite
- **Хранилище файлов**: MinIO (S3-совместимое)
- **Обработка изображений**: imgproxy
- **Контейнеризация**: Docker + Docker Compose

## Функциональность

- 🔐 Авторизация через Telegram
- 📝 Регистрация пользователей с загрузкой фото
- 👥 Просмотр анкет других пользователей
- ❤️ Система лайков/дизлайков
- 🔥 Премиум функции
- 💳 Интеграция платежей
- 📱 Адаптивный дизайн для мобильных устройств

## Структура проекта

```
├── backend/                 # Backend приложение
│   ├── app/                # Бизнес-логика
│   ├── domain/             # Доменные модели
│   ├── infra/              # Инфраструктура
│   └── adapter/            # REST API адаптеры
├── tg-web-app/             # Frontend приложение
├── docker-compose.dev.yml  # Docker Compose для разработки
├── docker-compose.test.yml # Docker Compose для тестирования
└── init-mongo.js           # Инициализация MongoDB
```

## Быстрый старт

1. Клонируйте репозиторий:
```bash
git clone https://github.com/fusserg007/TinderMiniApp-TG.git
cd TinderMiniApp-TG
```

2. Скопируйте файл окружения:
```bash
cp env.example .env
```

3. Настройте переменные окружения в `.env`

4. Запустите приложение:
```bash
npm run dev
```

## Требования

- Node.js 18+
- Docker и Docker Compose
- Telegram Bot Token
- MongoDB (локальный или Atlas)

## Разработка

Для разработки используйте:

```bash
# Запуск только object storage
npm run object-storage

# Запуск всех сервисов
npm run dev

# Получение публичной ссылки для тестирования
npm run public-link
```

## Лицензия

MIT
