const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function createFreshSample() {
  console.log('🚀 Creating fresh sample data...\n');
  
  try {
    // 1. Create a fresh user with unique email
    const timestamp = Date.now();
    const userData = {
      username: 'Sample User',
      email: `sample${timestamp}@example.com`,
      password: 'password123'
    };
    
    console.log('👤 Creating fresh user...');
    let userToken = null;
    
    try {
      const userResponse = await axios.post(`${BASE_URL}/auth/register`, userData);
      if (userResponse.data.message === 'User created successfully') {
        console.log('✅ User created successfully');
        
        // Login to get token
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: userData.email,
          password: userData.password
        });
        
        if (loginResponse.data.success) {
          userToken = loginResponse.data.token;
          console.log('✅ User logged in successfully');
        }
      }
    } catch (error) {
      console.log('❌ User creation failed:', error.response?.data?.message || error.message);
      return;
    }
    
    if (!userToken) {
      console.log('❌ No authentication token available');
      return;
    }
    
    // 2. Create events
    console.log('\n📅 Creating events...');
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
    
    // 3. Create albums
    console.log('\n📸 Creating albums...');
    const albums = [
      {
        name: 'Conference Memories',
        description: 'Photos and memories from the tech conference'
      },
      {
        name: 'Workshop Highlights',
        description: 'Learning moments from the React workshop'
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
    
    // 4. Create posts
    console.log('\n💭 Creating posts...');
    const posts = [
      {
        caption: 'Amazing keynote speech about the future of AI! The speaker really opened my eyes to new possibilities.',
        media: [{ url: '/placeholder-memory1.jpg', type: 'image' }]
      },
      {
        caption: 'Learning React hooks was a game changer! Can\'t wait to implement this in my next project.',
        media: [{ url: '/placeholder-memory2.jpg', type: 'image' }]
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
    
    console.log('\n🔑 Test Credentials:');
    console.log(`Email: ${userData.email}`);
    console.log('Password: password123');
    
    console.log('\n✅ You can now test the EventDetail page!');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
  }
}

createFreshSample();
