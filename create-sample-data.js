const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./backend/models/User');
const Event = require('./backend/models/Event');
const Album = require('./backend/models/Album');
const Memory = require('./backend/models/Memory');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zynk', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create sample users
const createSampleUsers = async () => {
  console.log('👥 Creating sample users...');
  
  const users = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'user'
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'user'
    },
    {
      name: 'Mike Johnson',
      email: 'mike@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'user'
    },
    {
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'user'
    },
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin'
    }
  ];

  // Clear existing users
  await User.deleteMany({});
  
  const createdUsers = await User.insertMany(users);
  console.log(`✅ Created ${createdUsers.length} users`);
  return createdUsers;
};

// Create sample events
const createSampleEvents = async (users) => {
  console.log('📅 Creating sample events...');
  
  const events = [
    {
      title: 'Tech Conference 2024',
      description: 'Join us for the biggest tech conference of the year! Learn about the latest trends in AI, machine learning, and web development.',
      category: 'Conference',
      date: new Date('2024-12-15'),
      time: '09:00',
      location: 'Convention Center, Downtown',
      maxAttendees: 500,
      organizer: users[0]._id,
      thumbnail: {
        url: '/placeholder-conference.jpg'
      },
      status: 'active'
    },
    {
      title: 'React Workshop',
      description: 'Hands-on workshop to learn React.js from basics to advanced concepts. Perfect for developers looking to upskill.',
      category: 'Workshop',
      date: new Date('2024-12-20'),
      time: '14:00',
      location: 'Tech Hub, Innovation District',
      maxAttendees: 50,
      organizer: users[1]._id,
      thumbnail: {
        url: '/placeholder-workshop.jpg'
      },
      status: 'active'
    },
    {
      title: 'Networking Meetup',
      description: 'Connect with fellow developers, designers, and entrepreneurs. Great opportunity to expand your professional network.',
      category: 'Meetup',
      date: new Date('2024-12-25'),
      time: '18:00',
      location: 'Coffee Shop, Main Street',
      maxAttendees: 30,
      organizer: users[2]._id,
      thumbnail: {
        url: '/placeholder-meetup.jpg'
      },
      status: 'active'
    },
    {
      title: 'Holiday Party',
      description: 'Celebrate the holiday season with your colleagues! Food, drinks, and fun activities for everyone.',
      category: 'Social',
      date: new Date('2024-12-30'),
      time: '19:00',
      location: 'Grand Hotel, Ballroom',
      maxAttendees: 100,
      organizer: users[3]._id,
      thumbnail: {
        url: '/placeholder-party.jpg'
      },
      status: 'active'
    },
    {
      title: 'Sports Day',
      description: 'Annual company sports day with various activities including football, basketball, and team building games.',
      category: 'Sports',
      date: new Date('2025-01-05'),
      time: '10:00',
      location: 'Sports Complex, City Park',
      maxAttendees: 200,
      organizer: users[0]._id,
      thumbnail: {
        url: '/placeholder-sports.jpg'
      },
      status: 'active'
    }
  ];

  // Clear existing events
  await Event.deleteMany({});
  
  const createdEvents = await Event.insertMany(events);
  console.log(`✅ Created ${createdEvents.length} events`);
  return createdEvents;
};

// Create sample albums
const createSampleAlbums = async (users, events) => {
  console.log('📸 Creating sample albums...');
  
  const albums = [
    {
      title: 'Tech Conference Memories',
      description: 'Photos and memories from the amazing Tech Conference 2024',
      createdBy: users[0]._id,
      event: events[0]._id,
      coverImage: '/placeholder-album1.jpg'
    },
    {
      title: 'React Workshop Highlights',
      description: 'Learning moments and code snippets from the React workshop',
      createdBy: users[1]._id,
      event: events[1]._id,
      coverImage: '/placeholder-album2.jpg'
    },
    {
      title: 'Networking Moments',
      description: 'Great connections made at the networking meetup',
      createdBy: users[2]._id,
      event: events[2]._id,
      coverImage: '/placeholder-album3.jpg'
    },
    {
      title: 'Personal Album',
      description: 'My personal collection of memories and moments',
      createdBy: users[3]._id,
      event: null, // Personal album not tied to an event
      coverImage: '/placeholder-album4.jpg'
    }
  ];

  // Clear existing albums
  await Album.deleteMany({});
  
  const createdAlbums = await Album.insertMany(albums);
  console.log(`✅ Created ${createdAlbums.length} albums`);
  return createdAlbums;
};

// Create sample memories/posts
const createSampleMemories = async (users, albums) => {
  console.log('💭 Creating sample memories...');
  
  const memories = [
    {
      description: 'Amazing keynote speech about the future of AI! The speaker really opened my eyes to new possibilities.',
      mediaUrl: '/placeholder-memory1.jpg',
      mediaType: 'image',
      createdBy: users[0]._id,
      album: albums[0]._id
    },
    {
      description: 'Learning React hooks was a game changer! Can\'t wait to implement this in my next project.',
      mediaUrl: '/placeholder-memory2.jpg',
      mediaType: 'image',
      createdBy: users[1]._id,
      album: albums[1]._id
    },
    {
      description: 'Met some incredible people today! The networking session was exactly what I needed.',
      mediaUrl: '/placeholder-memory3.jpg',
      mediaType: 'image',
      createdBy: users[2]._id,
      album: albums[2]._id
    },
    {
      description: 'Beautiful sunset from my office window today. Sometimes you need to stop and appreciate the little things.',
      mediaUrl: '/placeholder-memory4.jpg',
      mediaType: 'image',
      createdBy: users[3]._id,
      album: albums[3]._id
    },
    {
      description: 'Team lunch was fantastic! Great food and even better company.',
      mediaUrl: '/placeholder-memory5.jpg',
      mediaType: 'image',
      createdBy: users[0]._id,
      album: albums[0]._id
    },
    {
      description: 'Code review session went really well. Love how collaborative our team is!',
      mediaUrl: '/placeholder-memory6.jpg',
      mediaType: 'image',
      createdBy: users[1]._id,
      album: albums[1]._id
    }
  ];

  // Clear existing memories
  await Memory.deleteMany({});
  
  const createdMemories = await Memory.insertMany(memories);
  console.log(`✅ Created ${createdMemories.length} memories`);
  return createdMemories;
};

// Update albums with memories
const updateAlbumsWithMemories = async (albums, memories) => {
  console.log('🔗 Linking memories to albums...');
  
  for (const album of albums) {
    const albumMemories = memories.filter(memory => memory.album.toString() === album._id.toString());
    album.memories = albumMemories.map(memory => memory._id);
    await album.save();
  }
  
  console.log('✅ Updated albums with memory references');
};

// Register some users for events
const registerUsersForEvents = async (users, events) => {
  console.log('📝 Registering users for events...');
  
  // Register users for different events
  await Event.findByIdAndUpdate(events[0]._id, {
    $push: { registeredUsers: [users[1]._id, users[2]._id, users[3]._id] }
  });
  
  await Event.findByIdAndUpdate(events[1]._id, {
    $push: { registeredUsers: [users[0]._id, users[2]._id] }
  });
  
  await Event.findByIdAndUpdate(events[2]._id, {
    $push: { registeredUsers: [users[0]._id, users[1]._id, users[3]._id] }
  });
  
  console.log('✅ Registered users for events');
};

// Main function
const createSampleData = async () => {
  try {
    console.log('🚀 Starting to create sample data...\n');
    
    await connectDB();
    
    const users = await createSampleUsers();
    const events = await createSampleEvents(users);
    const albums = await createSampleAlbums(users, events);
    const memories = await createSampleMemories(users, albums);
    
    await updateAlbumsWithMemories(albums, memories);
    await registerUsersForEvents(users, events);
    
    console.log('\n🎉 Sample data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`📅 Events: ${events.length}`);
    console.log(`📸 Albums: ${albums.length}`);
    console.log(`💭 Memories: ${memories.length}`);
    
    console.log('\n🔑 Test Credentials:');
    console.log('User: john@example.com / password123');
    console.log('User: jane@example.com / password123');
    console.log('User: mike@example.com / password123');
    console.log('User: sarah@example.com / password123');
    console.log('Admin: admin@example.com / admin123');
    
    console.log('\n✅ You can now test the EventDetail page and other features!');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the script
createSampleData();
