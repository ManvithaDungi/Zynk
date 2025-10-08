const mongoose = require('mongoose');
require('dotenv').config();

// Import the Event model
const Event = require('./backend/models/Event');

async function deleteAllEventsDirect() {
  try {
    console.log('🗑️  Deleting all events directly from database...\n');
    
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGO_URI environment variable is not set');
      process.exit(1);
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
    
    console.log('✅ Connected to MongoDB');
    
    // Count existing events
    const eventCount = await Event.countDocuments();
    console.log(`📊 Found ${eventCount} events in database`);
    
    if (eventCount === 0) {
      console.log('✅ No events found to delete');
      await mongoose.disconnect();
      return;
    }
    
    // List all events that will be deleted
    console.log('\n📝 Events to be deleted:');
    const events = await Event.find({}).select('title _id createdAt');
    events.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.title} (ID: ${event._id}) - Created: ${event.createdAt.toDateString()}`);
    });
    
    // Delete all events
    console.log('\n🗑️  Deleting all events...');
    const deleteResult = await Event.deleteMany({});
    
    console.log('\n📊 Deletion Summary:');
    console.log(`   ✅ Successfully deleted: ${deleteResult.deletedCount} events`);
    console.log(`   📋 Total events processed: ${eventCount}`);
    
    if (deleteResult.deletedCount > 0) {
      console.log('\n🎉 All events deleted successfully!');
      console.log('💡 Database is now clean and ready for fresh events');
      console.log('🖼️  You can now run the seeding script to create events with proper images');
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  }
}

deleteAllEventsDirect();
