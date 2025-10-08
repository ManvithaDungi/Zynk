const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAllRoutes() {
  try {
    console.log('🔍 Testing all API routes...\n');
    
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Health check passed:', healthResponse.data.status);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
      return;
    }
    
    // Test 2: Authentication
    console.log('\n2. Testing authentication...');
    let authToken;
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'test1759941357349@example.com',
        password: 'pass123'
      });
      authToken = loginResponse.data.token;
      console.log('✅ Login successful');
      console.log(`👤 User: ${loginResponse.data.user.name}`);
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data?.message || error.message);
      return;
    }
    
    // Test 3: Get all events
    console.log('\n3. Testing get all events...');
    try {
      const eventsResponse = await axios.get(`${BASE_URL}/events`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const events = eventsResponse.data.events || [];
      console.log(`✅ Found ${events.length} events`);
      
      if (events.length > 0) {
        console.log('📋 Events list:');
        events.forEach((event, index) => {
          console.log(`   ${index + 1}. ${event.title} (ID: ${event.id})`);
        });
        
        // Test 4: Get specific event details
        console.log('\n4. Testing get event details...');
        const firstEvent = events[0];
        console.log(`🔍 Testing event details for: ${firstEvent.title} (ID: ${firstEvent.id})`);
        
        try {
          const eventDetailResponse = await axios.get(`${BASE_URL}/events/${firstEvent.id}`, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          
          const eventDetail = eventDetailResponse.data.event;
          console.log('✅ Event details retrieved successfully!');
          console.log('📋 Event details:');
          console.log(`   Title: ${eventDetail.title}`);
          console.log(`   Description: ${eventDetail.description}`);
          console.log(`   Date: ${eventDetail.date}`);
          console.log(`   Time: ${eventDetail.time}`);
          console.log(`   Location: ${eventDetail.location}`);
          console.log(`   Max Attendees: ${eventDetail.maxAttendees}`);
          console.log(`   Organizer: ${eventDetail.organizer?.name || 'Unknown'}`);
          console.log(`   Status: ${eventDetail.status}`);
          console.log(`   Is Registered: ${eventDetail.isRegistered}`);
          console.log(`   Is Host: ${eventDetail.isHost}`);
          
        } catch (error) {
          console.log('❌ Event details failed:', error.response?.status, error.response?.data?.message || error.message);
          if (error.response?.data) {
            console.log('📄 Full error response:', error.response.data);
          }
        }
        
        // Test 5: Test with different event IDs
        if (events.length > 1) {
          console.log('\n5. Testing with different event IDs...');
          for (let i = 1; i < Math.min(3, events.length); i++) {
            const event = events[i];
            console.log(`🔍 Testing event ${i + 1}: ${event.title} (ID: ${event.id})`);
            
            try {
              const response = await axios.get(`${BASE_URL}/events/${event.id}`, {
                headers: { Authorization: `Bearer ${authToken}` }
              });
              console.log(`✅ Event ${i + 1} details retrieved successfully`);
            } catch (error) {
              console.log(`❌ Event ${i + 1} failed:`, error.response?.status, error.response?.data?.message || error.message);
            }
          }
        }
        
      } else {
        console.log('❌ No events found to test details');
      }
      
    } catch (error) {
      console.log('❌ Get events failed:', error.response?.status, error.response?.data?.message || error.message);
      if (error.response?.data) {
        console.log('📄 Full error response:', error.response.data);
      }
    }
    
    // Test 6: Test protected routes
    console.log('\n6. Testing protected routes...');
    try {
      const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Protected route (auth/me) works');
      console.log(`👤 Current user: ${meResponse.data.user.name}`);
    } catch (error) {
      console.log('❌ Protected route failed:', error.response?.data?.message || error.message);
    }
    
    // Test 7: Test without authentication
    console.log('\n7. Testing without authentication...');
    try {
      const response = await axios.get(`${BASE_URL}/events`);
      console.log('⚠️ Events accessible without auth (this might be intentional)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Events properly protected (401 Unauthorized)');
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }
    
    // Test 8: Test invalid event ID
    console.log('\n8. Testing invalid event ID...');
    try {
      const response = await axios.get(`${BASE_URL}/events/invalid-id`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('⚠️ Invalid ID returned data (unexpected)');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid ID properly rejected (400 Bad Request)');
      } else if (error.response?.status === 404) {
        console.log('✅ Invalid ID properly rejected (404 Not Found)');
      } else {
        console.log('❌ Unexpected error for invalid ID:', error.response?.data?.message || error.message);
      }
    }
    
    console.log('\n🎉 Route testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAllRoutes();
