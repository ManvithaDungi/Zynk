const mongoose = require('mongoose');
const Event = require('./backend/models/Event');
const User = require('./backend/models/User');
require('dotenv').config();

async function updateExistingEvents() {
  try {
    console.log('🔧 Updating existing events with valid organizers...\n');
    
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
    
    // Get a valid user to be the organizer
    const users = await User.find({}).limit(1);
    if (users.length === 0) {
      console.log('❌ No users found. Please run the seed script first.');
      return;
    }
    
    const validOrganizer = users[0];
    console.log(`👤 Using user as organizer: ${validOrganizer.name} (${validOrganizer.email})`);
    console.log(`   User ID: ${validOrganizer._id}`);
    
    // Get all events
    const events = await Event.find({});
    console.log(`\n📅 Found ${events.length} events to update`);
    
    if (events.length === 0) {
      console.log('❌ No events found to update');
      return;
    }
    
    // Update each event with the valid organizer
    let updatedCount = 0;
    for (const event of events) {
      try {
        console.log(`🔧 Updating event: ${event.title}`);
        console.log(`   Current organizer: ${event.organizer}`);
        
        // Update the organizer
        event.organizer = validOrganizer._id;
        await event.save();
        
        console.log(`✅ Updated organizer for: ${event.title}`);
        updatedCount++;
        
      } catch (error) {
        console.log(`❌ Failed to update event ${event.title}: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount} out of ${events.length} events`);
    
    // Test the updated events
    console.log('\n🔍 Testing updated events...');
    const updatedEvents = await Event.find({})
      .populate('organizer', 'name email')
      .limit(3);
    
    for (const event of updatedEvents) {
      console.log(`📋 Event: ${event.title}`);
      console.log(`   Organizer: ${event.organizer?.name || 'Unknown'}`);
      console.log(`   Date: ${event.date.toDateString()}`);
      console.log(`   Status: ${event.status}`);
      console.log('');
    }
    
    console.log('💡 Events should now work in your application!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

updateExistingEvents();
