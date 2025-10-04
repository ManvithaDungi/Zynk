const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function createSingleEvent() {
  console.log('🚀 Creating a single test event...\n');
  
  try {
    // First, let's try to register a user with a completely new email
    console.log('👤 Registering a new user...');
    const userData = {
      username: 'Event Creator',
      email: 'creator@test.com',
      password: 'password123'
    };
    
    let userToken = null;
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, userData);
      if (registerResponse.data.success) {
        userToken = registerResponse.data.token;
        console.log('✅ User registered successfully');
      }
    } catch (registerError) {
      console.log('❌ Registration failed:', registerError.response?.data?.message || registerError.message);
      
      // Try login instead
      console.log('🔐 Trying to login...');
      try {
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: userData.email,
          password: userData.password
        });
        if (loginResponse.data.success) {
          userToken = loginResponse.data.token;
          console.log('✅ Login successful');
        }
      } catch (loginError) {
        console.log('❌ Login failed:', loginError.response?.data?.message || loginError.message);
        return;
      }
    }
    
    if (!userToken) {
      console.log('❌ No authentication token available');
      return;
    }
    
    // Create a single event
    console.log('\n📅 Creating test event...');
    const eventData = {
      title: 'Sample Tech Conference',
      description: 'A sample tech conference to test the EventDetail page functionality. This event includes various sessions about web development, AI, and networking opportunities.',
      category: 'Conference',
      date: '2024-12-15',
      time: '09:00',
      location: 'Convention Center, Downtown',
      maxAttendees: 100
    };
    
    try {
      const eventResponse = await axios.post(`${BASE_URL}/events/create`, eventData, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      if (eventResponse.data.success) {
        const event = eventResponse.data.event;
        console.log('✅ Event created successfully!');
        console.log(`📋 Event ID: ${event.id}`);
        console.log(`📋 Event Title: ${event.title}`);
        console.log(`📋 Event Date: ${event.date}`);
        console.log(`📋 Event Location: ${event.location}`);
        
        // Test the event detail endpoint
        console.log('\n🧪 Testing event detail endpoint...');
        try {
          const detailResponse = await axios.get(`${BASE_URL}/events/${event.id}`);
          if (detailResponse.data.success) {
            console.log('✅ Event detail endpoint working!');
            console.log(`📋 Event found: ${detailResponse.data.event.title}`);
          }
        } catch (detailError) {
          console.log('❌ Event detail endpoint failed:', detailError.response?.data?.message || detailError.message);
        }
        
        console.log('\n🎉 Sample event created successfully!');
        console.log('\n🔑 Test Credentials:');
        console.log('Email: creator@test.com');
        console.log('Password: password123');
        console.log(`\n🔗 Event URL: /event-detail/${event.id}`);
        console.log('\n✅ You can now test the EventDetail page!');
        
      } else {
        console.log('❌ Event creation failed:', eventResponse.data.message);
      }
      
    } catch (eventError) {
      console.log('❌ Event creation error:', eventError.response?.data?.message || eventError.message);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

createSingleEvent();
