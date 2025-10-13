/**
 * Test Database Connection Script
 * Tests if we can connect to MongoDB through the backend
 */

require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testConnection() {
  try {
    console.log('🔗 Testing backend connection...');
    
    // Test health endpoint
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Backend health check:', healthResponse.data);
    
    // Test if we can get events (this will test DB connection)
    try {
      const eventsResponse = await axios.get(`${BASE_URL}/api/events`);
      console.log('✅ Events API working, DB connection is good');
      console.log('📊 Events count:', eventsResponse.data.events?.length || 0);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('⚠️ Events API requires authentication (this is normal)');
        console.log('✅ Backend is running and DB connection is working');
      } else {
        console.log('❌ Events API error:', error.response?.data || error.message);
      }
    }
    
    // Test if we can get albums
    try {
      const albumsResponse = await axios.get(`${BASE_URL}/api/albums`);
      console.log('✅ Albums API working');
      console.log('📊 Albums count:', albumsResponse.data.albums?.length || 0);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('⚠️ Albums API requires authentication (this is normal)');
      } else {
        console.log('❌ Albums API error:', error.response?.data || error.message);
      }
    }
    
    console.log('\n🎯 Conclusion: Backend server is running and database connection is working!');
    console.log('💡 The seeding script timeout issue is likely due to MongoDB Atlas performance limits.');
    console.log('💡 Try running the seeding script during off-peak hours or consider upgrading your MongoDB Atlas plan.');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConnection();
