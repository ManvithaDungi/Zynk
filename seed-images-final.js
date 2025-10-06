/**
 * Final Image Seeding Script
 * Uses direct connection string and avoids mongoose buffering issues
 */

const { MongoClient } = require('mongodb');

// Direct connection string (bypassing .env for reliability)
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://manvitha:23318@cluster0.ju7oxft.mongodb.net/media?retryWrites=true&w=majority&ssl=true&tlsAllowInvalidCertificates=true';

// Base URL for images
const BASE_URL = 'http://localhost:3000';

// Sample data to seed
const sampleData = {
  users: [{
    name: 'Alex Johnson',
    email: `event.organizer.${Date.now()}@example.com`,
    password: 'password1234',
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
    { name: 'Music & Fun 2024', description: 'Concerts, shows, and entertainment events' },
    { name: 'Education & Workshops 2024', description: 'Learning and skill development events' },
    { name: 'Arts & Crafts 2024', description: 'Creative and artistic activities' },
    { name: 'Games & Recreation 2024', description: 'Fun games and recreational activities' }
  ],

  albums: [{
    name: 'Event Highlights 2024',
    description: 'Best moments from our events',
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }],

  events: [
    {
      title: 'Guess the Artist - Music Event 2024',
      description: 'It\'s the poster of a music event, with title "Guess the Artist". Join us for an exciting music event where you can guess your favorite artists!',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      time: '10:00',
      location: 'University Campus Main Hall',
      maxAttendees: 100,
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
      title: 'Balance Your Uni Life 2024',
      description: 'Post of an event with description: "Balance your university life at study social". A workshop to help students balance their academic and social life.',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      time: '14:00',
      location: 'Student Center, Room 201',
      maxAttendees: 75,
      status: 'active',
      visibility: 'public',
      isRecurring: false,
      recurringPattern: 'none',
      allowWaitlist: true,
      waitlistLimit: 25,
      allowChat: true,
      allowReviews: true,
      allowPolls: true,
      shareable: true,
      settings: { allowDownload: true, allowSharing: true, allowComments: true },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Friendship Bracelet Making Crafternoon 2024',
      description: 'Friendship bracelet making crafternoon - A fun crafting session where you can make beautiful friendship bracelets with your friends.',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      time: '15:00',
      location: 'Arts & Crafts Center',
      maxAttendees: 30,
      status: 'active',
      visibility: 'public',
      isRecurring: false,
      recurringPattern: 'none',
      allowWaitlist: true,
      waitlistLimit: 10,
      allowChat: true,
      allowReviews: true,
      allowPolls: false,
      shareable: true,
      settings: { allowDownload: true, allowSharing: true, allowComments: true },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'AP Club Interest Meeting 2024',
      description: 'AP club interest meeting to boost your exam scores. Learn study strategies and join our Advanced Placement preparation community.',
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      time: '16:00',
      location: 'Academic Success Center, Conference Room A',
      maxAttendees: 50,
      status: 'active',
      visibility: 'public',
      isRecurring: false,
      recurringPattern: 'none',
      allowWaitlist: true,
      waitlistLimit: 20,
      allowChat: true,
      allowReviews: true,
      allowPolls: true,
      shareable: true,
      settings: { allowDownload: true, allowSharing: true, allowComments: true },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Board Games Night 2024',
      description: 'Poster for a board games event - Join us for an exciting evening of board games and socializing with fellow students.',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      time: '19:00',
      location: 'Student Recreation Center',
      maxAttendees: 40,
      status: 'active',
      visibility: 'public',
      isRecurring: false,
      recurringPattern: 'none',
      allowWaitlist: true,
      waitlistLimit: 15,
      allowChat: true,
      allowReviews: true,
      allowPolls: false,
      shareable: true,
      settings: { allowDownload: true, allowSharing: true, allowComments: true },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  posts: [
    {
      caption: '🎉 Grand Opening Ceremony 2024 - Celebrating the launch of our amazing new student facility! Come join us for food, fun, and community building.',
      visibility: 'public',
      settings: { allowDownload: true, allowSharing: true, allowComments: true },
      likes: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      caption: '🏛️ Modern Event Venue 2024 - Check out our state-of-the-art facilities perfect for hosting events, meetings, and gatherings. Modern design meets functionality!',
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
      title: '🏆 Award Ceremony Highlights 2024',
      description: 'Memorable moments from our annual award ceremony celebrating student achievements and recognizing outstanding contributions to campus life.',
      mediaType: 'image',
      likesCount: 15,
      commentsCount: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: '📸 Candid Moments 2024',
      description: 'Behind the scenes candid shots from our events - capturing genuine emotions and spontaneous moments that make our community special.',
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
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      tls: true,
      tlsAllowInvalidCertificates: true,
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

      // Insert users first
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

      // Update events with thumbnails - assign different images to each event
      const eventImages = ['event1.jpg', 'event2.jpg', 'event3.jpg', 'event4.jpg', 'event5.jpg'];
      for (let i = 0; i < eventImages.length; i++) {
        await eventsCollection.updateOne(
          { _id: eventsResult.insertedIds[i] },
          {
            $set: {
              thumbnail: {
                url: `${BASE_URL}/images/events/${eventImages[i]}`
              }
            }
          }
        );
      }

      // Update posts with media - assign different images to each post
      const postImages = ['grand-opening-ceremony.png', 'modern-event-venue.png'];
      for (let i = 0; i < postImages.length; i++) {
        await postsCollection.updateOne(
          { _id: postsResult.insertedIds[i] },
          {
            $set: {
              media: [{
                url: `${BASE_URL}/images/posts/${postImages[i]}`,
                type: 'image',
                filename: postImages[i]
              }]
            }
          }
        );
      }

      // Update memories with media URLs - assign different images to each memory
      const memoryImages = ['award-ceremony.png', 'candid-moments.png'];
      for (let i = 0; i < memoryImages.length; i++) {
        await memoriesCollection.updateOne(
          { _id: memoriesResult.insertedIds[i] },
          {
            $set: {
              mediaUrl: `${BASE_URL}/images/memories/${memoryImages[i]}`
            }
          }
        );
      }

      console.log('\n✨ Database seeding completed successfully!');
      console.log('📊 Summary:');
      console.log(`   - Users: ${usersResult.insertedCount}`);
      console.log(`   - Categories: ${categoriesResult.insertedCount}`);
      console.log(`   - Albums: ${albumsResult.insertedCount}`);
      console.log(`   - Events: ${eventsResult.insertedCount}`);
      console.log(`   - Posts: ${postsResult.insertedCount}`);
      console.log(`   - Memories: ${memoriesResult.insertedCount}`);
      console.log('\n🎉 Your social timeline app is now populated with image data!');
      console.log('📱 Images will automatically appear on the frontend via API routes');

    await client.close();
    console.log('🔌 Database connection closed');

    process.exit(0);
  } catch (error) {
    console.error('💥 Error during seeding:', error.message);
    process.exit(1);
  }
};

// Run the seeding
seedImages();
