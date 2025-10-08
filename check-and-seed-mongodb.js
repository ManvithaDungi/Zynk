const mongoose = require('mongoose');
const User = require('./backend/models/User');
const Event = require('./backend/models/Event');
const Category = require('./backend/models/Category');
const Message = require('./backend/models/Message');
const Poll = require('./backend/models/Poll');
require('dotenv').config();

async function checkAndSeedMongoDB() {
  try {
    console.log('🔍 Checking MongoDB database state...\n');
    
    // Connect to database
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in environment variables');
      return;
    }
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 15000,
      connectTimeoutMS: 10000,
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
    
    // Check existing data
    console.log('📊 Database Statistics:');
    console.log('====================');
    
    const userCount = await User.countDocuments();
    const eventCount = await Event.countDocuments();
    const categoryCount = await Category.countDocuments();
    const messageCount = await Message.countDocuments();
    const pollCount = await Poll.countDocuments();
    
    console.log(`👥 Users: ${userCount}`);
    console.log(`📅 Events: ${eventCount}`);
    console.log(`🏷️  Categories: ${categoryCount}`);
    console.log(`💬 Messages: ${messageCount}`);
    console.log(`📊 Polls: ${pollCount}`);
    console.log('');
    
    // Check if we need to seed data
    if (userCount === 0) {
      console.log('❌ No users found. Please run the main seed script first.');
      return;
    }
    
    // Get sample users
    const users = await User.find({}).limit(5);
    console.log(`👤 Sample users found:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
    });
    console.log('');
    
    // Create categories if they don't exist
    let categories = await Category.find({});
    if (categories.length === 0) {
      console.log('📝 Creating sample categories...');
      const sampleCategories = [
        { name: 'Technology', description: 'Tech events and conferences' },
        { name: 'Music', description: 'Concerts and music events' },
        { name: 'Sports', description: 'Sports events and tournaments' },
        { name: 'Food & Drink', description: 'Food festivals and tastings' },
        { name: 'Art & Culture', description: 'Art exhibitions and cultural events' },
        { name: 'Business', description: 'Business networking and conferences' },
        { name: 'Education', description: 'Educational workshops and seminars' },
        { name: 'Health & Wellness', description: 'Health and wellness events' }
      ];
      
      categories = await Category.insertMany(sampleCategories);
      console.log(`✅ Created ${categories.length} categories`);
    } else {
      console.log(`📝 Found ${categories.length} existing categories`);
    }
    console.log('');
    
    // Create events if they don't exist
    if (eventCount === 0) {
      console.log('📝 Creating sample events...');
      
      const sampleEvents = [
        {
          title: 'Tech Conference 2024',
          description: 'Join us for the biggest technology conference of the year! Learn about the latest trends in AI, blockchain, and web development. Network with industry leaders and discover new opportunities in the tech world.',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          time: '09:00',
          location: 'Convention Center, Downtown',
          category: categories[0]._id,
          maxAttendees: 500,
          organizer: users[0]._id,
          status: 'active',
          allowChat: true,
          allowReviews: true,
          allowPolls: true,
          shareable: true
        },
        {
          title: 'Summer Music Festival',
          description: 'A day filled with amazing music, food trucks, and great vibes. Featuring local and international artists. Bring your friends and family for an unforgettable experience under the stars!',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          time: '12:00',
          location: 'Central Park',
          category: categories[1]._id,
          maxAttendees: 1000,
          organizer: users[1] ? users[1]._id : users[0]._id,
          status: 'active',
          allowChat: true,
          allowReviews: true,
          allowPolls: true,
          shareable: true
        },
        {
          title: 'Food & Wine Tasting',
          description: 'Experience the finest local cuisine and wines. Perfect for food enthusiasts and wine lovers. Sample dishes from top restaurants and wines from local vineyards. Includes guided tastings and chef demonstrations.',
          date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
          time: '18:00',
          location: 'Grand Hotel Ballroom',
          category: categories[3]._id,
          maxAttendees: 100,
          organizer: users[2] ? users[2]._id : users[0]._id,
          status: 'active',
          allowChat: true,
          allowReviews: true,
          allowPolls: true,
          shareable: true
        },
        {
          title: 'Art Gallery Opening',
          description: 'Come celebrate the opening of our new contemporary art exhibition featuring works from emerging artists. Free admission and refreshments provided. Meet the artists and explore their creative process.',
          date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          time: '19:00',
          location: 'Modern Art Gallery',
          category: categories[4]._id,
          maxAttendees: 150,
          organizer: users[0]._id,
          status: 'active',
          allowChat: true,
          allowReviews: true,
          allowPolls: true,
          shareable: true
        },
        {
          title: 'Basketball Tournament',
          description: 'Annual community basketball tournament. Teams of all skill levels welcome! Prizes for winners and lots of fun for everyone. Registration includes team jerseys and refreshments.',
          date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 28 days from now
          time: '08:00',
          location: 'Community Sports Center',
          category: categories[2]._id,
          maxAttendees: 200,
          organizer: users[1] ? users[1]._id : users[0]._id,
          status: 'active',
          allowChat: true,
          allowReviews: true,
          allowPolls: true,
          shareable: true
        },
        {
          title: 'Business Networking Event',
          description: 'Connect with local entrepreneurs and business leaders. Perfect for networking, finding new opportunities, and sharing business insights. Includes keynote speaker and panel discussion.',
          date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
          time: '17:30',
          location: 'Business Center',
          category: categories[5]._id,
          maxAttendees: 300,
          organizer: users[2] ? users[2]._id : users[0]._id,
          status: 'active',
          allowChat: true,
          allowReviews: true,
          allowPolls: true,
          shareable: true
        },
        {
          title: 'Web Development Workshop',
          description: 'Learn modern web development techniques including React, Node.js, and database design. Hands-on coding session with experienced instructors. Perfect for beginners and intermediate developers.',
          date: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000), // 42 days from now
          time: '10:00',
          location: 'Tech Hub',
          category: categories[6]._id,
          maxAttendees: 50,
          organizer: users[0]._id,
          status: 'active',
          allowChat: true,
          allowReviews: true,
          allowPolls: true,
          shareable: true
        },
        {
          title: 'Yoga & Meditation Retreat',
          description: 'A peaceful day of yoga, meditation, and mindfulness. Perfect for relaxation and stress relief. Includes healthy lunch and meditation sessions. All levels welcome.',
          date: new Date(Date.now() + 49 * 24 * 60 * 60 * 1000), // 49 days from now
          time: '08:30',
          location: 'Zen Garden Retreat',
          category: categories[7]._id,
          maxAttendees: 80,
          organizer: users[1] ? users[1]._id : users[0]._id,
          status: 'active',
          allowChat: true,
          allowReviews: true,
          allowPolls: true,
          shareable: true
        }
      ];
      
      const createdEvents = await Event.insertMany(sampleEvents);
      console.log(`✅ Created ${createdEvents.length} sample events:`);
      
      createdEvents.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.title}`);
        console.log(`      Date: ${event.date.toDateString()}`);
        console.log(`      Time: ${event.time}`);
        console.log(`      Location: ${event.location}`);
        console.log(`      Max Attendees: ${event.maxAttendees}`);
        console.log(`      Organizer: ${users.find(u => u._id.toString() === event.organizer.toString())?.name || 'Unknown'}`);
        console.log('');
      });
      
    } else {
      console.log(`📅 Found ${eventCount} existing events`);
      
      // Show existing events
      const existingEvents = await Event.find({})
        .populate('organizer', 'name email')
        .populate('category', 'name')
        .limit(5);
      
      console.log('📋 Sample existing events:');
      existingEvents.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.title}`);
        console.log(`      Date: ${event.date.toDateString()}`);
        console.log(`      Organizer: ${event.organizer?.name || 'Unknown'}`);
        console.log(`      Category: ${event.category?.name || 'Unknown'}`);
        console.log(`      Status: ${event.status}`);
        console.log('');
      });
    }
    
    // Final statistics
    console.log('📊 Final Database Statistics:');
    console.log('============================');
    const finalUserCount = await User.countDocuments();
    const finalEventCount = await Event.countDocuments();
    const finalCategoryCount = await Category.countDocuments();
    const finalMessageCount = await Message.countDocuments();
    const finalPollCount = await Poll.countDocuments();
    
    console.log(`👥 Users: ${finalUserCount}`);
    console.log(`📅 Events: ${finalEventCount}`);
    console.log(`🏷️  Categories: ${finalCategoryCount}`);
    console.log(`💬 Messages: ${finalMessageCount}`);
    console.log(`📊 Polls: ${finalPollCount}`);
    
    console.log('\n🎉 Database seeding completed successfully!');
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

checkAndSeedMongoDB();
