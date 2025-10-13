/**
 * Create Placeholder Users
 * Adds placeholder users to the user collection for testing and development
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

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
 * Create placeholder users
 */
async function createPlaceholderUsers() {
  try {
    console.log('👥 Creating placeholder users...\n');
    
    // Use native MongoDB driver
    const db = mongoose.connection.db;
    const usersCollection = db.collection('user');
    
    // Check current user count
    const currentCount = await usersCollection.countDocuments();
    console.log(`📊 Current users in database: ${currentCount}`);
    
    // Placeholder users data
    const placeholderUsers = [
      {
        name: 'Alice Johnson',
        username: 'alicejohnson',
        email: 'alice@example.com',
        password: await bcrypt.hash('password123', 12),
        bio: 'Event organizer and community manager',
        isActive: true,
        status: 'online',
        avatar: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=4F46E5&color=fff',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bob Smith',
        username: 'bobsmith',
        email: 'bob@example.com',
        password: await bcrypt.hash('password123', 12),
        bio: 'Music enthusiast and event coordinator',
        isActive: true,
        status: 'online',
        avatar: 'https://ui-avatars.com/api/?name=Bob+Smith&background=10B981&color=fff',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Charlie Davis',
        username: 'charliedavis',
        email: 'charlie@example.com',
        password: await bcrypt.hash('password123', 12),
        bio: 'Arts and crafts workshop leader',
        isActive: true,
        status: 'away',
        avatar: 'https://ui-avatars.com/api/?name=Charlie+Davis&background=F59E0B&color=fff',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Diana Prince',
        username: 'dianaprince',
        email: 'diana@example.com',
        password: await bcrypt.hash('password123', 12),
        bio: 'Educational program coordinator',
        isActive: true,
        status: 'online',
        avatar: 'https://ui-avatars.com/api/?name=Diana+Prince&background=EC4899&color=fff',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ethan Hunt',
        username: 'ethanhunt',
        email: 'ethan@example.com',
        password: await bcrypt.hash('password123', 12),
        bio: 'Gaming community manager',
        isActive: true,
        status: 'online',
        avatar: 'https://ui-avatars.com/api/?name=Ethan+Hunt&background=8B5CF6&color=fff',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Fiona Green',
        username: 'fionagreen',
        email: 'fiona@example.com',
        password: await bcrypt.hash('password123', 12),
        bio: 'Science lab coordinator',
        isActive: false,
        status: 'offline',
        avatar: 'https://ui-avatars.com/api/?name=Fiona+Green&background=06B6D4&color=fff',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'George Wilson',
        username: 'georgewilson',
        email: 'george@example.com',
        password: await bcrypt.hash('password123', 12),
        bio: 'Social events organizer',
        isActive: true,
        status: 'online',
        avatar: 'https://ui-avatars.com/api/?name=George+Wilson&background=EF4444&color=fff',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Hannah Brown',
        username: 'hannahbrown',
        email: 'hannah@example.com',
        password: await bcrypt.hash('password123', 12),
        bio: 'Study group facilitator',
        isActive: true,
        status: 'online',
        avatar: 'https://ui-avatars.com/api/?name=Hannah+Brown&background=84CC16&color=fff',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Check which users already exist
    const existingEmails = await usersCollection.find({ 
      email: { $in: placeholderUsers.map(u => u.email) } 
    }).toArray();
    
    const existingEmailSet = new Set(existingEmails.map(u => u.email));
    const newUsers = placeholderUsers.filter(u => !existingEmailSet.has(u.email));
    
    if (newUsers.length === 0) {
      console.log('✅ All placeholder users already exist');
    } else {
      console.log(`➕ Creating ${newUsers.length} new placeholder users...`);
      
      // Insert new users
      const result = await usersCollection.insertMany(newUsers);
      const createdUsers = Object.values(result.insertedIds).map((id, index) => ({
        _id: id,
        ...newUsers[index]
      }));
      
      console.log(`✅ Created ${createdUsers.length} placeholder users:`);
      createdUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email})`);
        console.log(`      Username: ${user.username}`);
        console.log(`      Status: ${user.status}`);
        console.log(`      ID: ${user._id}`);
        console.log('');
      });
    }
    
    // Show all users summary
    const allUsers = await usersCollection.find({}).toArray();
    console.log(`📊 Total users in database: ${allUsers.length}`);
    console.log(`   - Online: ${allUsers.filter(u => u.status === 'online').length}`);
    console.log(`   - Away: ${allUsers.filter(u => u.status === 'away').length}`);
    console.log(`   - Offline: ${allUsers.filter(u => u.status === 'offline').length}`);
    
    return allUsers;
  } catch (error) {
    console.error('❌ Error creating placeholder users:', error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Starting placeholder users creation...\n');
    
    // Connect to database
    await connectDB();
    
    // Create placeholder users
    const users = await createPlaceholderUsers();
    
    console.log('\n✨ Placeholder users creation completed successfully!');
    console.log('\n💡 You can now use these users for:');
    console.log('   - Event organizers');
    console.log('   - Memory creators');
    console.log('   - Testing user interactions');
    console.log('\n🔑 Login credentials for all placeholder users:');
    console.log('   Email: [username]@example.com');
    console.log('   Password: password123');
    
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Execute if this file is run directly
if (require.main === module) {
  main();
}

module.exports = { createPlaceholderUsers };
