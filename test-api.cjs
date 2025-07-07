const fetch = require('node-fetch');

// Тестовые данные для проверки API
const testInitData = 'user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22testuser%22%2C%22language_code%22%3A%22ru%22%7D&hash=test_hash';

async function testGetUser() {
  try {
    console.log('🧪 Тестирование API /api/get-user...');
    
    const response = await fetch('http://localhost:4000/api/get-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        initData: testInitData
      })
    });

    const data = await response.json();
    
    console.log('📊 Статус ответа:', response.status);
    console.log('📄 Данные ответа:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Тест прошел успешно!');
    } else {
      console.log('❌ Тест не прошел');
    }
    
  } catch (error) {
    console.error('💥 Ошибка при тестировании:', error.message);
  }
}

// Запуск теста
testGetUser();
