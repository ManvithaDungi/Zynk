const axios = require('axios');

async function simpleTest() {
  try {
    console.log('🔍 Simple authentication test...\n');
    
    // Test registration with minimal data
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'pass123'
    };
    
    console.log('Testing registration with:', testUser);
    
    const response = await axios.post('http://localhost:5000/api/auth/register', testUser, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Registration successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Registration failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Error:', error.response?.data?.error);
    console.error('Full response:', error.response?.data);
  }
}

simpleTest();
