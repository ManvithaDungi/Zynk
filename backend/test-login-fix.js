const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testLogin() {
  try {
    console.log('🧪 Testing Login Fix...\n');

    // Test registration
    console.log('📝 Testing User Registration...');
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
      console.log('✅ Registration successful:', registerResponse.data.message);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️  User already exists, continuing with login test...');
      } else {
        console.log('❌ Registration failed:', error.response?.data?.message || error.message);
      }
    }

    // Test login
    console.log('\n🔐 Testing User Login...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    console.log('✅ Login successful!');
    console.log('📋 User data:', {
      id: loginResponse.data.user._id,
      name: loginResponse.data.user.name,
      email: loginResponse.data.user.email
    });

    // Test protected route
    console.log('\n🔒 Testing Protected Route...');
    const token = loginResponse.data.token;
    const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Protected route access successful!');
    console.log('👤 User profile:', meResponse.data.user.name);

    console.log('\n🎉 All tests passed! Login is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('📋 Error details:', error.response.data);
    }
  }
}

testLogin();
