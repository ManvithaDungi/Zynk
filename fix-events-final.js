const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function fixEventsFinal() {
  try {
    console.log('🔧 Final fix for events...\n');
    
    // Login to get authentication token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test3626@example.com',
      password: 'pass3626'
    });
    
    const authToken = loginResponse.data.token;
    const currentUser = loginResponse.data.user;
    console.log(`✅ Logged in as: ${currentUser.name} (ID: ${currentUser.id})`);
    
    // Create new working events using the correct route
    console.log('\n2. Creating new working events...');
    
    const newEvents = [
      {
        title: 'Tech Conference 2024',
        description: 'Join us for the biggest technology conference of the year! Learn about the latest trends in AI, blockchain, and web development. Network with industry leaders and discover new opportunities.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        time: '09:00',
        location: 'Convention Center, Downtown',
        category: 'Technology',
        maxAttendees: 500
      },
      {
        title: 'Summer Music Festival',
        description: 'A day filled with amazing music, food trucks, and great vibes. Featuring local and international artists. Bring your friends and family for an unforgettable experience!',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        time: '12:00',
        location: 'Central Park',
        category: 'Music',
        maxAttendees: 1000
      },
      {
        title: 'Food & Wine Tasting',
        description: 'Experience the finest local cuisine and wines. Perfect for food enthusiasts and wine lovers. Sample dishes from top restaurants and wines from local vineyards.',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        time: '18:00',
        location: 'Grand Hotel Ballroom',
        category: 'Food & Drink',
        maxAttendees: 100
      },
      {
        title: 'Art Gallery Opening',
        description: 'Come celebrate the opening of our new contemporary art exhibition featuring works from emerging artists. Free admission and refreshments provided.',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        time: '19:00',
        location: 'Modern Art Gallery',
        category: 'Art & Culture',
        maxAttendees: 150
      },
      {
        title: 'Basketball Tournament',
        description: 'Annual community basketball tournament. Teams of all skill levels welcome! Prizes for winners and lots of fun for everyone.',
        date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        time: '08:00',
        location: 'Community Sports Center',
        category: 'Sports',
        maxAttendees: 200
      }
    ];
    
    const createdEvents = [];
    
    for (let i = 0; i < newEvents.length; i++) {
      const eventData = newEvents[i];
      console.log(`📝 Creating event ${i + 1}: ${eventData.title}`);
      
      try {
        const response = await axios.post(`${BASE_URL}/events/create`, eventData, {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        createdEvents.push(response.data.event);
        console.log(`✅ Created: ${response.data.event.title}`);
        console.log(`   ID: ${response.data.event.id}`);
        console.log(`   Date: ${new Date(response.data.event.date).toDateString()}`);
        console.log(`   Organizer: ${response.data.event.organizer?.name || 'Unknown'}`);
        console.log('');
        
        // Test the new event immediately
        console.log(`🔍 Testing new event details...`);
        const testResponse = await axios.get(`${BASE_URL}/events/${response.data.event.id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log(`✅ Event details working: ${testResponse.data.event.title}`);
        console.log(`   Organizer: ${testResponse.data.event.organizer?.name || 'Unknown'}`);
        console.log(`   Description: ${testResponse.data.event.description.substring(0, 50)}...`);
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
    
    console.log(`🎉 Successfully created ${createdEvents.length} working events!`);
    
    if (createdEvents.length > 0) {
      console.log('\n📋 Working events you can now view:');
      createdEvents.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.title}`);
        console.log(`      Date: ${new Date(event.date).toDateString()}`);
        console.log(`      Time: ${event.time}`);
        console.log(`      Location: ${event.location}`);
        console.log(`      ID: ${event.id}`);
        console.log(`      Organizer: ${event.organizer?.name || 'Unknown'}`);
        console.log('');
      });
      
      console.log('💡 You can now view these event details in your application!');
      console.log('🔗 Try navigating to any of these events to test the functionality');
      
      // Final test - get all events
      console.log('\n3. Final test - getting all events...');
      try {
        const allEventsResponse = await axios.get(`${BASE_URL}/events`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        const allEvents = allEventsResponse.data.events || [];
        console.log(`📅 Total events in database: ${allEvents.length}`);
        
        // Test a few event details
        let workingEvents = 0;
        for (let i = 0; i < Math.min(3, allEvents.length); i++) {
          const event = allEvents[i];
          try {
            const detailResponse = await axios.get(`${BASE_URL}/events/${event.id}`, {
              headers: { Authorization: `Bearer ${authToken}` }
            });
            workingEvents++;
            console.log(`✅ Event "${event.title}" details working`);
          } catch (error) {
            console.log(`❌ Event "${event.title}" details broken: ${error.response?.data?.message}`);
          }
        }
        
        console.log(`\n📊 Summary: ${workingEvents} out of ${Math.min(3, allEvents.length)} tested events are working`);
        
      } catch (error) {
        console.log('❌ Failed to get all events:', error.response?.data?.message || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

fixEventsFinal();
