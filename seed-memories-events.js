/**
 * Memory and Event Seeding Script
 * Creates memories and events for test3626@gmail.com based on info.txt files
 * Uses the existing user collection and creates albums, events, and memories
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const User = require('./backend/models/User');
const Event = require('./backend/models/Event');
const Album = require('./backend/models/Album');
const Memory = require('./backend/models/Memory');
const Category = require('./backend/models/Category');
const Tag = require('./backend/models/Tag');

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log(`🔗 Connecting to MongoDB...`);

    // Disable buffering to avoid timeout issues
    mongoose.set('bufferCommands', false);
    mongoose.set('bufferTimeoutMS', 30000);

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 75000,
      bufferCommands: false,
      bufferTimeoutMS: 30000
    });
    
    console.log('✅ Connected to MongoDB');
    console.log(`📁 Database: ${mongoose.connection.db.databaseName}`);
    
    // Wait for connection to be ready
    if (mongoose.connection.readyState !== 1) {
      console.log('⏳ Waiting for connection to be ready...');
      await new Promise(resolve => {
        mongoose.connection.once('open', resolve);
      });
    }
    
    console.log('✅ Connection ready');
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

/**
 * Find or create the test user using native MongoDB driver
 */
async function findOrCreateTestUser() {
  try {
    console.log('👤 Finding test user: test3626@gmail.com');
    
    // Use native MongoDB driver instead of Mongoose for this operation
    const db = mongoose.connection.db;
    const usersCollection = db.collection('user');
    
    let user = await usersCollection.findOne({ email: 'test3626@gmail.com' });
    
    if (!user) {
      console.log('➕ Creating test user...');
      
      // Hash password manually
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('pass3626', 12);
      
      const userData = {
        name: 'Test User 3626',
        username: 'test3626',
        email: 'test3626@gmail.com',
        password: hashedPassword,
        bio: 'Test user for seeding memories and events',
        isActive: true,
        status: 'online',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await usersCollection.insertOne(userData);
      user = { _id: result.insertedId, ...userData };
      console.log('✅ Test user created successfully');
    } else {
      console.log('✅ Test user found');
    }
    
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   ID: ${user._id}`);
    
    return user;
  } catch (error) {
    console.error('❌ Error with test user:', error.message);
    throw error;
  }
}

/**
 * Find or create categories using native MongoDB driver
 */
async function findOrCreateCategories() {
  try {
    console.log('📂 Setting up categories...');
    
    const db = mongoose.connection.db;
    const categoriesCollection = db.collection('categories');
    
    const categories = [
      { name: 'Music', description: 'Music events and concerts', icon: '🎵', color: '#FF6B6B', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Education', description: 'Educational events and workshops', icon: '📚', color: '#4ECDC4', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Arts & Crafts', description: 'Creative and artistic events', icon: '🎨', color: '#45B7D1', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Entertainment', description: 'Fun and entertainment events', icon: '🎮', color: '#96CEB4', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Social', description: 'Social gatherings and meetups', icon: '👥', color: '#FFEAA7', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Science', description: 'Science and laboratory events', icon: '🔬', color: '#DDA0DD', isActive: true, createdAt: new Date(), updatedAt: new Date() }
    ];
    
    const createdCategories = [];
    
    for (const catData of categories) {
      let category = await categoriesCollection.findOne({ name: catData.name });
      
      if (!category) {
        const result = await categoriesCollection.insertOne(catData);
        category = { _id: result.insertedId, ...catData };
        console.log(`   ✅ Created category: ${catData.name}`);
      } else {
        console.log(`   ✅ Found category: ${catData.name}`);
      }
      
      createdCategories.push(category);
    }
    
    return createdCategories;
  } catch (error) {
    console.error('❌ Error with categories:', error.message);
    throw error;
  }
}

/**
 * Find or create tags using native MongoDB driver
 */
async function findOrCreateTags() {
  try {
    console.log('🏷️  Setting up tags...');
    
    const db = mongoose.connection.db;
    const tagsCollection = db.collection('tags');
    
    const tags = [
      'music', 'trivia', 'study', 'social', 'crafts', 'friendship', 
      'academic', 'exams', 'board-games', 'lab', 'biochemistry', 
      'food', 'restaurant', 'group-study', 'guitar', 'singing'
    ];
    
    const createdTags = [];
    
    for (const tagName of tags) {
      let tag = await tagsCollection.findOne({ name: tagName });
      
      if (!tag) {
        const tagData = { 
          name: tagName, 
          createdAt: new Date(), 
          updatedAt: new Date() 
        };
        const result = await tagsCollection.insertOne(tagData);
        tag = { _id: result.insertedId, ...tagData };
        console.log(`   ✅ Created tag: ${tagName}`);
      } else {
        console.log(`   ✅ Found tag: ${tagName}`);
      }
      
      createdTags.push(tag);
    }
    
    return createdTags;
  } catch (error) {
    console.error('❌ Error with tags:', error.message);
    throw error;
  }
}

/**
 * Create events based on events info.txt
 */
async function createEvents(user, categories, tags) {
  try {
    console.log('🎯 Creating events from events info.txt...');
    
    // Read events info.txt
    const eventsInfoPath = path.join(__dirname, 'frontend/public/images/info.txt');
    const eventsInfoContent = fs.readFileSync(eventsInfoPath, 'utf8');
    const eventLines = eventsInfoContent.split('\n').filter(line => line.trim());
    
    console.log('📄 Parsed events info.txt:');
    eventLines.forEach((line, index) => {
      console.log(`   ${index + 1}. ${line.trim()}`);
    });
    
    const events = [];
    
    for (let i = 0; i < eventLines.length; i++) {
      const line = eventLines[i];
      const parts = line.split(':');
      
      if (parts.length >= 2) {
        const imagePath = parts[0].trim();
        const description = parts[1].trim();
        
        // Extract event number from image path
        const eventNumber = imagePath.match(/event(\d+)/)?.[1];
        
        if (eventNumber) {
          let eventData;
          
          // Create event data based on description
          if (description.toLowerCase().includes('music') && description.toLowerCase().includes('guess the artist')) {
            eventData = {
              title: 'Guess the Artist - Music Event',
              description: 'Join us for an exciting music trivia night! Test your knowledge of artists and songs. Prizes for the winners!',
              date: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000),
              time: '19:00',
              location: 'Music Hall, University Campus',
              category: categories.find(c => c.name === 'Music')._id,
              tags: [tags.find(t => t.name === 'music')._id, tags.find(t => t.name === 'trivia')._id],
              maxAttendees: 100,
              organizer: user._id,
              thumbnail: {
                url: `/images/events/event${eventNumber}.jpg`,
                publicId: null
              }
            };
          } else if (description.toLowerCase().includes('balance') && description.toLowerCase().includes('uni life')) {
            eventData = {
              title: 'Balance Your Uni Life',
              description: 'Learn how to balance your academic, social, and personal life effectively. Perfect for students and young professionals.',
              date: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000),
              time: '14:00',
              location: 'University Conference Room',
              category: categories.find(c => c.name === 'Education')._id,
              tags: [tags.find(t => t.name === 'study')._id, tags.find(t => t.name === 'social')._id],
              maxAttendees: 75,
              organizer: user._id,
              thumbnail: {
                url: `/images/events/event${eventNumber}.jpg`,
                publicId: null
              }
            };
          } else if (description.toLowerCase().includes('friendship bracelet')) {
            eventData = {
              title: 'Friendship Bracelet Making Crafternoon',
              description: 'Learn to make beautiful friendship bracelets! All materials provided. Perfect for beginners and craft enthusiasts.',
              date: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000),
              time: '15:00',
              location: 'Art Studio',
              category: categories.find(c => c.name === 'Arts & Crafts')._id,
              tags: [tags.find(t => t.name === 'crafts')._id, tags.find(t => t.name === 'friendship')._id],
              maxAttendees: 30,
              organizer: user._id,
              thumbnail: {
                url: `/images/events/event${eventNumber}.jpg`,
                publicId: null
              }
            };
          } else if (description.toLowerCase().includes('ap club') && description.toLowerCase().includes('exam')) {
            eventData = {
              title: 'AP Club Interest Meeting',
              description: 'Join our AP Club to boost your exam scores! Learn study strategies, get practice materials, and connect with other AP students.',
              date: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000),
              time: '16:00',
              location: 'Student Union',
              category: categories.find(c => c.name === 'Education')._id,
              tags: [tags.find(t => t.name === 'academic')._id, tags.find(t => t.name === 'exams')._id],
              maxAttendees: 40,
              organizer: user._id,
              thumbnail: {
                url: `/images/events/event${eventNumber}.jpg`,
                publicId: null
              }
            };
          } else if (description.toLowerCase().includes('board games')) {
            eventData = {
              title: 'Board Games Night 2024',
              description: 'Join us for an evening of fun board games! Bring your favorite games or try new ones. Snacks and drinks provided.',
              date: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000),
              time: '19:00',
              location: 'Community Center',
              category: categories.find(c => c.name === 'Entertainment')._id,
              tags: [tags.find(t => t.name === 'board-games')._id],
              maxAttendees: 50,
              organizer: user._id,
              thumbnail: {
                url: `/images/events/event${eventNumber}.jpg`,
                publicId: null
              }
            };
          }
          
          if (eventData) {
            const db = mongoose.connection.db;
            const eventsCollection = db.collection('events');
            
            const eventWithTimestamps = {
              ...eventData,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            const result = await eventsCollection.insertOne(eventWithTimestamps);
            const event = { _id: result.insertedId, ...eventWithTimestamps };
            events.push(event);
            console.log(`   ✅ Created event: ${event.title}`);
          }
        }
      }
    }
    
    return events;
  } catch (error) {
    console.error('❌ Error creating events:', error.message);
    throw error;
  }
}

/**
 * Create albums and memories based on memories info.txt
 */
async function createAlbumsAndMemories(user, events) {
  try {
    console.log('📸 Creating albums and memories from memories info.txt...');
    
    // Read memories info.txt
    const memoriesInfoPath = path.join(__dirname, 'frontend/public/images/memories/info.txt');
    const memoriesInfoContent = fs.readFileSync(memoriesInfoPath, 'utf8');
    const memoryLines = memoriesInfoContent.split('\n').filter(line => line.trim());
    
    console.log('📄 Parsed memories info.txt:');
    memoryLines.forEach((line, index) => {
      console.log(`   ${index + 1}. ${line.trim()}`);
    });
    
    const albums = [];
    const memories = [];
    
    // Create Food Fest album
    console.log('🍽️  Creating Food Fest album...');
    const db = mongoose.connection.db;
    const albumsCollection = db.collection('albums');
    
    const foodFestAlbumData = {
      name: 'Food Fest',
      description: 'Memories from our food festival event',
      createdBy: user._id,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const foodFestResult = await albumsCollection.insertOne(foodFestAlbumData);
    const foodFestAlbum = { _id: foodFestResult.insertedId, ...foodFestAlbumData };
    albums.push(foodFestAlbum);
    console.log('   ✅ Created Food Fest album');
    
    // Add memories to Food Fest album
    const foodMemories = [
      { image: 'mem6.jpg', description: 'A bunch of people eating at the food fest' },
      { image: 'mem7.jpg', description: 'College students eating together' },
      { image: 'mem5.jpg', description: 'College students eating in a restaurant' }
    ];
    
    const memoriesCollection = db.collection('memories');
    
    for (const memData of foodMemories) {
      const memoryData = {
        title: `Food Fest Memory - ${memData.image}`,
        description: memData.description,
        mediaUrl: `/images/memories/${memData.image}`,
        mediaType: 'image',
        album: foodFestAlbum._id,
        createdBy: user._id,
        visibility: 'public',
        likesCount: 0,
        commentsCount: 0,
        settings: {
          allowDownload: true,
          allowSharing: true,
          allowComments: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const memoryResult = await memoriesCollection.insertOne(memoryData);
      const memory = { _id: memoryResult.insertedId, ...memoryData };
      memories.push(memory);
      console.log(`   ✅ Added memory: ${memData.image}`);
    }
    
    // Create Biochem Lab album
    console.log('🔬 Creating Biochem Lab album...');
    const biochemAlbumData = {
      name: 'Biochem Lab',
      description: 'Memories from biochemistry laboratory sessions',
      createdBy: user._id,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const biochemResult = await albumsCollection.insertOne(biochemAlbumData);
    const biochemAlbum = { _id: biochemResult.insertedId, ...biochemAlbumData };
    albums.push(biochemAlbum);
    console.log('   ✅ Created Biochem Lab album');
    
    // Add memories to Biochem Lab album
    const labMemories = [
      { image: 'mem1.jpg', description: 'Two students working in a lab with test tubes' },
      { image: 'mem9.jpg', description: 'Friends in a bio chem lab' },
      { image: 'mem2.jpg', description: 'Two students working in bio chem lab' }
    ];
    
    for (const memData of labMemories) {
      const memoryData = {
        title: `Lab Memory - ${memData.image}`,
        description: memData.description,
        mediaUrl: `/images/memories/${memData.image}`,
        mediaType: 'image',
        album: biochemAlbum._id,
        createdBy: user._id,
        visibility: 'public',
        likesCount: 0,
        commentsCount: 0,
        settings: {
          allowDownload: true,
          allowSharing: true,
          allowComments: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const memoryResult = await memoriesCollection.insertOne(memoryData);
      const memory = { _id: memoryResult.insertedId, ...memoryData };
      memories.push(memory);
      console.log(`   ✅ Added memory: ${memData.image}`);
    }
    
    // Create Study Group album and link to "Balance Your Uni Life" event
    console.log('📚 Creating Study Group album...');
    const balanceEvent = events.find(e => e.title === 'Balance Your Uni Life');
    const studyGroupAlbumData = {
      name: 'Study Group',
      description: 'Study group sessions and activities',
      eventId: balanceEvent ? balanceEvent._id : null,
      createdBy: user._id,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const studyGroupResult = await albumsCollection.insertOne(studyGroupAlbumData);
    const studyGroupAlbum = { _id: studyGroupResult.insertedId, ...studyGroupAlbumData };
    albums.push(studyGroupAlbum);
    console.log('   ✅ Created Study Group album');
    
    // Add study group memory
    const studyMemoryData = {
      title: 'Study Group Session',
      description: 'Students studying together in a group setting',
      mediaUrl: '/images/memories/mem8.jpg',
      mediaType: 'image',
      album: studyGroupAlbum._id,
      event: balanceEvent ? balanceEvent._id : null,
      createdBy: user._id,
      visibility: 'public',
      likesCount: 0,
      commentsCount: 0,
      settings: {
        allowDownload: true,
        allowSharing: true,
        allowComments: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const studyMemoryResult = await memoriesCollection.insertOne(studyMemoryData);
    const studyMemory = { _id: studyMemoryResult.insertedId, ...studyMemoryData };
    memories.push(studyMemory);
    console.log('   ✅ Added study group memory');
    
    // Create standalone memories
    console.log('🎲 Creating standalone memories...');
    
    // Board game night memory linked to Board Games Night event
    const boardGamesEvent = events.find(e => e.title === 'Board Games Night 2024');
    const boardGameMemoryData = {
      title: 'Board Game Night',
      description: 'Fun evening playing board games with friends',
      mediaUrl: '/images/memories/mem4.jpg',
      mediaType: 'image',
      album: null, // Standalone memory
      event: boardGamesEvent ? boardGamesEvent._id : null,
      createdBy: user._id,
      visibility: 'public',
      likesCount: 0,
      commentsCount: 0,
      settings: {
        allowDownload: true,
        allowSharing: true,
        allowComments: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const boardGameMemoryResult = await memoriesCollection.insertOne(boardGameMemoryData);
    const boardGameMemory = { _id: boardGameMemoryResult.insertedId, ...boardGameMemoryData };
    memories.push(boardGameMemory);
    console.log('   ✅ Added board game night memory');
    
    // Guitar singing memory (standalone)
    const guitarMemoryData = {
      title: 'Guitar Singing Session',
      description: 'Bunch of students having fun, singing with a guitar',
      mediaUrl: '/images/memories/mem3.jpg',
      mediaType: 'image',
      album: null, // Standalone memory
      event: null,
      createdBy: user._id,
      visibility: 'public',
      likesCount: 0,
      commentsCount: 0,
      settings: {
        allowDownload: true,
        allowSharing: true,
        allowComments: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const guitarMemoryResult = await memoriesCollection.insertOne(guitarMemoryData);
    const guitarMemory = { _id: guitarMemoryResult.insertedId, ...guitarMemoryData };
    memories.push(guitarMemory);
    console.log('   ✅ Added guitar singing memory');
    
    return { albums, memories };
  } catch (error) {
    console.error('❌ Error creating albums and memories:', error.message);
    throw error;
  }
}

/**
 * Main seeding function
 */
async function seedMemoriesAndEvents() {
  try {
    console.log('🚀 Starting memory and event seeding process...\n');
    
    // Connect to database
    await connectDB();
    
    // Find or create test user
    const user = await findOrCreateTestUser();
    console.log('');
    
    // Find or create categories and tags
    const categories = await findOrCreateCategories();
    const tags = await findOrCreateTags();
    console.log('');
    
    // Create events
    const events = await createEvents(user, categories, tags);
    console.log('');
    
    // Create albums and memories
    const { albums, memories } = await createAlbumsAndMemories(user, events);
    console.log('');
    
    // Summary
    console.log('✨ Seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - User: ${user.name} (${user.email})`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Tags: ${tags.length}`);
    console.log(`   - Events: ${events.length}`);
    console.log(`   - Albums: ${albums.length}`);
    console.log(`   - Memories: ${memories.length}`);
    
    console.log('\n🎯 Created Events:');
    events.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.title}`);
      console.log(`      Date: ${event.date.toDateString()}`);
      console.log(`      Time: ${event.time}`);
      console.log(`      Location: ${event.location}`);
      console.log(`      Category: ${event.category}`);
    });
    
    console.log('\n📸 Created Albums:');
    albums.forEach((album, index) => {
      console.log(`   ${index + 1}. ${album.name}`);
      console.log(`      Description: ${album.description}`);
      console.log(`      Public: ${album.isPublic}`);
    });
    
    console.log('\n🖼️  Created Memories:');
    memories.forEach((memory, index) => {
      console.log(`   ${index + 1}. ${memory.title}`);
      console.log(`      Image: ${memory.mediaUrl}`);
      console.log(`      Album: ${memory.album ? 'Yes' : 'Standalone'}`);
      console.log(`      Event: ${memory.event ? 'Yes' : 'No'}`);
    });
    
    console.log('\n🎉 All memories and events are now available in your application!');
    console.log('🔗 You can now view these in the frontend application');
    
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('💥 Fatal error during seeding:', error);
    process.exit(1);
  }
}

// Execute if this file is run directly
if (require.main === module) {
  seedMemoriesAndEvents();
}

module.exports = { seedMemoriesAndEvents };
