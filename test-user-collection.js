/**
 * Test User Collection Change
 * Tests if the User model now uses 'user' collection instead of 'users'
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./backend/models/User');

const MONGO_URI = 'mongodb+srv://manvitha:23318@cluster0.ju7oxft.mongodb.net/media';

async function testUserCollection() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 20000,
      connectTimeoutMS: 10000,
      tls: true,
      authSource: 'admin',
      retryWrites: true,
      w: 'majority'
    });

    console.log('✅ Connected to MongoDB');

    // Test User model collection name
    console.log('📊 User model collection name:', User.collection.name);
    
    if (User.collection.name === 'user') {
      console.log('✅ SUCCESS: User model is now using "user" collection');
    } else {
      console.log('❌ ERROR: User model is still using "' + User.collection.name + '" collection');
    }

    // Test if we can query the collection
    try {
      const userCount = await User.countDocuments();
      console.log('📊 Total users in "user" collection:', userCount);
      console.log('✅ SUCCESS: Can query the "user" collection');
    } catch (error) {
      console.log('❌ ERROR: Cannot query the "user" collection:', error.message);
    }

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testUserCollection();
