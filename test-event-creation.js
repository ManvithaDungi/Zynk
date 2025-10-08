const mongoose = require('mongoose');
const Event = require('./backend/models/Event');
const User = require('./backend/models/User');
require('dotenv').config();

async function testEventCreation() {
  try {
    console.log('🔍 Testing event creation...\n');
    
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
    
    // Get a user to be the organizer
    const users = await User.find({}).limit(1);
    if (users.length === 0) {
      console.log('❌ No users found. Please run the seed script first.');
      return;
    }
    
    console.log(`👤 Using user: ${users[0].name} (${users[0].email}) as organizer`);
    
    // Create a simple test event
    const testEvent = new Event({
      title: 'Test Event',
      description: 'This is a test event to verify the Event model works correctly.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      time: '18:00',
      location: 'Test Location',
      category: new mongoose.Types.ObjectId(), // Create a dummy ObjectId
      maxAttendees: 50,
      organizer: users[0]._id,
      status: 'active'
    });
    
    console.log('📝 Creating test event...');
    const savedEvent = await testEvent.save();
    console.log('✅ Test event created successfully!');
    console.log(`   Event ID: ${savedEvent._id}`);
    console.log(`   Title: ${savedEvent.title}`);
    console.log(`   Date: ${savedEvent.date}`);
    console.log(`   Organizer: ${savedEvent.organizer}`);
    
    // Test fetching the event
    console.log('\n🔍 Testing event retrieval...');
    const fetchedEvent = await Event.findById(savedEvent._id).populate('organizer', 'name email');
    if (fetchedEvent) {
      console.log('✅ Event retrieved successfully!');
      console.log(`   Title: ${fetchedEvent.title}`);
      console.log(`   Organizer: ${fetchedEvent.organizer.name}`);
    } else {
      console.log('❌ Failed to retrieve event');
    }
    
    // Clean up - delete the test event
    await Event.findByIdAndDelete(savedEvent._id);
    console.log('\n🧹 Test event cleaned up');
    
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

testEventCreation();
