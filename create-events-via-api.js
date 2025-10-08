const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function createEventsViaAPI() {
  try {
    console.log('🔍 Creating events via API...\n');
    
    // First, login to get a token
    console.log('1. Logging in to get authentication token...');
    const loginData = {
      email: 'test1759941357349@example.com',
      password: 'pass123'
    };
    
    let authToken;
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
      authToken = loginResponse.data.token;
      console.log('✅ Login successful');
      console.log(`👤 Logged in as: ${loginResponse.data.user.name}`);
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data?.message || error.message);
      console.log('💡 Creating a new user first...');
      
      // Try to register a new user
      const registerData = {
        name: 'Event Creator',
        email: 'eventcreator@example.com',
        password: 'pass123'
      };
      
      try {
        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
        authToken = registerResponse.data.token;
        console.log('✅ Registration successful');
        console.log(`👤 Registered as: ${registerResponse.data.user.name}`);
      } catch (registerError) {
        console.log('❌ Registration failed:', registerError.response?.data?.message || registerError.message);
        return;
      }
    }
    
    // Check existing events
    console.log('\n2. Checking existing events...');
    try {
      const eventsResponse = await axios.get(`${BASE_URL}/events`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      const existingEvents = eventsResponse.data.events || [];
      console.log(`📅 Found ${existingEvents.length} existing events`);
      
      if (existingEvents.length > 0) {
        console.log('📋 Existing events:');
        existingEvents.forEach((event, index) => {
          console.log(`   ${index + 1}. ${event.title} - ${event.date}`);
        });
        console.log('\n💡 Events already exist, skipping creation');
        return;
      }
    } catch (error) {
      console.log('⚠️ Could not fetch existing events:', error.response?.data?.message || error.message);
    }
    
    // Create sample events
    console.log('\n3. Creating sample events...');
    
    const sampleEvents = [
      {
        title: 'Tech Conference 2024',
        description: 'Join us for the biggest technology conference of the year! Learn about the latest trends in AI, blockchain, and web development. Network with industry leaders and discover new opportunities.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        time: '09:00',
        location: 'Convention Center, Downtown',
        category: 'Technology',
        maxAttendees: 500
      },
      {
        title: 'Summer Music Festival',
        description: 'A day filled with amazing music, food trucks, and great vibes. Featuring local and international artists. Bring your friends and family for an unforgettable experience!',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        time: '12:00',
        location: 'Central Park',
        category: 'Music',
        maxAttendees: 1000
      },
      {
        title: 'Food & Wine Tasting',
        description: 'Experience the finest local cuisine and wines. Perfect for food enthusiasts and wine lovers. Sample dishes from top restaurants and wines from local vineyards.',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
        time: '18:00',
        location: 'Grand Hotel Ballroom',
        category: 'Food & Drink',
        maxAttendees: 100
      },
      {
        title: 'Art Gallery Opening',
        description: 'Come celebrate the opening of our new contemporary art exhibition featuring works from emerging artists. Free admission and refreshments provided.',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
        time: '19:00',
        location: 'Modern Art Gallery',
        category: 'Art & Culture',
        maxAttendees: 150
      },
      {
        title: 'Basketball Tournament',
        description: 'Annual community basketball tournament. Teams of all skill levels welcome! Prizes for winners and lots of fun for everyone.',
        date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(), // 28 days from now
        time: '08:00',
        location: 'Community Sports Center',
        category: 'Sports',
        maxAttendees: 200
      }
    ];
    
    const createdEvents = [];
    
    for (let i = 0; i < sampleEvents.length; i++) {
      const eventData = sampleEvents[i];
      console.log(`📝 Creating event ${i + 1}/${sampleEvents.length}: ${eventData.title}`);
      
      try {
        const response = await axios.post(`${BASE_URL}/events`, eventData, {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        createdEvents.push(response.data.event);
        console.log(`✅ Created: ${response.data.event.title}`);
        console.log(`   ID: ${response.data.event.id}`);
        console.log(`   Date: ${new Date(response.data.event.date).toDateString()}`);
        console.log('');
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`❌ Failed to create event: ${eventData.title}`);
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
        if (error.response?.data?.errors) {
          console.log(`   Validation errors:`, error.response.data.errors);
        }
        console.log('');
      }
    }
    
    console.log(`🎉 Successfully created ${createdEvents.length} events!`);
    
    if (createdEvents.length > 0) {
      console.log('\n📋 Created events:');
      createdEvents.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.title}`);
        console.log(`      Date: ${new Date(event.date).toDateString()}`);
        console.log(`      Time: ${event.time}`);
        console.log(`      Location: ${event.location}`);
        console.log(`      Max Attendees: ${event.maxAttendees}`);
        console.log('');
      });
      
      console.log('💡 You can now view these events in your application!');
      console.log('🔗 Try navigating to an event detail page to test the functionality');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

createEventsViaAPI();
