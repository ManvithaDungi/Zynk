const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testSingleUser() {
  console.log('🧪 Testing single user creation...\n');
  
  try {
    const userData = {
      username: 'John Smith',
      email: 'johnsmith@example.com',
      password: 'password123'
    };
    
    console.log('Creating user:', userData);
    const response = await axios.post(`${BASE_URL}/auth/register`, userData);
    
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('Error details:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message);
    console.log('Full error:', error.response?.data);
  }
}

testSingleUser();
