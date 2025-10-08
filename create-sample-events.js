const mongoose = require('mongoose');
const Event = require('./backend/models/Event');
const User = require('./backend/models/User');
const Category = require('./backend/models/Category');
require('dotenv').config();

async function createSampleEvents() {
  try {
    console.log('🔍 Creating sample events...\n');
    
    // Connect to database
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in environment variables');
      return;
    }
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 5000,
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      authSource: 'admin',
      retryWrites: true,
      w: 'majority',
      bufferCommands: false,
      retryReads: true
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    // Check if events already exist
    const existingEvents = await Event.countDocuments();
    if (existingEvents > 0) {
      console.log(`📝 Found ${existingEvents} existing events in database`);
      console.log('💡 Events already exist, skipping creation');
      return;
    }
    
    // Get users to be organizers
    const users = await User.find({}).limit(3);
    if (users.length === 0) {
      console.log('❌ No users found. Please run the seed script first.');
      return;
    }
    
    console.log(`👤 Found ${users.length} users to use as organizers`);
    
    // Create or get categories
    let categories = await Category.find({});
    if (categories.length === 0) {
      console.log('📝 Creating sample categories...');
      const sampleCategories = [
        { name: 'Technology', description: 'Tech events and conferences' },
        { name: 'Music', description: 'Concerts and music events' },
        { name: 'Sports', description: 'Sports events and tournaments' },
        { name: 'Food & Drink', description: 'Food festivals and tastings' },
        { name: 'Art & Culture', description: 'Art exhibitions and cultural events' }
      ];
      
      categories = await Category.insertMany(sampleCategories);
      console.log(`✅ Created ${categories.length} categories`);
    } else {
      console.log(`📝 Found ${categories.length} existing categories`);
    }
    
    // Create sample events
    const sampleEvents = [
      {
        title: 'Tech Conference 2024',
        description: 'Join us for the biggest technology conference of the year! Learn about the latest trends in AI, blockchain, and web development. Network with industry leaders and discover new opportunities.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        time: '09:00',
        location: 'Convention Center, Downtown',
        category: categories[0]._id,
        maxAttendees: 500,
        organizer: users[0]._id,
        status: 'active'
      },
      {
        title: 'Summer Music Festival',
        description: 'A day filled with amazing music, food trucks, and great vibes. Featuring local and international artists. Bring your friends and family for an unforgettable experience!',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        time: '12:00',
        location: 'Central Park',
        category: categories[1]._id,
        maxAttendees: 1000,
        organizer: users[1] ? users[1]._id : users[0]._id,
        status: 'active'
      },
      {
        title: 'Food & Wine Tasting',
        description: 'Experience the finest local cuisine and wines. Perfect for food enthusiasts and wine lovers. Sample dishes from top restaurants and wines from local vineyards.',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        time: '18:00',
        location: 'Grand Hotel Ballroom',
        category: categories[3]._id,
        maxAttendees: 100,
        organizer: users[2] ? users[2]._id : users[0]._id,
        status: 'active'
      },
      {
        title: 'Art Gallery Opening',
        description: 'Come celebrate the opening of our new contemporary art exhibition featuring works from emerging artists. Free admission and refreshments provided.',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        time: '19:00',
        location: 'Modern Art Gallery',
        category: categories[4]._id,
        maxAttendees: 150,
        organizer: users[0]._id,
        status: 'active'
      },
      {
        title: 'Basketball Tournament',
        description: 'Annual community basketball tournament. Teams of all skill levels welcome! Prizes for winners and lots of fun for everyone.',
        date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 28 days from now
        time: '08:00',
        location: 'Community Sports Center',
        category: categories[2]._id,
        maxAttendees: 200,
        organizer: users[1] ? users[1]._id : users[0]._id,
        status: 'active'
      }
    ];
    
    console.log('📝 Creating sample events...');
    const createdEvents = await Event.insertMany(sampleEvents);
    console.log(`✅ Created ${createdEvents.length} sample events:`);
    
    createdEvents.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.title}`);
      console.log(`      Date: ${event.date.toDateString()}`);
      console.log(`      Time: ${event.time}`);
      console.log(`      Location: ${event.location}`);
      console.log(`      Max Attendees: ${event.maxAttendees}`);
      console.log('');
    });
    
    console.log('🎉 Sample events created successfully!');
    console.log('💡 You can now view event details in your application');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createSampleEvents();
