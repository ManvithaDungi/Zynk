/**
 * Database Seed Script
 * Populates the database with sample data for demo purposes
 * Creates users, messages, and polls with realistic data
 */

const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const User = require('../models/User');
const Message = require('../models/Message');
const Poll = require('../models/Poll');

/**
 * Sample users data
 */
const sampleUsers = [
  {
    username: 'Alice Johnson',
    email: 'alice@collabhub.com',
    isActive: true,
    status: 'online',
    avatar: 'AJ'
  },
  {
    username: 'Bob Smith',
    email: 'bob@collabhub.com',
    isActive: true,
    status: 'online',
    avatar: 'BS'
  },
  {
    username: 'Charlie Davis',
    email: 'charlie@collabhub.com',
    isActive: false,
    status: 'offline',
    avatar: 'CD'
  },
  {
    username: 'Diana Prince',
    email: 'diana@collabhub.com',
    isActive: true,
    status: 'online',
    avatar: 'DP'
  }
];

/**
 * Function to create sample users
 * @returns {Promise<Array>} - Array of created user documents
 */
async function seedUsers() {
  try {
    console.log('🌱 Seeding users...');
    
    // Clear existing users
    await User.deleteMany({});
    
    // Create new users
    const users = await User.insertMany(sampleUsers);
    
    console.log(`✅ Created ${users.length} users`);
    return users;
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    throw error;
  }
}

/**
 * Function to create sample messages
 * @param {Array} users - Array of user documents
 * @returns {Promise<Array>} - Array of created message documents
 */
async function seedMessages(users) {
  try {
    console.log('🌱 Seeding messages...');
    
    // Clear existing messages
    await Message.deleteMany({});
    
    // Sample messages data
    const sampleMessages = [
      {
        sender: users[0]._id,
        senderName: users[0].username,
        content: 'Hey everyone! Welcome to the Collaboration Hub. Excited to work with you all!',
        messageType: 'text'
      },
      {
        sender: users[1]._id,
        senderName: users[1].username,
        content: 'Thanks Alice! This platform looks great. Can\'t wait to collaborate on projects.',
        messageType: 'text'
      },
      {
        sender: users[3]._id,
        senderName: users[3].username,
        content: 'Hi team! Just joined. Looking forward to contributing to our discussions.',
        messageType: 'text'
      },
      {
        sender: users[0]._id,
        senderName: users[0].username,
        content: 'I\'ve created a poll about our next team meeting time. Please vote!',
        messageType: 'notification'
      },
      {
        sender: users[1]._id,
        senderName: users[1].username,
        content: 'Does anyone have experience with real-time collaboration tools?',
        messageType: 'text'
      },
      {
        sender: users[3]._id,
        senderName: users[3].username,
        content: 'Yes! I\'ve worked with WebSockets and Socket.IO extensively. Happy to help!',
        messageType: 'text'
      }
    ];
    
    // Create messages
    const messages = await Message.insertMany(sampleMessages);
    
    console.log(`✅ Created ${messages.length} messages`);
    return messages;
  } catch (error) {
    console.error('❌ Error seeding messages:', error.message);
    throw error;
  }
}

/**
 * Function to create sample polls
 * @param {Array} users - Array of user documents
 * @returns {Promise<Array>} - Array of created poll documents
 */
async function seedPolls(users) {
  try {
    console.log('🌱 Seeding polls...');
    
    // Clear existing polls
    await Poll.deleteMany({});
    
    // Sample poll 1: Team Meeting Time
    const poll1 = new Poll({
      question: 'What time works best for our weekly team meeting?',
      description: 'Please vote for your preferred meeting time. The option with the most votes will be selected.',
      createdBy: users[0]._id,
      creatorName: users[0].username,
      options: [
        { optionText: 'Monday 9:00 AM', votes: 2, voters: [
          { user: users[0]._id, votedAt: new Date() },
          { user: users[1]._id, votedAt: new Date() }
        ]},
        { optionText: 'Wednesday 2:00 PM', votes: 1, voters: [
          { user: users[3]._id, votedAt: new Date() }
        ]},
        { optionText: 'Friday 10:00 AM', votes: 0, voters: [] },
        { optionText: 'Friday 3:00 PM', votes: 1, voters: [
          { user: users[2]._id, votedAt: new Date() }
        ]}
      ],
      isActive: true,
      totalVotes: 4,
      votersList: [users[0]._id, users[1]._id, users[2]._id, users[3]._id],
      pollType: 'single',
      status: 'active'
    });
    
    // Sample poll 2: Project Technology Stack
    const poll2 = new Poll({
      question: 'Which technology stack should we use for the new project?',
      description: 'Vote for the tech stack you think would be best suited for our upcoming project requirements.',
      createdBy: users[1]._id,
      creatorName: users[1].username,
      options: [
        { optionText: 'React + Node.js + MongoDB', votes: 3, voters: [
          { user: users[0]._id, votedAt: new Date() },
          { user: users[1]._id, votedAt: new Date() },
          { user: users[3]._id, votedAt: new Date() }
        ]},
        { optionText: 'Vue.js + Express + PostgreSQL', votes: 0, voters: [] },
        { optionText: 'Angular + NestJS + MySQL', votes: 1, voters: [
          { user: users[2]._id, votedAt: new Date() }
        ]},
        { optionText: 'Svelte + FastAPI + Redis', votes: 0, voters: [] }
      ],
      isActive: true,
      totalVotes: 4,
      votersList: [users[0]._id, users[1]._id, users[2]._id, users[3]._id],
      pollType: 'single',
      status: 'active',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
    });
    
    // Sample poll 3: Team Building Activity
    const poll3 = new Poll({
      question: 'What team building activity would you prefer?',
      description: 'Help us plan our next team building event. Multiple votes allowed!',
      createdBy: users[3]._id,
      creatorName: users[3].username,
      options: [
        { optionText: 'Escape Room Challenge', votes: 2, voters: [
          { user: users[0]._id, votedAt: new Date() },
          { user: users[1]._id, votedAt: new Date() }
        ]},
        { optionText: 'Cooking Class', votes: 1, voters: [
          { user: users[3]._id, votedAt: new Date() }
        ]},
        { optionText: 'Outdoor Adventure', votes: 1, voters: [
          { user: users[1]._id, votedAt: new Date() }
        ]},
        { optionText: 'Game Night', votes: 2, voters: [
          { user: users[0]._id, votedAt: new Date() },
          { user: users[3]._id, votedAt: new Date() }
        ]}
      ],
      isActive: true,
      totalVotes: 6,
      votersList: [users[0]._id, users[1]._id, users[3]._id],
      allowMultipleVotes: true,
      pollType: 'multiple',
      status: 'active'
    });
    
    // Save all polls
    await poll1.save();
    await poll2.save();
    await poll3.save();
    
    const polls = [poll1, poll2, poll3];
    
    console.log(`✅ Created ${polls.length} polls`);
    return polls;
  } catch (error) {
    console.error('❌ Error seeding polls:', error.message);
    throw error;
  }
}

/**
 * Main seed function
 * Executes all seed operations in sequence
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