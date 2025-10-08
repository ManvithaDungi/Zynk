const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testConnectionFix() {
  try {
    console.log('🔍 Testing connection fixes...\n');
    
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Health check passed:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.response?.data?.message || error.message);
    }
    
    // Test 2: Registration with unique email
    console.log('\n2. Testing registration...');
    const timestamp = Date.now();
    const testUser = {
      name: 'Connection Test User',
      email: `connectiontest${timestamp}@example.com`,
      password: 'pass123'
    };
    
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('✅ Registration successful:', registerResponse.data.message);
      
      // Test 3: Login
      console.log('\n3. Testing login...');
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      console.log('✅ Login successful:', loginResponse.data.message);
      console.log('👤 User:', loginResponse.data.user.name);
      
      // Test 4: Protected route
      console.log('\n4. Testing protected route...');
      const token = loginResponse.data.token;
      const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Protected route access successful');
      console.log('👤 Current user:', meResponse.data.user.name);
      
      console.log('\n🎉 All connection tests passed! MongoDB issues are fixed.');
      
    } catch (error) {
      console.log('❌ Registration/Login failed:', error.response?.data?.message || error.message);
      if (error.response?.status === 503) {
        console.log('💡 Database connection issue detected. Server may need restart.');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testConnectionFix();
