const axios = require('axios');

// Simple manual testing script
const BASE_URL = 'http://localhost:5000/api';

async function testRegistration() {
  console.log('Testing Registration...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    });
    console.log('✅ Registration successful:', response.data);
    return response.data.token;
  } catch (error) {
    console.log('❌ Registration failed:');
    console.log('   Error message:', error.message);
    console.log('   Response status:', error.response?.status);
    console.log('   Response data:', error.response?.data);
    console.log('   Full error:', error);
    return null;
  }
}

async function testLogin() {
  console.log('\nTesting Login...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john@example.com',
      password: 'password123'
    });
    console.log('✅ Login successful:', response.data);
    return response.data.token;
  } catch (error) {
    console.log('❌ Login failed:');
    console.log('   Error message:', error.message);
    console.log('   Response status:', error.response?.status);
    console.log('   Response data:', error.response?.data);
    console.log('   Full error:', error);
    return null;
  }
}

async function testProfile(token) {
  console.log('\nTesting Profile...');
  try {
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ Profile retrieved:', response.data);
  } catch (error) {
    console.log('❌ Profile failed:');
    console.log('   Error message:', error.message);
    console.log('   Response status:', error.response?.status);
    console.log('   Response data:', error.response?.data);
    console.log('   Full error:', error);
  }
}

async function testServerConnection() {
  console.log('Testing Server Connection...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Server connection failed:');
    console.log('   Error message:', error.message);
    console.log('   Response status:', error.response?.status);
    console.log('   Response data:', error.response?.data);
    return false;
  }
}

async function runManualTests() {
  console.log('🚀 Manual Authentication Tests\n');
  
  const serverRunning = await testServerConnection();
  if (!serverRunning) {
    console.log('\n❌ Cannot proceed with tests - server is not accessible');
    return;
  }
  
  const token = await testRegistration();
  if (token) {
    await testProfile(token);
  }
  
  const loginToken = await testLogin();
  if (loginToken) {
    await testProfile(loginToken);
  }
  
  console.log('\n🏁 Manual tests completed!');
}

runManualTests().catch(console.error);
