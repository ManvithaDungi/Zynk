/**
 * Final Image Seeding Script
 * Uses direct connection string and avoids mongoose buffering issues
 */

const { MongoClient } = require('mongodb');

// Direct connection string (bypassing .env for reliability)
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://manvitha:23318@cluster0.ju7oxft.mongodb.net/media?retryWrites=true&w=majority&ssl=true';

// Base URL for images
const BASE_URL = 'http://localhost:3000';

// Sample data to seed
const sampleData = {
  users: [{
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    password: 'password123',
    bio: 'Event organizer and community builder',
    isVerified: true,
    followers: [],
    following: [],
    postsCount: 0,
    isPrivate: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }],

  categories: [
    { name: 'Music & Entertainment', description: 'Concerts, shows, and entertainment events' },
    { name: 'Education & Workshops', description: 'Learning and skill development events' },
    { name: 'Arts & Crafts', description: 'Creative and artistic activities' },
    { name: 'Games & Recreation', description: 'Fun games and recreational activities' }
  ],

  albums: [{
    name: 'Event Highlights',
    description: 'Best moments from our events',
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }],

  events: [
    {
      title: 'Guess the Artist - Music Event',
      description: 'Join us for an exciting music event where you can guess your favorite artists!',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      time: '10:00',
      location: 'Venue 1, University Campus',
      maxAttendees: 50,
      status: 'active',
      visibility: 'public',
      isRecurring: false,
      recurringPattern: 'none',
      allowWaitlist: true,
      waitlistLimit: 50,
      allowChat: true,
      allowReviews: true,
      allowPolls: true,
      shareable: true,
      settings: { allowDownload: true, allowSharing: true, allowComments: true },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Balance Your Uni Life',
      description: 'Study and social balance workshop for university students',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      time: '14:00',
      location: 'Venue 2, University Campus',
      maxAttendees: 60,
      status: 'active',
      visibility: 'public',
      isRecurring: false,
      recurringPattern: 'none',
      allowWaitlist: true,
      waitlistLimit: 50,
      allowChat: true,
      allowReviews: true,
      allowPolls: true,
      shareable: true,
      settings: { allowDownload: true, allowSharing: true, allowComments: true },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  posts: [
    {
      caption: 'Celebrating the grand opening of our new facility',
      visibility: 'public',
      settings: { allowDownload: true, allowSharing: true, allowComments: true },
      likes: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      caption: 'Our state-of-the-art event venue and facilities',
      visibility: 'public',
      settings: { allowDownload: true, allowSharing: true, allowComments: true },
      likes: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  memories: [
    {
      title: 'Award Ceremony Highlights',
      description: 'Memorable moments from our annual award ceremony',
      mediaType: 'image',
      likesCount: 15,
      commentsCount: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Candid Moments',
      description: 'Behind the scenes candid shots from our events',
      mediaType: 'image',
      likesCount: 23,
      commentsCount: 8,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log(`🔗 Connecting to MongoDB Atlas cluster...`);

    const client = new MongoClient(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      tls: true,
      tlsInsecure: true,
      authSource: 'admin',
      retryWrites: true,
      w: 'majority'
    });

    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');

    return client;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Main seeding function
const seedImages = async () => {
  try {
    console.log('🚀 Starting image database seeding...\n');

    const client = await connectDB();
    const db = client.db();

    // Check if database contains data (but still proceed with seeding)
    const collections = await db.listCollections().toArray();
    const hasData = collections.some(col => col.name !== 'system.indexes');

    if (hasData) {
      console.log('📊 Database contains existing data - adding new data alongside existing content');
      console.log('⚠️  Warning: This may create duplicate entries if data already exists');
    } else {
      console.log('📦 Database is empty - seeding sample data...');
    }

    // Seed data in correct order
    const usersCollection = db.collection('users');
    const categoriesCollection = db.collection('categories');
    const albumsCollection = db.collection('albums');
    const eventsCollection = db.collection('events');
    const postsCollection = db.collection('posts');
    const memoriesCollection = db.collection('memories');

    // Insert sample data
    const usersResult = await usersCollection.insertMany(sampleData.users);
    const userId = usersResult.insertedIds[0];
    console.log(`✅ Created ${usersResult.insertedCount} users`);

    // Insert categories
    const categoriesResult = await categoriesCollection.insertMany(sampleData.categories);
    console.log(`✅ Created ${categoriesResult.insertedCount} categories`);

    // Insert albums (with user reference)
    const albumData = { ...sampleData.albums[0], createdBy: userId };
    const albumsResult = await albumsCollection.insertMany([albumData]);
    const albumId = albumsResult.insertedIds[0];
    console.log(`✅ Created ${albumsResult.insertedCount} albums`);

    // Insert events (with category and organizer references)
    const eventsWithRefs = sampleData.events.map(event => ({
      ...event,
      category: categoriesResult.insertedIds[0],
      organizer: userId
    }));
    const eventsResult = await eventsCollection.insertMany(eventsWithRefs);
    console.log(`✅ Created ${eventsResult.insertedCount} events`);

    // Insert posts (with user and album references)
    const postsWithRefs = sampleData.posts.map(post => ({
      ...post,
      user: userId,
      album: albumId
    }));
    const postsResult = await postsCollection.insertMany(postsWithRefs);
    console.log(`✅ Created ${postsResult.insertedCount} posts`);

    // Insert memories (with references)
    const eventId = eventsResult.insertedIds[0];
    const memoriesWithRefs = sampleData.memories.map(memory => ({
      ...memory,
      album: albumId,
      event: eventId,
      createdBy: userId
    }));
    const memoriesResult = await memoriesCollection.insertMany(memoriesWithRefs);
    console.log(`✅ Created ${memoriesResult.insertedCount} memories`);

    // Update with image URLs
    console.log('🖼️  Adding image URLs...');

    // Update events with thumbnails
    await eventsCollection.updateMany(
      {},
      {
        $set: {
          thumbnail: {
            url: `${BASE_URL}/images/events/event1.jpg`
          }
        }
      }
    );

    // Update posts with media
    await postsCollection.updateMany(
      {},
      {
        $set: {
          media: [{
            url: `${BASE_URL}/images/posts/grand-opening-ceremony.png`,
            type: 'image',
            filename: 'grand-opening-ceremony.png'
          }]
        }
      }
    );

    // Update memories with media URLs
    await memoriesCollection.updateMany(
      {},
      {
        $set: {
          mediaUrl: `${BASE_URL}/images/memories/award-ceremony.png`
        }
      }
    );

    console.log('✅ References and image URLs updated');

    console.log('\n✨ Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${usersResult.insertedCount}`);
    console.log(`   - Categories: ${categoriesResult.insertedCount}`);
    console.log(`   - Albums: ${albumsResult.insertedCount}`);
    console.log(`   - Events: ${eventsResult.insertedCount}`);
    console.log(`   - Posts: ${postsResult.insertedCount}`);
    console.log(`   - Memories: ${memoriesResult.insertedCount}`);
    console.log('\n🎉 Your social timeline app is now populated with image data!');
    console.log('📱 Images will appear on frontend via API routes');

    await client.close();
    console.log('\n🔌 Database connection closed');

    process.exit(0);
  } catch (error) {
    console.error('💥 Error during seeding:', error.message);
    process.exit(1);
  }
};

// Run the seeding
seedImages();
