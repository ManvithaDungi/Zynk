const mongoose = require('mongoose');

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

async function createSampleData() {
  try {
    console.log('🚀 Creating sample data directly in database...\n');
    
    await connectDB();
    
    // Create a sample user
    console.log('👤 Creating sample user...');
    const user = new User({
      name: 'Sample User',
      email: 'sample@example.com',
      password: 'password123', // Will be hashed by pre-save middleware
      role: 'user'
    });
    
    await user.save();
    console.log('✅ Sample user created');
    
    // Create sample events
    console.log('\n📅 Creating sample events...');
    const events = [
      {
        title: 'Tech Conference 2024',
        description: 'Join us for the biggest tech conference of the year! Learn about the latest trends in AI, machine learning, and web development.',
        category: 'Conference',
        date: new Date('2024-12-15'),
        time: '09:00',
        location: 'Convention Center, Downtown',
        maxAttendees: 500,
        organizer: user._id,
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
        organizer: user._id,
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
        organizer: user._id,
        thumbnail: {
          url: '/placeholder-meetup.jpg'
        },
        status: 'active'
      }
    ];
    
    const createdEvents = await Event.insertMany(events);
    console.log(`✅ Created ${createdEvents.length} events`);
    
    // Create sample albums
    console.log('\n📸 Creating sample albums...');
    const albums = [
      {
        title: 'Conference Memories',
        description: 'Photos and memories from the tech conference',
        createdBy: user._id,
        event: createdEvents[0]._id,
        coverImage: '/placeholder-album1.jpg'
      },
      {
        title: 'Workshop Highlights',
        description: 'Learning moments from the React workshop',
        createdBy: user._id,
        event: createdEvents[1]._id,
        coverImage: '/placeholder-album2.jpg'
      },
      {
        title: 'Personal Album',
        description: 'My personal collection of memories',
        createdBy: user._id,
        event: null,
        coverImage: '/placeholder-album3.jpg'
      }
    ];
    
    const createdAlbums = await Album.insertMany(albums);
    console.log(`✅ Created ${createdAlbums.length} albums`);
    
    // Create sample memories
    console.log('\n💭 Creating sample memories...');
    const memories = [
      {
        description: 'Amazing keynote speech about the future of AI! The speaker really opened my eyes to new possibilities.',
        mediaUrl: '/placeholder-memory1.jpg',
        mediaType: 'image',
        createdBy: user._id,
        album: createdAlbums[0]._id
      },
      {
        description: 'Learning React hooks was a game changer! Can\'t wait to implement this in my next project.',
        mediaUrl: '/placeholder-memory2.jpg',
        mediaType: 'image',
        createdBy: user._id,
        album: createdAlbums[1]._id
      },
      {
        description: 'Beautiful sunset from my office window today. Sometimes you need to stop and appreciate the little things.',
        mediaUrl: '/placeholder-memory3.jpg',
        mediaType: 'image',
        createdBy: user._id,
        album: createdAlbums[2]._id
      }
    ];
    
    const createdMemories = await Memory.insertMany(memories);
    console.log(`✅ Created ${createdMemories.length} memories`);
    
    // Update albums with memories
    console.log('\n🔗 Linking memories to albums...');
    for (let i = 0; i < createdAlbums.length; i++) {
      createdAlbums[i].memories = [createdMemories[i]._id];
      await createdAlbums[i].save();
    }
    
    // Register user for first event
    console.log('\n📝 Registering user for events...');
    createdEvents[0].registeredUsers.push(user._id);
    await createdEvents[0].save();
    
    createdEvents[1].registeredUsers.push(user._id);
    await createdEvents[1].save();
    
    console.log('\n🎉 Sample data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`👤 Users: 1`);
    console.log(`📅 Events: ${createdEvents.length}`);
    console.log(`📸 Albums: ${createdAlbums.length}`);
    console.log(`💭 Memories: ${createdMemories.length}`);
    
    console.log('\n🔑 Test Credentials:');
    console.log('Email: sample@example.com');
    console.log('Password: password123');
    
    console.log('\n🔗 Event IDs for testing:');
    createdEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}: ${event._id}`);
    });
    
    console.log('\n✅ You can now test the EventDetail page!');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

createSampleData();
