const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Create axios instance with cookie support
const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true
});

async function testAPIWithSampleUser() {
  console.log('🔐 Testing API with sample user...');
  
  try {
    // Login with the sample user we created
    console.log('🔐 Logging in with sample user...');
    const loginResponse = await apiClient.post('/auth/login', {
      email: 'sampleuser@example.com',
      password: 'sample123'
    });
    
    console.log('✅ Login successful');
    
    // Test getting events
    console.log('📅 Testing events API...');
    const eventsResponse = await apiClient.get('/events');
    console.log(`✅ Found ${eventsResponse.data.events.length} events`);
    
    // Test getting albums
    console.log('📸 Testing albums API...');
    const albumsResponse = await apiClient.get('/albums');
    console.log(`✅ Found ${albumsResponse.data.albums.length} albums`);
    
    // Test getting posts
    console.log('💭 Testing posts API...');
    const postsResponse = await apiClient.get('/posts');
    console.log(`✅ Found ${postsResponse.data.posts.length} posts`);
    
    console.log('🎉 All API tests passed! The sample data is working correctly.');

  } catch (error) {
    console.error('❌ Error testing API:', error.response?.data?.message || error.message);
  }
}

testAPIWithSampleUser();
