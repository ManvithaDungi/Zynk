/**
 * Database Seed Script (UPDATED)
 * Populates the database with sample data for demo purposes
 * Creates users with online status, chat messages, and polls
 * Uses combined User model with user collection
 */

const mongoose = require('mongoose');
const User = require('./backend/models/User'); // UPDATED: Using combined User model
const Message = require('./backend/models/Message'); // UPDATED: Renamed from ChatMessage
const Poll = require('./backend/models/Poll');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log(`🔗 Connecting to: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);

    // Disable buffering to avoid timeout issues
    mongoose.set('bufferCommands', false);
    mongoose.set('bufferTimeoutMS', 30000);

    // Simplified connection for MongoDB Atlas
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 75000
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
 * Sample users data with varied online statuses
 */
const sampleUsers = [
  {
    name: 'Alice Johnson',
    username: 'alicejohnson',
    email: 'alice@collabhub.com',
    password: 'password123', // Will be hashed by pre-save middleware
    isActive: true,
    status: 'online',
    avatar: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=4F46E5&color=fff',
    bio: 'Full-stack developer passionate about real-time collaboration tools',
    socketId: 'socket-alice-123'
  },
  {
    name: 'Bob Smith',
    username: 'bobsmith',
    email: 'bob@collabhub.com',
    password: 'password123',
    isActive: true,
    status: 'online',
    avatar: 'https://ui-avatars.com/api/?name=Bob+Smith&background=10B981&color=fff',
    bio: 'Product manager who loves building great user experiences',
    socketId: 'socket-bob-456'
  },
  {
    name: 'Charlie Davis',
    username: 'charliedavis',
    email: 'charlie@collabhub.com',
    password: 'password123',
    isActive: false,
    status: 'offline',
    avatar: 'https://ui-avatars.com/api/?name=Charlie+Davis&background=F59E0B&color=fff',
    bio: 'UI/UX designer crafting beautiful interfaces'
  },
  {
    name: 'Diana Prince',
    username: 'dianaprince',
    email: 'diana@collabhub.com',
    password: 'password123',
    isActive: true,
    status: 'online',
    avatar: 'https://ui-avatars.com/api/?name=Diana+Prince&background=EC4899&color=fff',
    bio: 'DevOps engineer ensuring smooth deployments',
    socketId: 'socket-diana-789'
  },
  {
    name: 'Ethan Hunt',
    username: 'ethanhunt',
    email: 'ethan@collabhub.com',
    password: 'password123',
    isActive: true,
    status: 'away',
    avatar: 'https://ui-avatars.com/api/?name=Ethan+Hunt&background=8B5CF6&color=fff',
    bio: 'Backend specialist focused on scalable architectures',
    socketId: 'socket-ethan-101'
  },
  {
    name: 'Fiona Green',
    username: 'fionagreen',
    email: 'fiona@collabhub.com',
    password: 'password123',
    isActive: false,
    status: 'offline',
    avatar: 'https://ui-avatars.com/api/?name=Fiona+Green&background=06B6D4&color=fff',
    bio: 'QA engineer passionate about quality and testing'
  }
];

/**
 * Function to create sample users
 */
async function seedUsers() {
  try {
    console.log('🌱 Seeding users...');
    
    // Use native MongoDB driver instead of Mongoose for this operation
    const db = mongoose.connection.db;
    const usersCollection = db.collection('user');
    
    // Check current count
    const currentCount = await usersCollection.countDocuments();
    console.log(`📊 Current users in database: ${currentCount}`);
    
    if (currentCount > 0) {
      console.log('🗑️  Clearing existing users...');
      const deleteResult = await usersCollection.deleteMany({});
      console.log(`   Deleted ${deleteResult.deletedCount} existing users`);
    }
    
    // Create new users using insertMany (passwords will NOT be hashed with direct insert)
    // So we need to hash them manually
    console.log('➕ Creating new users...');
    
    const bcrypt = require('bcryptjs');
    const usersWithHashedPasswords = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12)
      }))
    );
    
    const result = await usersCollection.insertMany(usersWithHashedPasswords);
    const users = Object.values(result.insertedIds).map((id, index) => ({
      _id: id,
      ...usersWithHashedPasswords[index]
    }));
    
    console.log(`✅ Created ${users.length} users`);
    console.log(`   - Online: ${users.filter(u => u.status === 'online').length}`);
    console.log(`   - Away: ${users.filter(u => u.status === 'away').length}`);
    console.log(`   - Offline: ${users.filter(u => u.status === 'offline').length}`);
    
    return users;
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

/**
 * Function to create sample messages with realistic conversation flow
 */
async function seedMessages(users) {
  try {
    console.log('🌱 Seeding messages...');
    
    // Use native MongoDB driver
    const db = mongoose.connection.db;
    const messagesCollection = db.collection('messages');
    
    // Clear existing messages
    console.log('🗑️  Clearing existing messages...');
    const deleteResult = await messagesCollection.deleteMany({});
    console.log(`   Deleted ${deleteResult.deletedCount} existing messages`);
    
    // Create timestamps for realistic message timing
    const now = new Date();
    const getTimeAgo = (minutes) => new Date(now.getTime() - minutes * 60000);
    
    // Sample messages with conversation flow
    const sampleMessages = [
      {
        sender: users[0]._id, // Alice
        senderName: users[0].username,
        content: 'Hey everyone! 👋 Welcome to the Collaboration Hub. Excited to work with you all!',
        messageType: 'text',
        createdAt: getTimeAgo(120)
      },
      {
        sender: users[1]._id, // Bob
        senderName: users[1].username,
        content: 'Thanks Alice! This platform looks amazing. Can\'t wait to collaborate on projects.',
        messageType: 'text',
        createdAt: getTimeAgo(118)
      },
      {
        sender: users[3]._id, // Diana
        senderName: users[3].username,
        content: 'Hi team! Just joined. Looking forward to contributing to our discussions.',
        messageType: 'text',
        createdAt: getTimeAgo(115)
      },
      {
        sender: users[4]._id, // Ethan
        senderName: users[4].username,
        content: 'Hello everyone! Great to be here. 🚀',
        messageType: 'text',
        createdAt: getTimeAgo(110)
      },
      {
        sender: users[0]._id, // Alice
        senderName: users[0].username,
        content: 'I\'ve created a poll about our next team meeting time. Please vote! 📊',
        messageType: 'notification',
        createdAt: getTimeAgo(105)
      },
      {
        sender: users[1]._id, // Bob
        senderName: users[1].username,
        content: 'Does anyone have experience with real-time collaboration tools like Socket.IO?',
        messageType: 'text',
        createdAt: getTimeAgo(90)
      },
      {
        sender: users[3]._id, // Diana
        senderName: users[3].username,
        content: 'Yes! I\'ve worked with WebSockets and Socket.IO extensively. Happy to help! 💪',
        messageType: 'text',
        createdAt: getTimeAgo(88)
      },
      {
        sender: users[4]._id, // Ethan
        senderName: users[4].username,
        content: 'I\'ve also used it in production. We can share best practices.',
        messageType: 'text',
        createdAt: getTimeAgo(85)
      },
      {
        sender: users[0]._id, // Alice
        senderName: users[0].username,
        content: 'That would be fantastic! Let\'s schedule a knowledge sharing session.',
        messageType: 'text',
        createdAt: getTimeAgo(80)
      },
      {
        sender: users[1]._id, // Bob
        senderName: users[1].username,
        content: 'What about the tech stack for our new project? I created a poll for that too.',
        messageType: 'text',
        createdAt: getTimeAgo(75)
      },
      {
        sender: users[3]._id, // Diana
        senderName: users[3].username,
        content: 'I voted for React + Node.js + MongoDB. It\'s a solid stack we all know well.',
        messageType: 'text',
        createdAt: getTimeAgo(70)
      },
      {
        sender: users[4]._id, // Ethan
        senderName: users[4].username,
        content: 'Agreed! Plus there\'s great community support for that stack.',
        messageType: 'text',
        createdAt: getTimeAgo(68)
      },
      {
        sender: users[0]._id, // Alice
        senderName: users[0].username,
        content: 'Perfect! Looks like we have consensus. Let\'s start planning the architecture.',
        messageType: 'text',
        createdAt: getTimeAgo(65)
      },
      {
        sender: users[1]._id, // Bob
        senderName: users[1].username,
        content: 'I can create a project roadmap by tomorrow. Sound good?',
        messageType: 'text',
        createdAt: getTimeAgo(60)
      },
      {
        sender: users[3]._id, // Diana
        senderName: users[3].username,
        content: 'Sounds great! I\'ll work on the infrastructure setup.',
        messageType: 'text',
        createdAt: getTimeAgo(55)
      },
      {
        sender: users[4]._id, // Ethan
        senderName: users[4].username,
        content: 'I\'ll start designing the API architecture. Let\'s sync up tomorrow!',
        messageType: 'text',
        createdAt: getTimeAgo(50)
      },
      {
        sender: users[0]._id, // Alice
        senderName: users[0].username,
        content: 'Excellent teamwork! 🎉 Also, don\'t forget about the team building activity poll.',
        messageType: 'text',
        createdAt: getTimeAgo(45)
      },
      {
        sender: users[1]._id, // Bob
        senderName: users[1].username,
        content: 'I voted for the escape room! That sounds fun.',
        messageType: 'text',
        createdAt: getTimeAgo(40)
      },
      {
        sender: users[3]._id, // Diana
        senderName: users[3].username,
        content: 'Me too! And I also voted for game night. Multiple votes allowed! 🎮',
        messageType: 'text',
        createdAt: getTimeAgo(35)
      },
      {
        sender: users[4]._id, // Ethan
        senderName: users[4].username,
        content: 'This collaboration hub is really coming together nicely!',
        messageType: 'text',
        createdAt: getTimeAgo(30)
      },
      {
        sender: users[0]._id, // Alice
        senderName: users[0].username,
        content: 'Thanks everyone! Keep the ideas coming. 💡',
        messageType: 'text',
        createdAt: getTimeAgo(25)
      },
      {
        sender: users[1]._id, // Bob
        senderName: users[1].username,
        content: 'Quick question: Should we use TypeScript or JavaScript for this project?',
        messageType: 'text',
        createdAt: getTimeAgo(20)
      },
      {
        sender: users[3]._id, // Diana
        senderName: users[3].username,
        content: 'TypeScript would be great for better type safety and developer experience.',
        messageType: 'text',
        createdAt: getTimeAgo(18)
      },
      {
        sender: users[4]._id, // Ethan
        senderName: users[4].username,
        content: 'I second that! TypeScript helps catch bugs early.',
        messageType: 'text',
        createdAt: getTimeAgo(15)
      },
      {
        sender: users[0]._id, // Alice
        senderName: users[0].username,
        content: 'TypeScript it is! I\'ll update the project template.',
        messageType: 'text',
        createdAt: getTimeAgo(10)
      },
      {
        sender: users[1]._id, // Bob
        senderName: users[1].username,
        content: 'Perfect! Looking forward to our next sprint. 🚀',
        messageType: 'text',
        createdAt: getTimeAgo(5)
      },
      {
        sender: users[3]._id, // Diana
        senderName: users[3].username,
        content: 'Same here! This is going to be an awesome project.',
        messageType: 'text',
        createdAt: getTimeAgo(2)
      },
      {
        sender: users[4]._id, // Ethan
        senderName: users[4].username,
        content: 'I\'m stepping away for a bit. Setting status to away. Be back soon! ⏰',
        messageType: 'system',
        createdAt: getTimeAgo(1)
      }
    ];
    
    // Create messages using native driver
    const result = await messagesCollection.insertMany(sampleMessages);
    const messages = Object.values(result.insertedIds).map((id, index) => ({
      _id: id,
      ...sampleMessages[index]
    }));
    
    console.log(`✅ Created ${messages.length} messages`);
    console.log(`   - Text messages: ${messages.filter(m => m.messageType === 'text').length}`);
    console.log(`   - Notifications: ${messages.filter(m => m.messageType === 'notification').length}`);
    console.log(`   - System messages: ${messages.filter(m => m.messageType === 'system').length}`);
    
    return messages;
  } catch (error) {
    console.error('❌ Error seeding messages:', error.message);
    throw error;
  }
}

/**
 * Function to create sample polls
 */
async function seedPolls(users) {
  try {
    console.log('🌱 Seeding polls...');
    
    // Use native MongoDB driver
    const db = mongoose.connection.db;
    const pollsCollection = db.collection('polls');
    
    // Clear existing polls
    console.log('🗑️  Clearing existing polls...');
    const deleteResult = await pollsCollection.deleteMany({});
    console.log(`   Deleted ${deleteResult.deletedCount} existing polls`);
    
    // Sample poll 1: Team Meeting Time
    const poll1 = {
      question: 'What time works best for our weekly team meeting?',
      description: 'Please vote for your preferred meeting time. The option with the most votes will be selected.',
      createdBy: users[0]._id, // Alice
      creatorName: users[0].username,
      options: [
        { 
          optionText: 'Monday 9:00 AM', 
          votes: 3, 
          voters: [
            { user: users[0]._id, votedAt: new Date() },
            { user: users[1]._id, votedAt: new Date() },
            { user: users[4]._id, votedAt: new Date() }
          ]
        },
        { 
          optionText: 'Wednesday 2:00 PM', 
          votes: 1, 
          voters: [
            { user: users[3]._id, votedAt: new Date() }
          ]
        },
        { 
          optionText: 'Friday 10:00 AM', 
          votes: 0, 
          voters: [] 
        },
        { 
          optionText: 'Friday 3:00 PM', 
          votes: 1, 
          voters: [
            { user: users[2]._id, votedAt: new Date() }
          ]
        }
      ],
      isActive: true,
      totalVotes: 5,
      votersList: [users[0]._id, users[1]._id, users[2]._id, users[3]._id, users[4]._id],
      pollType: 'single',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Sample poll 2: Project Technology Stack
    const poll2 = {
      question: 'Which technology stack should we use for the new project?',
      description: 'Vote for the tech stack you think would be best suited for our upcoming project requirements.',
      createdBy: users[1]._id, // Bob
      creatorName: users[1].username,
      options: [
        { 
          optionText: 'React + Node.js + MongoDB', 
          votes: 4, 
          voters: [
            { user: users[0]._id, votedAt: new Date() },
            { user: users[1]._id, votedAt: new Date() },
            { user: users[3]._id, votedAt: new Date() },
            { user: users[4]._id, votedAt: new Date() }
          ]
        },
        { 
          optionText: 'Vue.js + Express + PostgreSQL', 
          votes: 0, 
          voters: [] 
        },
        { 
          optionText: 'Angular + NestJS + MySQL', 
          votes: 1, 
          voters: [
            { user: users[2]._id, votedAt: new Date() }
          ]
        },
        { 
          optionText: 'Svelte + FastAPI + Redis', 
          votes: 0, 
          voters: [] 
        }
      ],
      isActive: true,
      totalVotes: 5,
      votersList: [users[0]._id, users[1]._id, users[2]._id, users[3]._id, users[4]._id],
      pollType: 'single',
      status: 'active',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Sample poll 3: Team Building Activity (Multiple votes allowed)
    const poll3 = {
      question: 'What team building activity would you prefer?',
      description: 'Help us plan our next team building event. Multiple votes allowed!',
      createdBy: users[3]._id, // Diana
      creatorName: users[3].username,
      options: [
        { 
          optionText: 'Escape Room Challenge', 
          votes: 3, 
          voters: [
            { user: users[0]._id, votedAt: new Date() },
            { user: users[1]._id, votedAt: new Date() },
            { user: users[4]._id, votedAt: new Date() }
          ]
        },
        { 
          optionText: 'Cooking Class', 
          votes: 2, 
          voters: [
            { user: users[3]._id, votedAt: new Date() },
            { user: users[0]._id, votedAt: new Date() }
          ]
        },
        { 
          optionText: 'Outdoor Adventure', 
          votes: 1, 
          voters: [
            { user: users[1]._id, votedAt: new Date() }
          ]
        },
        { 
          optionText: 'Game Night', 
          votes: 3, 
          voters: [
            { user: users[0]._id, votedAt: new Date() },
            { user: users[3]._id, votedAt: new Date() },
            { user: users[4]._id, votedAt: new Date() }
          ]
        }
      ],
      isActive: true,
      totalVotes: 9,
      votersList: [users[0]._id, users[1]._id, users[3]._id, users[4]._id],
      allowMultipleVotes: true,
      pollType: 'multiple',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Sample poll 4: Code Review Process (Closed)
    const poll4 = {
      question: 'How should we handle code reviews?',
      description: 'This poll has been closed. Results are final.',
      createdBy: users[4]._id, // Ethan
      creatorName: users[4].username,
      options: [
        { 
          optionText: 'Pair programming sessions', 
          votes: 2, 
          voters: [
            { user: users[0]._id, votedAt: new Date() },
            { user: users[3]._id, votedAt: new Date() }
          ]
        },
        { 
          optionText: 'Pull request reviews', 
          votes: 3, 
          voters: [
            { user: users[1]._id, votedAt: new Date() },
            { user: users[2]._id, votedAt: new Date() },
            { user: users[4]._id, votedAt: new Date() }
          ]
        },
        { 
          optionText: 'Weekly code review meetings', 
          votes: 1, 
          voters: [
            { user: users[5]._id, votedAt: new Date() }
          ]
        }
      ],
      isActive: false,
      totalVotes: 6,
      votersList: [users[0]._id, users[1]._id, users[2]._id, users[3]._id, users[4]._id, users[5]._id],
      pollType: 'single',
      status: 'closed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert all polls
    const result = await pollsCollection.insertMany([poll1, poll2, poll3, poll4]);
    const polls = Object.values(result.insertedIds).map((id, index) => ({
      _id: id,
      ...[poll1, poll2, poll3, poll4][index]
    }));
    
    console.log(`✅ Created ${polls.length} polls`);
    console.log(`   - Active: ${polls.filter(p => p.status === 'active').length}`);
    console.log(`   - Closed: ${polls.filter(p => p.status === 'closed').length}`);
    console.log(`   - Total votes cast: ${polls.reduce((sum, p) => sum + p.totalVotes, 0)}`);
    
    return polls;
  } catch (error) {
    console.error('❌ Error seeding polls:', error.message);
    throw error;
  }
}

/**
 * Main seed function
 */
async function seedDatabase() {
  try {
    console.log('🚀 Starting database seed process...\n');
    
    // Connect to database
    await connectDB();
    
    // Seed in order: Users -> Messages -> Polls
    const users = await seedUsers();
    const messages = await seedMessages(users);
    const polls = await seedPolls(users);
    
    console.log('\n✨ Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Messages: ${messages.length}`);
    console.log(`   - Polls: ${polls.length}`);
    console.log('\n👥 User Status:');
    console.log(`   - Online: ${users.filter(u => u.status === 'online').length} users`);
    console.log(`   - Away: ${users.filter(u => u.status === 'away').length} user`);
    console.log(`   - Offline: ${users.filter(u => u.status === 'offline').length} users`);
    console.log('\n🎉 Sample data is ready for use!\n');
    
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('💥 Fatal error during seeding:', error);
    process.exit(1);
  }
}

/**
 * Function to clear all data from database
 */
async function clearDatabase() {
  try {
    console.log('🧹 Clearing database...');
    
    await User.deleteMany({});
    await Message.deleteMany({});
    await Poll.deleteMany({});
    
    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    throw error;
  }
}

// Execute seed if this file is run directly
if (require.main === module) {
  seedDatabase();
}

// Export functions for use in other modules
module.exports = {
  seedDatabase,
  seedUsers,
  seedMessages,
  seedPolls,
  clearDatabase
};