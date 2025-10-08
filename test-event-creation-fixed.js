const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testEventCreationFixed() {
  try {
    console.log('🔍 Testing event creation with fixed category handling...\n');
    
    // Login to get authentication token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test1759941357349@example.com',
      password: 'pass123'
    });
    
    const authToken = loginResponse.data.token;
    console.log(`✅ Logged in as: ${loginResponse.data.user.name}`);
    
    // Test creating a simple event
    console.log('\n2. Creating test event...');
    const eventData = {
      title: 'Test Event - Fixed Categories',
      description: 'This is a test event to verify that category handling is working correctly.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      time: '18:00',
      location: 'Test Location',
      category: 'Technology',
      maxAttendees: 50
    };
    
    try {
      const response = await axios.post(`${BASE_URL}/events/create`, eventData, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Event created successfully!');
      console.log(`   Title: ${response.data.event.title}`);
      console.log(`   ID: ${response.data.event.id}`);
      console.log(`   Category: ${response.data.event.category}`);
      console.log(`   Date: ${new Date(response.data.event.date).toDateString()}`);
      console.log(`   Organizer: ${response.data.event.organizer?.name || 'Unknown'}`);
      
      // Test the event details
      console.log('\n3. Testing event details...');
      const detailResponse = await axios.get(`${BASE_URL}/events/${response.data.event.id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('✅ Event details retrieved successfully!');
      console.log(`   Title: ${detailResponse.data.event.title}`);
      console.log(`   Description: ${detailResponse.data.event.description}`);
      console.log(`   Organizer: ${detailResponse.data.event.organizer?.name || 'Unknown'}`);
      console.log(`   Status: ${detailResponse.data.event.status}`);
      console.log(`   Is Registered: ${detailResponse.data.event.isRegistered}`);
      console.log(`   Is Host: ${detailResponse.data.event.isHost}`);
      
      console.log('\n🎉 Event creation and details are working correctly!');
      
    } catch (error) {
      console.log('❌ Event creation failed:', error.response?.data?.message || error.message);
      if (error.response?.data?.errors) {
        console.log('Validation errors:', error.response.data.errors);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

testEventCreationFixed();
