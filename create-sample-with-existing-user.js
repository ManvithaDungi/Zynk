const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function createSampleWithExistingUser() {
  console.log('🚀 Creating sample data with existing user...\n');
  
  try {
    // First, try to login with the existing test user
    console.log('🔐 Logging in with existing user...');
    let userToken = null;
    
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'password123'
      });
      
      if (loginResponse.data.success) {
        userToken = loginResponse.data.token;
        console.log('✅ Successfully logged in with existing user');
      }
    } catch (loginError) {
      console.log('❌ Failed to login with existing user:', loginError.response?.data?.message || loginError.message);
      
      // If login fails, try to register a new user
      console.log('📝 Trying to register a new user...');
      try {
        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
          username: 'Sample User',
          email: 'sample@example.com',
          password: 'password123'
        });
        
        if (registerResponse.data.success) {
          userToken = registerResponse.data.token;
          console.log('✅ Successfully registered new user');
        }
      } catch (registerError) {
        console.log('❌ Failed to register new user:', registerError.response?.data?.message || registerError.message);
        return;
      }
    }
    
    if (!userToken) {
      console.log('❌ No user token available, cannot create sample data');
      return;
    }
    
    // Create events
    console.log('\n📅 Creating sample events...');
    const events = [
      {
        title: 'Tech Conference 2024',
        description: 'Join us for the biggest tech conference of the year! Learn about the latest trends in AI, machine learning, and web development.',
        category: 'Conference',
        date: '2024-12-15',
        time: '09:00',
        location: 'Convention Center, Downtown',
        maxAttendees: 500
      },
      {
        title: 'React Workshop',
        description: 'Hands-on workshop to learn React.js from basics to advanced concepts. Perfect for developers looking to upskill.',
        category: 'Workshop',
        date: '2024-12-20',
        time: '14:00',
        location: 'Tech Hub, Innovation District',
        maxAttendees: 50
      },
      {
        title: 'Networking Meetup',
        description: 'Connect with fellow developers, designers, and entrepreneurs. Great opportunity to expand your professional network.',
        category: 'Meetup',
        date: '2024-12-25',
        time: '18:00',
        location: 'Coffee Shop, Main Street',
        maxAttendees: 30
      }
    ];
    
    const createdEvents = [];
    for (const event of events) {
      try {
        const response = await axios.post(`${BASE_URL}/events/create`, event, {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        });
        if (response.data.success) {
          createdEvents.push(response.data.event);
          console.log(`✅ Created event: ${event.title}`);
        }
      } catch (error) {
        console.log(`❌ Failed to create event: ${event.title} - ${error.response?.data?.message || error.message}`);
      }
    }
    
    // Create albums
    console.log('\n📸 Creating sample albums...');
    const albums = [
      {
        name: 'Conference Memories',
        description: 'Photos and memories from the tech conference'
      },
      {
        name: 'Workshop Highlights',
        description: 'Learning moments from the React workshop'
      },
      {
        name: 'Networking Moments',
        description: 'Great connections made at the meetup'
      }
    ];
    
    const createdAlbums = [];
    for (const album of albums) {
      try {
        const response = await axios.post(`${BASE_URL}/albums`, album, {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        });
        if (response.data.album) {
          createdAlbums.push(response.data.album);
          console.log(`✅ Created album: ${album.name}`);
        }
      } catch (error) {
        console.log(`❌ Failed to create album: ${album.name} - ${error.response?.data?.message || error.message}`);
      }
    }
    
    // Create posts
    console.log('\n💭 Creating sample posts...');
    const posts = [
      {
        caption: 'Amazing keynote speech about the future of AI! The speaker really opened my eyes to new possibilities.',
        media: [{ url: '/placeholder-memory1.jpg', type: 'image' }]
      },
      {
        caption: 'Learning React hooks was a game changer! Can\'t wait to implement this in my next project.',
        media: [{ url: '/placeholder-memory2.jpg', type: 'image' }]
      },
      {
        caption: 'Met some incredible people today! The networking session was exactly what I needed.',
        media: [{ url: '/placeholder-memory3.jpg', type: 'image' }]
      }
    ];
    
    for (let i = 0; i < posts.length && i < createdAlbums.length; i++) {
      try {
        const post = {
          ...posts[i],
          albumId: createdAlbums[i].id
        };
        const response = await axios.post(`${BASE_URL}/posts`, post, {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        });
        if (response.data.success) {
          console.log(`✅ Created post in album: ${createdAlbums[i].name}`);
        }
      } catch (error) {
        console.log(`❌ Failed to create post in album: ${createdAlbums[i].name} - ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log('\n🎉 Sample data creation completed!');
    console.log('\n📊 Summary:');
    console.log(`📅 Events created: ${createdEvents.length}`);
    console.log(`📸 Albums created: ${createdAlbums.length}`);
    
    if (createdEvents.length > 0) {
      console.log('\n🔗 Event IDs for testing:');
      createdEvents.forEach((event, index) => {
        console.log(`${index + 1}. ${event.title}: ${event.id}`);
      });
    }
    
    console.log('\n✅ You can now test the EventDetail page!');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
  }
}

createSampleWithExistingUser();
