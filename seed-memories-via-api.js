const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function seedMemoriesViaAPI() {
  try {
    console.log('🌱 Seeding Memories via API for User: test3626@gmail.com...\n');
    
    // Step 1: Register the user
    console.log('👤 Registering user...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Test User 3626',
        email: 'test3626@gmail.com',
        password: 'pass3626'
      });
      console.log('✅ User registered successfully');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('✅ User already exists');
      } else {
        console.log('⚠️  Registration failed:', error.response?.data?.message || error.message);
      }
    }
    
    // Step 2: Login to get auth token
    console.log('\n🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test3626@gmail.com',
      password: 'pass3626'
    });
    
    const authToken = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log(`✅ Logged in as: ${user.name} (ID: ${user.id})`);
    
    // Step 3: Get or create albums
    console.log('\n📁 Getting albums...');
    const albumsResponse = await axios.get(`${BASE_URL}/albums`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    let albums = albumsResponse.data.albums || [];
    console.log(`✅ Found ${albums.length} existing albums`);
    
    // If no albums, create some
    if (albums.length === 0) {
      console.log('📁 Creating albums...');
      
      const albumData = [
        {
          name: 'Study Group Memories',
          description: 'Memories from study sessions and group activities'
        },
        {
          name: 'Food Fest 2024',
          description: 'Delicious moments from food festival events'
        },
        {
          name: 'Biochem Lab Adventures',
          description: 'Scientific discoveries and lab experiments'
        }
      ];
      
      for (const album of albumData) {
        try {
          const createAlbumResponse = await axios.post(`${BASE_URL}/albums`, album, {
            headers: { 
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          console.log(`✅ Created album: ${album.name}`);
        } catch (error) {
          console.log(`⚠️  Album creation failed: ${error.response?.data?.message || error.message}`);
        }
      }
      
      // Get albums again
      const updatedAlbumsResponse = await axios.get(`${BASE_URL}/albums`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      albums = updatedAlbumsResponse.data.albums || [];
    }
    
    // Step 4: Create memories
    console.log('\n🧠 Creating memories...');
    
    const memories = [
      {
        title: 'Study Session Success',
        description: 'Great study session with friends, we finally understood the complex algorithms!',
        mediaUrl: '/images/memories/mem8.jpg',
        mediaType: 'image',
        albumId: albums[0]?.id || albums[0]?._id
      },
      {
        title: 'Group Project Victory',
        description: 'Our team presentation went amazing! Everyone contributed their best work.',
        mediaUrl: '/images/memories/mem1.jpg',
        mediaType: 'image',
        albumId: albums[0]?.id || albums[0]?._id
      },
      {
        title: 'Delicious Pizza Night',
        description: 'Best pizza we\'ve had in months! The food fest was incredible.',
        mediaUrl: '/images/memories/mem6.jpg',
        mediaType: 'image',
        albumId: albums[1]?.id || albums[1]?._id
      },
      {
        title: 'Friends Eating Together',
        description: 'Nothing beats sharing a meal with good friends. Great memories!',
        mediaUrl: '/images/memories/mem7.jpg',
        mediaType: 'image',
        albumId: albums[1]?.id || albums[1]?._id
      },
      {
        title: 'Restaurant Adventure',
        description: 'Tried a new restaurant with the study group. The food was amazing!',
        mediaUrl: '/images/memories/mem5.jpg',
        mediaType: 'image',
        albumId: albums[1]?.id || albums[1]?._id
      },
      {
        title: 'Lab Experiment Success',
        description: 'Finally got the results we were looking for! Science is amazing.',
        mediaUrl: '/images/memories/mem2.jpg',
        mediaType: 'image',
        albumId: albums[2]?.id || albums[2]?._id
      },
      {
        title: 'Test Tube Discovery',
        description: 'Working with test tubes in the biochem lab. Learning so much!',
        mediaUrl: '/images/memories/mem1.jpg',
        mediaType: 'image',
        albumId: albums[2]?.id || albums[2]?._id
      },
      {
        title: 'Lab Partners',
        description: 'Great teamwork in the biochem lab. We make a good team!',
        mediaUrl: '/images/memories/mem9.jpg',
        mediaType: 'image',
        albumId: albums[2]?.id || albums[2]?._id
      },
      {
        title: 'Standalone Memory - Board Game Night',
        description: 'Had an amazing time at the board game night! Strategy games are the best.',
        mediaUrl: '/images/memories/mem4.jpg',
        mediaType: 'image',
        albumId: albums[0]?.id || albums[0]?._id
      },
      {
        title: 'Music Session with Friends',
        description: 'Spontaneous music session with guitar. These are the moments that matter!',
        mediaUrl: '/images/memories/mem3.jpg',
        mediaType: 'image',
        albumId: albums[0]?.id || albums[0]?._id
      }
    ];
    
    const createdMemories = [];
    
    for (const memoryData of memories) {
      try {
        const memoryResponse = await axios.post(`${BASE_URL}/memories`, memoryData, {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        createdMemories.push(memoryResponse.data.memory);
        console.log(`✅ Created memory: ${memoryData.title}`);
      } catch (error) {
        console.log(`⚠️  Memory creation failed: ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log('\n🎉 SEEDING COMPLETE!');
    console.log('═══════════════════════════════════════════════');
    console.log(`✅ User: ${user.name} (${user.email})`);
    console.log(`✅ User ID: ${user.id}`);
    console.log(`✅ Albums available: ${albums.length}`);
    console.log(`✅ Memories created: ${createdMemories.length}`);
    
    console.log('\n💡 Login Credentials:');
    console.log(`   Email: test3626@gmail.com`);
    console.log(`   Password: pass3626`);
    
    console.log('\n🚀 Ready for Testing:');
    console.log('1. Login with the credentials above');
    console.log('2. Go to PrivacyManager page');
    console.log('3. You should see all the seeded memories');
    console.log('4. Test privacy settings updates');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

seedMemoriesViaAPI();
