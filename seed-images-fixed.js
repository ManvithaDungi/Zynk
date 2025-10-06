/**
 * Fixed Image Seeding Script for Social Timeline App
 * Seeds MongoDB database with image data from frontend/public/images directory
 * Uses exact connection string and removes problematic mongoose options
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

// Exact MongoDB connection string from env.txt
const MONGO_URI = 'mongodb+srv://manvitha:23318@cluster0.ju7oxft.mongodb.net/media';

// Simple connection function without problematic options
const connectDB = async () => {
  try {
    console.log(`🔗 Connecting to: ${MONGO_URI.replace(/\/\/.*@/, '//***:***@')}`);

    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // SSL/TLS configuration for MongoDB Atlas
      tls: true,
      tlsAllowInvalidCertificates: true, // For development
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

// Simple seeding function
const seedImages = async () => {
  try {
    console.log('🚀 Starting image seeding...\n');

    await connectDB();

    // Create or get a sample user
    let user = await User.findOne({ email: 'alex.johnson@example.com' });
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

    // Create categories if they don't exist
    const categoryNames = ['Music & Entertainment', 'Education & Workshops', 'Arts & Crafts', 'Games & Recreation'];
    const categories = {};

    for (const name of categoryNames) {
      let category = await Category.findOne({ name });
      if (!category) {
        category = await Category.create({
          name,
          description: `${name} events and activities`
        });
        console.log(`✅ Created category: ${name}`);
      }
      categories[name] = category;
    }

    // Create or get an album
    let album = await Album.findOne({ name: 'Event Highlights' });
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

    // Create events with images
    const eventData = [
      {
        filename: 'event1.jpg',
        title: 'Guess the Artist - Music Event',
        description: 'Join us for an exciting music event where you can guess your favorite artists!',
        category: 'Music & Entertainment'
      },
      {
        filename: 'event2.jpg',
        title: 'Balance Your Uni Life',
        description: 'Study and social balance workshop for university students',
        category: 'Education & Workshops'
      },
      {
        filename: 'event3.jpg',
        title: 'Friendship Bracelet Making',
        description: 'Craft afternoon - make beautiful friendship bracelets with friends',
        category: 'Arts & Crafts'
      }
    ];

    let eventCount = 0;
    for (const eventInfo of eventData) {
      const existingEvent = await Event.findOne({ title: eventInfo.title });
      if (!existingEvent) {
        const now = new Date();
        const eventDate = new Date(now.getTime() + (eventCount + 1) * 24 * 60 * 60 * 1000);

        await Event.create({
          title: eventInfo.title,
          description: eventInfo.description,
          date: eventDate,
          time: `${10 + (eventCount % 8)}:00`,
          location: `Venue ${eventCount + 1}, University Campus`,
          category: categories[eventInfo.category]._id,
          maxAttendees: 50 + (eventCount * 10),
          organizer: user._id,
          thumbnail: {
            url: `${BASE_URL}/images/events/${eventInfo.filename}`
          },
          status: 'active',
          visibility: 'public'
        });
        eventCount++;
        console.log(`✅ Created event: ${eventInfo.title}`);
      }
    }

    // Create posts with images
    const postData = [
      {
        filename: 'grand-opening-ceremony.png',
        description: 'Celebrating the grand opening of our new facility'
      },
      {
        filename: 'modern-event-venue.png',
        description: 'Our state-of-the-art event venue and facilities'
      }
    ];

    let postCount = 0;
    for (const postInfo of postData) {
      const existingPost = await Post.findOne({ caption: postInfo.description });
      if (!existingPost) {
        await Post.create({
          caption: postInfo.description,
          album: album._id,
          user: user._id,
          media: [{
            url: `${BASE_URL}/images/posts/${postInfo.filename}`,
            type: 'image',
            filename: postInfo.filename
          }],
          visibility: 'public',
          settings: {
            allowDownload: true,
            allowSharing: true,
            allowComments: true
          }
        });
        postCount++;
        console.log(`✅ Created post: ${postInfo.description}`);
      }
    }

    // Create memories with images
    const memoryData = [
      {
        filename: 'award-ceremony.png',
        title: 'Award Ceremony Highlights',
        description: 'Memorable moments from our annual award ceremony'
      },
      {
        filename: 'candid-moments.png',
        title: 'Candid Moments',
        description: 'Behind the scenes candid shots from our events'
      }
    ];

    let memoryCount = 0;
    for (const memoryInfo of memoryData) {
      const existingMemory = await Memory.findOne({ title: memoryInfo.title });
      if (!existingMemory) {
        await Memory.create({
          title: memoryInfo.title,
          description: memoryInfo.description,
          mediaUrl: `${BASE_URL}/images/memories/${memoryInfo.filename}`,
          mediaType: 'image',
          album: album._id,
          event: (await Event.findOne())._id, // Use first available event
          createdBy: user._id,
          likesCount: Math.floor(Math.random() * 50) + 5,
          commentsCount: Math.floor(Math.random() * 20) + 1
        });
        memoryCount++;
        console.log(`✅ Created memory: ${memoryInfo.title}`);
      }
    }

    console.log('\n✨ Image seeding completed successfully!');
    console.log(`📊 Summary: ${eventCount} events, ${postCount} posts, ${memoryCount} memories created`);
    console.log('📱 Images will appear on frontend via API routes');

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');

    process.exit(0);
  } catch (error) {
    console.error('💥 Error during seeding:', error.message);
    process.exit(1);
  }
};

// Run the seeding
seedImages();
