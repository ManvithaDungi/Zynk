const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function createSimpleSample() {
  console.log('🚀 Creating simple sample data...\n');
  
  try {
    // Wait a bit to avoid rate limiting
    console.log('⏳ Waiting to avoid rate limiting...');
    await new Promise(resolve => setTimeout(resolve, 20000)); // Wait 20 seconds
    
    // 1. Create one user
    console.log('👤 Creating test user...');
    const userData = {
      username: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    let userToken = null;
    try {
      const userResponse = await axios.post(`${BASE_URL}/auth/register`, userData);
      if (userResponse.data.success) {
        userToken = userResponse.data.token;
        console.log('✅ Created test user');
      }
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('⚠️  User already exists, trying to login...');
        try {
          const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: userData.email,
            password: userData.password
          });
          if (loginResponse.data.success) {
            userToken = loginResponse.data.token;
            console.log('✅ Logged in existing user');
          }
        } catch (loginError) {
          console.log('❌ Failed to login:', loginError.response?.data?.message || loginError.message);
        }
      } else {
        console.log('❌ Failed to create user:', error.response?.data?.message || error.message);
      }
    }
    
    if (!userToken) {
      console.log('❌ No user token available, cannot create events');
      return;
    }
    
    // 2. Create one event
    console.log('\n📅 Creating test event...');
    const eventData = {
      title: 'Sample Tech Conference',
      description: 'A sample tech conference to test the EventDetail page functionality. This event includes various sessions about web development, AI, and networking.',
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
        console.log('✅ Created test event:', event.title);
        console.log(`📋 Event ID: ${event.id}`);
        
        // 3. Create one album
        console.log('\n📸 Creating test album...');
        const albumData = {
          name: 'Conference Memories',
          description: 'Photos and memories from the tech conference'
        };
        
        try {
          const albumResponse = await axios.post(`${BASE_URL}/albums`, albumData, {
            headers: {
              'Authorization': `Bearer ${userToken}`
            }
          });
          if (albumResponse.data.album) {
            const album = albumResponse.data.album;
            console.log('✅ Created test album:', album.name);
            console.log(`📋 Album ID: ${album.id}`);
            
            // 4. Create one post
            console.log('\n💭 Creating test post...');
            const postData = {
              caption: 'Great session on React hooks! Learned so much today.',
              media: [{ url: '/placeholder-memory.jpg', type: 'image' }],
              albumId: album.id
            };
            
            try {
              const postResponse = await axios.post(`${BASE_URL}/posts`, postData, {
                headers: {
                  'Authorization': `Bearer ${userToken}`
                }
              });
              if (postResponse.data.success) {
                console.log('✅ Created test post');
              }
            } catch (postError) {
              console.log('❌ Failed to create post:', postError.response?.data?.message || postError.message);
            }
          }
        } catch (albumError) {
          console.log('❌ Failed to create album:', albumError.response?.data?.message || albumError.message);
        }
      }
    } catch (eventError) {
      console.log('❌ Failed to create event:', eventError.response?.data?.message || eventError.message);
    }
    
    console.log('\n🎉 Sample data creation completed!');
    console.log('\n🔑 Test Credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('\n✅ You can now test the EventDetail page!');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
  }
}

createSimpleSample();
