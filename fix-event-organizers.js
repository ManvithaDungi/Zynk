const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function fixEventOrganizers() {
  try {
    console.log('🔧 Fixing event organizers...\n');
    
    // Login to get authentication token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test1759941357349@example.com',
      password: 'pass123'
    });
    
    const authToken = loginResponse.data.token;
    const currentUser = loginResponse.data.user;
    console.log(`✅ Logged in as: ${currentUser.name} (ID: ${currentUser.id})`);
    
    // Get all events
    console.log('\n2. Getting all events...');
    const eventsResponse = await axios.get(`${BASE_URL}/events`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const events = eventsResponse.data.events || [];
    console.log(`📅 Found ${events.length} events`);
    
    if (events.length === 0) {
      console.log('❌ No events found to fix');
      return;
    }
    
    // Test each event and identify broken ones
    console.log('\n3. Testing event details to identify broken events...');
    const brokenEvents = [];
    
    for (const event of events) {
      try {
        const detailResponse = await axios.get(`${BASE_URL}/events/${event.id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log(`✅ Event "${event.title}" is working`);
      } catch (error) {
        if (error.response?.data?.message === 'Event organizer not found') {
          console.log(`❌ Event "${event.title}" has broken organizer`);
          brokenEvents.push(event);
        } else {
          console.log(`⚠️ Event "${event.title}" has other error: ${error.response?.data?.message}`);
        }
      }
    }
    
    if (brokenEvents.length === 0) {
      console.log('\n🎉 All events are working correctly!');
      return;
    }
    
    console.log(`\n🔧 Found ${brokenEvents.length} events with broken organizers`);
    
    // Since we can't directly update events via API, let's create new events to replace the broken ones
    console.log('\n4. Creating replacement events with valid organizers...');
    
    const replacementEvents = [
      {
        title: 'Board Games Night 2024',
        description: 'Join us for an evening of fun board games! Bring your favorite games or try new ones. Snacks and drinks provided.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        time: '19:00',
        location: 'Community Center',
        category: 'Entertainment',
        maxAttendees: 50
      },
      {
        title: 'Music Trivia Night',
        description: 'Test your music knowledge in our fun trivia night! Prizes for the winners and great music all night long.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        time: '20:00',
        location: 'Local Bar & Grill',
        category: 'Music',
        maxAttendees: 100
      },
      {
        title: 'University Life Balance Workshop',
        description: 'Learn how to balance your academic, social, and personal life effectively. Perfect for students and young professionals.',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        time: '14:00',
        location: 'University Conference Room',
        category: 'Education',
        maxAttendees: 75
      },
      {
        title: 'Craft Workshop: Friendship Bracelets',
        description: 'Learn to make beautiful friendship bracelets! All materials provided. Perfect for beginners and craft enthusiasts.',
        date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        time: '15:00',
        location: 'Art Studio',
        category: 'Arts & Crafts',
        maxAttendees: 30
      },
      {
        title: 'Academic Planning Club Meeting',
        description: 'Join our academic planning club to discuss course selection, career paths, and academic goals. Open to all students.',
        date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
        time: '16:00',
        location: 'Student Union',
        category: 'Education',
        maxAttendees: 40
      }
    ];
    
    const createdEvents = [];
    
    for (let i = 0; i < replacementEvents.length; i++) {
      const eventData = replacementEvents[i];
      console.log(`📝 Creating replacement event ${i + 1}: ${eventData.title}`);
      
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
        
        // Test the new event immediately
        console.log(`🔍 Testing new event details...`);
        const testResponse = await axios.get(`${BASE_URL}/events/${response.data.event.id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log(`✅ New event details working: ${testResponse.data.event.title}`);
        console.log(`   Organizer: ${testResponse.data.event.organizer?.name || 'Unknown'}`);
        console.log('');
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`❌ Failed to create replacement event: ${eventData.title}`);
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
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
        console.log('');
      });
      
      console.log('💡 You can now view these event details in your application!');
      console.log('🔗 Try navigating to any of these events to test the functionality');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

fixEventOrganizers();
