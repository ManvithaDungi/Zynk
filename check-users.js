const mongoose = require('mongoose');
const User = require('./backend/models/User');
require('dotenv').config();

async function checkUsers() {
  try {
    console.log('🔍 Checking existing users in database...\n');
    
    // Connect to database
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in environment variables');
      return;
    }
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      authSource: 'admin',
      retryWrites: true,
      w: 'majority',
      bufferCommands: false,
      retryReads: true,
      maxIdleTimeMS: 30000,
      heartbeatFrequencyMS: 10000
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    // Get all users
    const users = await User.find({}).select('name email username createdAt');
    
    if (users.length === 0) {
      console.log('📝 No users found in database');
      console.log('💡 You can create sample users by running: npm run seed');
    } else {
      console.log(`👥 Found ${users.length} users in database:\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name || 'N/A'}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Username: ${user.username || 'N/A'}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('');
      });
    }
    
    // Create sample users with password "pass123" if none exist
    if (users.length === 0) {
      console.log('🔧 Creating sample users with password "pass123"...\n');
      
      const sampleUsers = [
        {
          name: 'Alice Johnson',
          email: 'alice@example.com',
          password: 'pass123'
        },
        {
          name: 'Bob Smith', 
          email: 'bob@example.com',
          password: 'pass123'
        },
        {
          name: 'Charlie Brown',
          email: 'charlie@example.com', 
          password: 'pass123'
        },
        {
          name: 'Diana Prince',
          email: 'diana@example.com',
          password: 'pass123'
        },
        {
          name: 'Eve Wilson',
          email: 'eve@example.com',
          password: 'pass123'
        }
      ];
      
      for (const userData of sampleUsers) {
        try {
          // Generate username from email
          let username = userData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
          if (!username || username.length < 3) {
            username = 'user' + Math.random().toString(36).substr(2, 6);
          } else {
            username = username + Math.random().toString(36).substr(2, 4);
          }
          
          const user = new User({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            username: username
          });
          
          await user.save();
          console.log(`✅ Created user: ${userData.name} (${userData.email})`);
        } catch (error) {
          console.log(`❌ Failed to create user ${userData.name}: ${error.message}`);
        }
      }
      
      console.log('\n🎉 Sample users created successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkUsers();