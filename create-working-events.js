const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function createWorkingEvents() {
  try {
    console.log('🚀 Creating multiple working events...\n');
    
    // Login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test1759941357349@example.com',
      password: 'pass123'
    });
    
    const authToken = loginResponse.data.token;
    console.log(`✅ Logged in as: ${loginResponse.data.user.name}`);
    
    // Create multiple working events
    const events = [
      {
        title: 'Tech Conference 2024',
        description: 'Join us for the biggest technology conference of the year! Learn about AI, blockchain, and web development.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        time: '09:00',
        location: 'Convention Center',
        category: 'Technology',
        maxAttendees: 500
      },
      {
        title: 'Summer Music Festival',
        description: 'A day filled with amazing music, food trucks, and great vibes. Featuring local and international artists.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        time: '12:00',
        location: 'Central Park',
        category: 'Music',
        maxAttendees: 1000
      },
      {
        title: 'Food & Wine Tasting',
        description: 'Experience the finest local cuisine and wines. Perfect for food enthusiasts and wine lovers.',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        time: '18:00',
        location: 'Grand Hotel Ballroom',
        category: 'Food & Drink',
        maxAttendees: 100
      },
      {
        title: 'Art Gallery Opening',
        description: 'Come celebrate the opening of our new contemporary art exhibition featuring works from emerging artists.',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        time: '19:00',
        location: 'Modern Art Gallery',
        category: 'Art & Culture',
        maxAttendees: 150
      },
      {
        title: 'Basketball Tournament',
        description: 'Annual community basketball tournament. Teams of all skill levels welcome!',
        date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        time: '08:00',
        location: 'Community Sports Center',
        category: 'Sports',
        maxAttendees: 200
      }
    ];
    
    const workingEvents = [];
    
    for (let i = 0; i < events.length; i++) {
      const eventData = events[i];
      console.log(`\n📝 Creating event ${i + 1}: ${eventData.title}`);
      
      try {
        const response = await axios.post(`${BASE_URL}/events/create`, eventData, {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        workingEvents.push(response.data.event);
        console.log(`✅ Created: ${response.data.event.title}`);
        console.log(`   ID: ${response.data.event.id}`);
        console.log(`   Date: ${new Date(response.data.event.date).toDateString()}`);
        
        // Test the event details immediately
        const detailResponse = await axios.get(`${BASE_URL}/events/${response.data.event.id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log(`✅ Event details working: ${detailResponse.data.event.title}`);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`❌ Failed: ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log(`\n🎉 Created ${workingEvents.length} working events!`);
    
    if (workingEvents.length > 0) {
      console.log('\n📋 WORKING EVENTS YOU CAN VIEW:');
      workingEvents.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.title}`);
        console.log(`      ID: ${event.id}`);
        console.log(`      Date: ${new Date(event.date).toDateString()}`);
        console.log(`      Time: ${event.time}`);
        console.log(`      Location: ${event.location}`);
        console.log('');
      });
      
      console.log('💡 These events will work perfectly in your frontend!');
      console.log('🔗 Try navigating to any of these event IDs in your application');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createWorkingEvents();
