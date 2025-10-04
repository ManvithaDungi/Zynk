const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testRateLimit() {
  console.log('🧪 Testing if rate limiter is disabled...\n');
  
  try {
    // Try to register a user
    const userData = {
      username: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    console.log('1. Testing user registration...');
    const response = await axios.post(`${BASE_URL}/auth/register`, userData);
    
    if (response.data.success) {
      console.log('✅ Rate limiter is disabled! User registration successful');
      console.log('Token received:', response.data.token ? 'Yes' : 'No');
    } else {
      console.log('❌ Registration failed:', response.data.message);
    }
    
  } catch (error) {
    if (error.response?.data?.message?.includes('Too many attempts')) {
      console.log('❌ Rate limiter is still active:', error.response.data.message);
    } else if (error.response?.data?.message?.includes('already exists')) {
      console.log('✅ Rate limiter is disabled! (User already exists)');
    } else {
      console.log('❌ Other error:', error.response?.data?.message || error.message);
    }
  }
}

testRateLimit();
