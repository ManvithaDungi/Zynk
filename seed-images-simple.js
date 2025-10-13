/**
 * Simple Image Seeding Script with Better Error Handling
 * Seeds MongoDB database with image data from frontend/public/images directory
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('./backend/models/User');
const Category = require('./backend/models/Category');
const Album = require('./backend/models/Album');
const Event = require('./backend/models/Event');
const Post = require('./backend/models/Post');
const Memory = require('./backend/models/Memory');

// Base URL for images
const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// MongoDB connection string
const MONGO_URI = 'mongodb+srv://manvitha:23318@cluster0.ju7oxft.mongodb.net/media';

// Connection with shorter timeout
const connectDB = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');

    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 20000, // 20 seconds
      connectTimeoutMS: 10000, // 10 seconds
      tls: true,
      authSource: 'admin',
      retryWrites: true,
      w: 'majority'
    });

    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Simple seeding function with better error handling
const seedImages = async () => {
  try {
    console.log('🚀 Starting simple image seeding...\n');

    await connectDB();

    // Set mongoose timeout
    mongoose.set('bufferCommands', false);

    // Create or get a sample user with timeout handling
    console.log('👤 Creating/finding user...');
    let user;
    try {
      user = await User.findOne({ email: 'alex.johnson@example.com' }).maxTimeMS(5000);
      if (!user) {
        user = await User.create({
          name: 'Alex Johnson',
          email: 'alex.johnson@example.com',
          password: 'password123',
          bio: 'Event organizer and community builder',
          isVerified: true
        });
        console.log('✅ Created sample user');
      } else {
        console.log('✅ Using existing user');
      }
    } catch (error) {
      console.log('⚠️ User operation timed out, creating new user...');
      user = await User.create({
        name: 'Alex Johnson',
        email: 'alex.johnson@example.com',
        password: 'password123',
        bio: 'Event organizer and community builder',
        isVerified: true
      });
      console.log('✅ Created sample user');
    }

    // Create categories with timeout handling
    console.log('📂 Creating categories...');
    const categoryNames = ['Music & Entertainment', 'Education & Workshops', 'Arts & Crafts', 'Games & Recreation'];
    const categories = {};

    for (const name of categoryNames) {
      try {
        let category = await Category.findOne({ name }).maxTimeMS(3000);
        if (!category) {
          category = await Category.create({
            name,
            description: `${name} events and activities`
          });
          console.log(`✅ Created category: ${name}`);
        }
        categories[name] = category;
      } catch (error) {
        console.log(`⚠️ Category ${name} operation timed out, skipping...`);
      }
    }

    // Create album with timeout handling
    console.log('📷 Creating album...');
    let album;
    try {
      album = await Album.findOne({ name: 'Event Highlights' }).maxTimeMS(3000);
      if (!album) {
        album = await Album.create({
          name: 'Event Highlights',
          description: 'Best moments from our events',
          createdBy: user._id,
          isPublic: true
        });
        console.log('✅ Created album');
      } else {
        console.log('✅ Using existing album');
      }
    } catch (error) {
      console.log('⚠️ Album operation timed out, creating new album...');
      album = await Album.create({
        name: 'Event Highlights',
        description: 'Best moments from our events',
        createdBy: user._id,
        isPublic: true
      });
      console.log('✅ Created album');
    }

    // Create one simple event
    console.log('🎉 Creating sample event...');
    try {
      const existingEvent = await Event.findOne({ title: 'Sample Music Event' }).maxTimeMS(3000);
      if (!existingEvent) {
        const eventDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
        
        await Event.create({
          title: 'Sample Music Event',
          description: 'A sample music event for testing',
          date: eventDate,
          time: '18:00',
          location: 'University Campus',
          category: categories['Music & Entertainment']?._id || new mongoose.Types.ObjectId(),
          maxAttendees: 50,
          organizer: user._id,
          thumbnail: {
            url: `${BASE_URL}/images/events/event1.jpg`
          },
          status: 'active'
        });
        console.log('✅ Created sample event');
      } else {
        console.log('✅ Using existing event');
      }
    } catch (error) {
      console.log('⚠️ Event creation timed out, skipping...');
    }

    // Create one simple memory
    console.log('💭 Creating sample memory...');
    try {
      const existingMemory = await Memory.findOne({ title: 'Sample Memory' }).maxTimeMS(3000);
      if (!existingMemory) {
        await Memory.create({
          title: 'Sample Memory',
          description: 'A sample memory for testing',
          mediaUrl: `${BASE_URL}/images/memories/memory1.jpg`,
          mediaType: 'image',
          album: album._id,
          createdBy: user._id,
          likesCount: 10,
          commentsCount: 3
        });
        console.log('✅ Created sample memory');
      } else {
        console.log('✅ Using existing memory');
      }
    } catch (error) {
      console.log('⚠️ Memory creation timed out, skipping...');
    }

    console.log('\n✨ Simple image seeding completed!');
    console.log('📱 Check your frontend to see the seeded data');

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');

    process.exit(0);
  } catch (error) {
    console.error('💥 Error during seeding:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Run the seeding
seedImages();
