const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Sample data
const sampleUsers = [
  {
    username: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  },
  {
    username: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123'
  },
  {
    username: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'password123'
  },
  {
    username: 'Sarah Wilson',
    email: 'sarah@example.com',
    password: 'password123'
  },
  {
    username: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123'
  }
];

const sampleEvents = [
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
  },
  {
    title: 'Holiday Party',
    description: 'Celebrate the holiday season with your colleagues! Food, drinks, and fun activities for everyone.',
    category: 'Social',
    date: '2024-12-30',
    time: '19:00',
    location: 'Grand Hotel, Ballroom',
    maxAttendees: 100
  },
  {
    title: 'Sports Day',
    description: 'Annual company sports day with various activities including football, basketball, and team building games.',
    category: 'Sports',
    date: '2025-01-05',
    time: '10:00',
    location: 'Sports Complex, City Park',
    maxAttendees: 200
  }
];

const sampleAlbums = [
  {
    name: 'Tech Conference Memories',
    description: 'Photos and memories from the amazing Tech Conference 2024'
  },
  {
    name: 'React Workshop Highlights',
    description: 'Learning moments and code snippets from the React workshop'
  },
  {
    name: 'Networking Moments',
    description: 'Great connections made at the networking meetup'
  },
  {
    name: 'Personal Album',
    description: 'My personal collection of memories and moments'
  }
];

const samplePosts = [
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
  },
  {
    caption: 'Beautiful sunset from my office window today. Sometimes you need to stop and appreciate the little things.',
    media: [{ url: '/placeholder-memory4.jpg', type: 'image' }]
  },
  {
    caption: 'Team lunch was fantastic! Great food and even better company.',
    media: [{ url: '/placeholder-memory5.jpg', type: 'image' }]
  },
  {
    caption: 'Code review session went really well. Love how collaborative our team is!',
    media: [{ url: '/placeholder-memory6.jpg', type: 'image' }]
  }
];

async function createSampleData() {
  console.log('🚀 Creating sample data via API...\n');
  
  const createdUsers = [];
  const createdEvents = [];
  const createdAlbums = [];
  
  try {
    // 1. Create users
    console.log('👥 Creating users...');
    for (const user of sampleUsers) {
      try {
        const response = await axios.post(`${BASE_URL}/auth/register`, user);
        if (response.data.success) {
          createdUsers.push({ ...user, token: response.data.token });
          console.log(`✅ Created user: ${user.username}`);
        }
      } catch (error) {
        if (error.response?.data?.message?.includes('already exists')) {
          console.log(`⚠️  User already exists: ${user.username}`);
          // Try to login to get token
          try {
            const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
              email: user.email,
              password: user.password
            });
            if (loginResponse.data.success) {
              createdUsers.push({ ...user, token: loginResponse.data.token });
              console.log(`✅ Logged in user: ${user.username}`);
            }
          } catch (loginError) {
            console.log(`❌ Failed to login user: ${user.username}`);
          }
        } else {
          console.log(`❌ Failed to create user: ${user.username} - ${error.response?.data?.message || error.message}`);
        }
      }
    }
    
    // 2. Create events (using first user as organizer)
    console.log('\n📅 Creating events...');
    if (createdUsers.length > 0) {
      for (const event of sampleEvents) {
        try {
          const response = await axios.post(`${BASE_URL}/events/create`, event, {
            headers: {
              'Authorization': `Bearer ${createdUsers[0].token}`
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
    }
    
    // 3. Create albums
    console.log('\n📸 Creating albums...');
    if (createdUsers.length > 0) {
      for (const album of sampleAlbums) {
        try {
          const response = await axios.post(`${BASE_URL}/albums`, album, {
            headers: {
              'Authorization': `Bearer ${createdUsers[0].token}`
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
    }
    
    // 4. Create posts in albums
    console.log('\n💭 Creating posts...');
    if (createdUsers.length > 0 && createdAlbums.length > 0) {
      for (let i = 0; i < samplePosts.length && i < createdAlbums.length; i++) {
        try {
          const post = {
            ...samplePosts[i],
            albumId: createdAlbums[i].id
          };
          const response = await axios.post(`${BASE_URL}/posts`, post, {
            headers: {
              'Authorization': `Bearer ${createdUsers[0].token}`
            }
          });
          if (response.data.success) {
            console.log(`✅ Created post in album: ${createdAlbums[i].name}`);
          }
        } catch (error) {
          console.log(`❌ Failed to create post in album: ${createdAlbums[i].name} - ${error.response?.data?.message || error.message}`);
        }
      }
    }
    
    // 5. Register users for events
    console.log('\n📝 Registering users for events...');
    if (createdUsers.length > 1 && createdEvents.length > 0) {
      // Register second user for first event
      try {
        await axios.post(`${BASE_URL}/events/${createdEvents[0].id}/register`, {}, {
          headers: {
            'Authorization': `Bearer ${createdUsers[1].token}`
          }
        });
        console.log(`✅ Registered ${createdUsers[1].username} for ${createdEvents[0].title}`);
      } catch (error) {
        console.log(`❌ Failed to register user for event - ${error.response?.data?.message || error.message}`);
      }
      
      // Register third user for second event
      if (createdUsers.length > 2 && createdEvents.length > 1) {
        try {
          await axios.post(`${BASE_URL}/events/${createdEvents[1].id}/register`, {}, {
            headers: {
              'Authorization': `Bearer ${createdUsers[2].token}`
            }
          });
          console.log(`✅ Registered ${createdUsers[2].username} for ${createdEvents[1].title}`);
        } catch (error) {
          console.log(`❌ Failed to register user for event - ${error.response?.data?.message || error.message}`);
        }
      }
    }
    
    console.log('\n🎉 Sample data creation completed!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users created: ${createdUsers.length}`);
    console.log(`📅 Events created: ${createdEvents.length}`);
    console.log(`📸 Albums created: ${createdAlbums.length}`);
    
    console.log('\n🔑 Test Credentials:');
    console.log('User: john@example.com / password123');
    console.log('User: jane@example.com / password123');
    console.log('User: mike@example.com / password123');
    console.log('User: sarah@example.com / password123');
    console.log('Admin: admin@example.com / admin123');
    
    console.log('\n✅ You can now test the EventDetail page and other features!');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
  }
}

createSampleData();
