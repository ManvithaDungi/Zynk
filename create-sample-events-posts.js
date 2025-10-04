const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Create axios instance with cookie support
const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true
});

async function createSampleData() {
  console.log('🚀 Creating sample events and posts...');
  
  try {
    // First, login with an existing user to get auth token
    console.log('🔐 Logging in with existing user...');
    const loginResponse = await apiClient.post('/auth/login', {
      email: 'john@example.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful');
    
    // Create sample events
    console.log('📅 Creating sample events...');
    const events = [
      {
        title: 'Tech Conference 2024',
        description: 'Join us for the biggest tech conference of the year featuring the latest innovations in AI, blockchain, and cloud computing.',
        date: '2024-03-15',
        time: '09:00',
        location: 'Convention Center, Downtown',
        category: 'Conference',
        maxAttendees: 500
      },
      {
        title: 'React Workshop',
        description: 'Learn React fundamentals and best practices in this hands-on workshop. Perfect for beginners and intermediate developers.',
        date: '2024-03-20',
        time: '14:00',
        location: 'Tech Hub, Innovation District',
        category: 'Workshop',
        maxAttendees: 50
      },
      {
        title: 'Networking Meetup',
        description: 'Connect with fellow developers, entrepreneurs, and tech enthusiasts. Great opportunity to expand your professional network.',
        date: '2024-03-25',
        time: '18:30',
        location: 'The Coffee House, Main Street',
        category: 'Meetup',
        maxAttendees: 100
      }
    ];
    
    const createdEvents = [];
    for (const eventData of events) {
      try {
        const eventResponse = await apiClient.post('/events/create', eventData);
        createdEvents.push(eventResponse.data.event);
        console.log(`✅ Created event: ${eventData.title}`);
      } catch (error) {
        console.log(`❌ Failed to create event: ${eventData.title} - ${error.response?.data?.message || error.message}`);
      }
    }
    
    // Create sample albums
    console.log('📸 Creating sample albums...');
    const albums = [
      {
        name: 'Tech Conference Memories',
        description: 'Photos and memories from the amazing tech conference',
        eventId: createdEvents[0]?.id
      },
      {
        name: 'React Workshop Gallery',
        description: 'Learning moments and code snippets from the React workshop',
        eventId: createdEvents[1]?.id
      },
      {
        name: 'Networking Event Photos',
        description: 'Great connections made at the networking meetup',
        eventId: createdEvents[2]?.id
      }
    ];
    
    const createdAlbums = [];
    for (const albumData of albums) {
      try {
        const albumResponse = await apiClient.post('/albums', albumData);
        createdAlbums.push(albumResponse.data.album);
        console.log(`✅ Created album: ${albumData.name}`);
      } catch (error) {
        console.log(`❌ Failed to create album: ${albumData.name} - ${error.response?.data?.message || error.message}`);
      }
    }
    
    // Create sample posts (memories)
    console.log('💭 Creating sample posts...');
    const posts = [
      {
        content: 'Had an amazing time at the tech conference! The AI presentations were mind-blowing. Can\'t wait for next year!',
        albumId: createdAlbums[0]?.id,
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500'
      },
      {
        content: 'Just finished the React workshop. Learned so much about hooks and state management. Time to build something awesome!',
        albumId: createdAlbums[1]?.id,
        imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500'
      },
      {
        content: 'Great networking event! Met some incredible people and had fascinating conversations about the future of tech.',
        albumId: createdAlbums[2]?.id,
        imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500'
      }
    ];
    
    for (const postData of posts) {
      try {
        const postResponse = await apiClient.post('/posts', postData);
        console.log(`✅ Created post in album: ${postData.albumId}`);
      } catch (error) {
        console.log(`❌ Failed to create post - ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log('🎉 Sample data creation completed!');
    console.log('📊 Summary:');
    console.log(`📅 Events created: ${createdEvents.length}`);
    console.log(`📸 Albums created: ${createdAlbums.length}`);
    console.log(`💭 Posts created: ${posts.length}`);
    console.log('✅ You can now test the EventDetail page and other features!');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error.response?.data?.message || error.message);
  }
}

createSampleData();
