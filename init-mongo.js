// Инициализация базы данных MongoDB для приложения знакомств

// Переключение на базу данных dating_app
db = db.getSiblingDB('dating_app');

// Создание пользователя для приложения
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'dating_app'
    }
  ]
});

// Создание коллекции пользователей
db.createCollection('users');

// Создание индексов для коллекции пользователей
db.users.createIndex({ "id": 1 }, { unique: true });
db.users.createIndex({ "username": 1 });
db.users.createIndex({ "gender": 1 });
db.users.createIndex({ "interestsGender": 1 });

// Создание коллекции сессий
db.createCollection('sessions');
db.sessions.createIndex({ "id": 1 }, { unique: true });
db.sessions.createIndex({ "userId": 1 });

// Создание коллекции совпадений (matches)
db.createCollection('matches');
db.matches.createIndex({ "userId": 1 });
db.matches.createIndex({ "targetUserId": 1 });
db.matches.createIndex({ "userId": 1, "targetUserId": 1 }, { unique: true });

// Создание коллекции сообщений
db.createCollection('messages');
db.messages.createIndex({ "matchId": 1 });
db.messages.createIndex({ "senderId": 1 });
db.messages.createIndex({ "createdAt": 1 });

// Создание коллекции платежей
db.createCollection('payments');
db.payments.createIndex({ "userId": 1 });
db.payments.createIndex({ "transactionId": 1 }, { unique: true });
db.payments.createIndex({ "createdAt": 1 });

// Вставка тестового пользователя
db.users.insertOne({
  id: 123456789,
  firstName: "Test",
  lastName: "User",
  username: "testuser",
  languageCode: "ru",
  gender: "male",
  interestsGender: "female",
  ageRange: "18-25",
  photo: "/image/test-photo.jpg",
  restScores: 30
});

print('База данных dating_app успешно инициализирована!');
print('Создан пользователь app_user с правами readWrite');
print('Созданы коллекции: users, sessions, matches, messages, payments');
print('Добавлены необходимые индексы');
print('Вставлен тестовый пользователь');
