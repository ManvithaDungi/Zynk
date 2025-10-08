const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';

async function seedEventsFromImages() {
  try {
    console.log('🎯 Seeding events from images and info.txt...\n');
    
    // Read the info.txt file
    const infoPath = path.join(__dirname, 'frontend/public/images/info.txt');
    const infoContent = fs.readFileSync(infoPath, 'utf8');
    const lines = infoContent.split('\n').filter(line => line.trim());
    
    console.log('📄 Parsed info.txt:');
    lines.forEach((line, index) => {
      console.log(`   ${index + 1}. ${line.trim()}`);
    });
    console.log('');
    
    // Login to get authentication token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test1759941357349@example.com',
      password: 'pass123'
    });
    
    const authToken = loginResponse.data.token;
    console.log(`✅ Logged in as: ${loginResponse.data.user.name}`);
    
    // Parse events from info.txt
    const events = [];
    
    lines.forEach((line, index) => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const imagePath = parts[0].trim();
        const description = parts[1].trim();
        
        // Extract event number from image path
        const eventNumber = imagePath.match(/event(\d+)/)?.[1];
        
        if (eventNumber) {
          // Create event data based on description
          let title, category, eventDescription, location, time, maxAttendees;
          
          if (description.toLowerCase().includes('music') && description.toLowerCase().includes('guess the artist')) {
            title = 'Guess the Artist - Music Event';
            category = 'Music';
            eventDescription = 'Join us for an exciting music trivia night! Test your knowledge of artists and songs. Prizes for the winners!';
            location = 'Music Hall';
            time = '19:00';
            maxAttendees = 100;
          } else if (description.toLowerCase().includes('balance') && description.toLowerCase().includes('uni life')) {
            title = 'Balance Your Uni Life';
            category = 'Education';
            eventDescription = 'Learn how to balance your academic, social, and personal life effectively. Perfect for students and young professionals.';
            location = 'University Conference Room';
            time = '14:00';
            maxAttendees = 75;
          } else if (description.toLowerCase().includes('friendship bracelet')) {
            title = 'Friendship Bracelet Making Crafternoon';
            category = 'Arts & Crafts';
            eventDescription = 'Learn to make beautiful friendship bracelets! All materials provided. Perfect for beginners and craft enthusiasts.';
            location = 'Art Studio';
            time = '15:00';
            maxAttendees = 30;
          } else if (description.toLowerCase().includes('ap club') && description.toLowerCase().includes('exam')) {
            title = 'AP Club Interest Meeting';
            category = 'Education';
            eventDescription = 'Join our AP Club to boost your exam scores! Learn study strategies, get practice materials, and connect with other AP students.';
            location = 'Student Union';
            time = '16:00';
            maxAttendees = 40;
          } else if (description.toLowerCase().includes('board games')) {
            title = 'Board Games Night';
            category = 'Entertainment';
            eventDescription = 'Join us for an evening of fun board games! Bring your favorite games or try new ones. Snacks and drinks provided.';
            location = 'Community Center';
            time = '19:00';
            maxAttendees = 50;
          } else {
            // Default event
            title = `Event ${eventNumber}`;
            category = 'General';
            eventDescription = description;
            location = 'TBD';
            time = '18:00';
            maxAttendees = 50;
          }
          
          events.push({
            title,
            description: eventDescription,
            date: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(), // Spread events over weeks
            time,
            location,
            category,
            maxAttendees,
            thumbnail: {
              url: `/images/events/event${eventNumber}.jpg`,
              publicId: null
            }
          });
        }
      }
    });
    
    console.log(`📝 Creating ${events.length} events from info.txt...\n`);
    
    const createdEvents = [];
    
    for (let i = 0; i < events.length; i++) {
      const eventData = events[i];
      console.log(`🎯 Creating event ${i + 1}: ${eventData.title}`);
      console.log(`   Description: ${eventData.description}`);
      console.log(`   Image: ${eventData.thumbnail.url}`);
      console.log(`   Date: ${new Date(eventData.date).toDateString()}`);
      console.log(`   Time: ${eventData.time}`);
      console.log(`   Location: ${eventData.location}`);
      console.log(`   Category: ${eventData.category}`);
      console.log(`   Max Attendees: ${eventData.maxAttendees}`);
      
      try {
        const response = await axios.post(`${BASE_URL}/events/create`, eventData, {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        const createdEvent = response.data.event;
        createdEvents.push({
          ...createdEvent,
          thumbnail: eventData.thumbnail
        });
        
        console.log(`✅ Created successfully!`);
        console.log(`   Event ID: ${createdEvent.id}`);
        console.log(`   Organizer: ${createdEvent.organizer?.name || 'Unknown'}`);
        
        // Test the event details
        const detailResponse = await axios.get(`${BASE_URL}/events/${createdEvent.id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log(`✅ Event details working: ${detailResponse.data.event.title}`);
        console.log('');
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`❌ Failed to create event: ${error.response?.data?.message || error.message}`);
        if (error.response?.data?.errors) {
          console.log(`   Validation errors:`, error.response.data.errors);
        }
        console.log('');
      }
    }
    
    console.log(`🎉 Successfully created ${createdEvents.length} events from images!`);
    
    if (createdEvents.length > 0) {
      console.log('\n📋 CREATED EVENTS WITH IMAGES:');
      createdEvents.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.title}`);
        console.log(`      ID: ${event.id}`);
        console.log(`      Date: ${new Date(event.date).toDateString()}`);
        console.log(`      Time: ${event.time}`);
        console.log(`      Location: ${event.location}`);
        console.log(`      Image: ${event.thumbnail?.url || 'No image'}`);
        console.log(`      Category: ${event.category}`);
        console.log('');
      });
      
      console.log('💡 These events are now available in your application!');
      console.log('🖼️  Each event is associated with its corresponding image');
      console.log('🔗 Try navigating to any of these events to see the details');
      
      // Verify images exist
      console.log('\n🖼️  Verifying images exist:');
      createdEvents.forEach((event, index) => {
        const imageFullPath = path.join(__dirname, 'frontend/public', event.thumbnail?.url || '');
        const imageExists = fs.existsSync(imageFullPath);
        console.log(`   ${index + 1}. ${event.title}: ${imageExists ? '✅ Image found' : '❌ Image missing'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

seedEventsFromImages();
