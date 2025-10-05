const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./backend/models/User');
const Category = require('./backend/models/Category');
const Tag = require('./backend/models/Tag');
const Event = require('./backend/models/Event');
const Album = require('./backend/models/Album');
const Post = require('./backend/models/Post');

// Simple connection without complex options
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zynk';
    console.log(`🔗 Connecting to: ${mongoUri}`);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Sample data
const sampleCategories = [
  { name: 'Conference', description: 'Professional conferences and seminars', icon: '🎤', color: '#3B82F6' },
  { name: 'Workshop', description: 'Hands-on learning workshops', icon: '🔧', color: '#10B981' },
  { name: 'Meetup', description: 'Community meetups and networking', icon: '🤝', color: '#F59E0B' },
  { name: 'Social', description: 'Social gatherings and parties', icon: '🎉', color: '#EF4444' },
  { name: 'Sports', description: 'Sports events and competitions', icon: '⚽', color: '#8B5CF6' },
  { name: 'Arts', description: 'Art exhibitions and cultural events', icon: '🎨', color: '#EC4899' },
  { name: 'Music', description: 'Concerts and music events', icon: '🎵', color: '#06B6D4' },
  { name: 'Technology', description: 'Tech talks and hackathons', icon: '💻', color: '#84CC16' },
  { name: 'Education', description: 'Educational events and courses', icon: '📚', color: '#F97316' },
  { name: 'Health', description: 'Health and wellness events', icon: '🧘', color: '#14B8A6' }
];

const sampleTags = [
  'networking', 'professional', 'beginner-friendly', 'advanced', 'hands-on',
  'interactive', 'outdoor', 'indoor', 'free', 'paid', 'certificate',
  'food-included', 'parking-available', 'online', 'hybrid', 'in-person',
  'family-friendly', 'kids-welcome', 'pet-friendly', 'accessible'
];

const sampleUsers = [
  { name: 'John Smith', email: 'john@example.com', password: 'password123' },
  { name: 'Sarah Johnson', email: 'sarah@example.com', password: 'password123' },
  { name: 'Mike Davis', email: 'mike@example.com', password: 'password123' },
  { name: 'Lisa Chen', email: 'lisa@example.com', password: 'password123' },
  { name: 'David Wilson', email: 'david@example.com', password: 'password123' },
  { name: 'Emma Rodriguez', email: 'emma@example.com', password: 'password123' },
  { name: 'Alex Thompson', email: 'alex@example.com', password: 'password123' },
  { name: 'Maria Garcia', email: 'maria@example.com', password: 'password123' },
  { name: 'James Brown', email: 'james@example.com', password: 'password123' },
  { name: 'Rachel Kim', email: 'rachel@example.com', password: 'password123' }
];

// Function to get a random future date
const getRandomFutureDate = (daysAhead) => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead) + 1);
  return date;
};

// Function to get a random time
const getRandomTime = () => {
  const hours = Math.floor(Math.random() * 14) + 8; // 8 AM to 10 PM
  const minutes = Math.random() < 0.5 ? '00' : '30';
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

// Seed one collection at a time with error handling
const seedCategories = async () => {
  try {
    console.log('📂 Seeding categories...');
    
    // Check if categories already exist
    const existingCount = await Category.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Categories already exist (${existingCount} found). Skipping...`);
      return await Category.find().limit(10);
    }
    
    const categories = await Category.insertMany(sampleCategories);
    console.log(`✅ Inserted ${categories.length} categories`);
    return categories;
  } catch (error) {
    console.error('❌ Error seeding categories:', error.message);
    return [];
  }
};

const seedTags = async () => {
  try {
    console.log('🏷️  Seeding tags...');
    
    // Check if tags already exist
    const existingCount = await Tag.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Tags already exist (${existingCount} found). Skipping...`);
      return await Tag.find().limit(20);
    }
    
    const tagDocs = sampleTags.map(name => ({ name: name.toLowerCase(), usageCount: Math.floor(Math.random() * 50) }));
    const tags = await Tag.insertMany(tagDocs);
    console.log(`✅ Inserted ${tags.length} tags`);
    return tags;
  } catch (error) {
    console.error('❌ Error seeding tags:', error.message);
    return [];
  }
};

const seedUsers = async () => {
  try {
    console.log('👥 Seeding users...');
    
    // Check if users already exist
    const existingCount = await User.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Users already exist (${existingCount} found). Skipping...`);
      return await User.find().limit(10);
    }
    
    const users = await User.insertMany(sampleUsers);
    console.log(`✅ Inserted ${users.length} users`);
    return users;
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    return [];
  }
};

const seedEvents = async (categories, tags, users) => {
  try {
    console.log('📅 Seeding events...');
    
    // Check if events already exist
    const existingCount = await Event.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Events already exist (${existingCount} found). Skipping...`);
      return await Event.find().limit(10);
    }
    
    if (categories.length === 0 || users.length === 0) {
      console.log('⚠️  No categories or users available. Skipping events...');
      return [];
    }
    
    const sampleEvents = [
      {
        title: 'React Mastery Workshop',
        description: 'Learn advanced React patterns and best practices in this comprehensive workshop.',
        date: getRandomFutureDate(30),
        time: getRandomTime(),
        location: 'Tech Hub, Downtown',
        category: categories[0]._id,
        tags: tags.slice(0, 3).map(t => t._id),
        maxAttendees: 50,
        organizer: users[0]._id,
        registeredUsers: users.slice(1, 4).map(u => u._id),
        allowChat: true,
        allowReviews: true,
        allowPolls: true,
        shareable: true,
        visibility: 'public'
      },
      {
        title: 'Summer Music Festival',
        description: 'Join us for an amazing day of live music featuring local and international artists.',
        date: getRandomFutureDate(60),
        time: '14:00',
        location: 'Central Park Amphitheater',
        category: categories[6]._id, // Music
        tags: tags.slice(3, 6).map(t => t._id),
        maxAttendees: 500,
        organizer: users[4]._id,
        registeredUsers: users.slice(0, 4).map(u => u._id),
        allowChat: true,
        allowReviews: true,
        allowPolls: false,
        shareable: true,
        visibility: 'public'
      },
      {
        title: 'Startup Networking Mixer',
        description: 'Connect with fellow entrepreneurs, investors, and startup enthusiasts.',
        date: getRandomFutureDate(15),
        time: getRandomTime(),
        location: 'Innovation Center, Building B',
        category: categories[2]._id, // Meetup
        tags: tags.slice(0, 3).map(t => t._id),
        maxAttendees: 100,
        organizer: users[5]._id,
        registeredUsers: users.slice(1, 4).map(u => u._id),
        allowChat: true,
        allowReviews: true,
        allowPolls: true,
        shareable: true,
        visibility: 'public'
      }
    ];
    
    const events = await Event.insertMany(sampleEvents);
    console.log(`✅ Inserted ${events.length} events`);
    return events;
  } catch (error) {
    console.error('❌ Error seeding events:', error.message);
    return [];
  }
};

const seedAlbums = async (events, users) => {
  try {
    console.log('📸 Seeding albums...');
    
    // Check if albums already exist
    const existingCount = await Album.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Albums already exist (${existingCount} found). Skipping...`);
      return await Album.find().limit(7);
    }
    
    if (events.length === 0 || users.length === 0) {
      console.log('⚠️  No events or users available. Skipping albums...');
      return [];
    }
    
    const sampleAlbums = [
      {
        name: 'React Workshop Highlights',
        description: 'Photos and videos from our React Mastery Workshop',
        eventId: events[0]._id,
        createdBy: users[0]._id,
        isPublic: true
      },
      {
        name: 'Music Festival Memories',
        description: 'Amazing moments from the Summer Music Festival',
        eventId: events[1]._id,
        createdBy: users[4]._id,
        isPublic: true
      },
      {
        name: 'Personal Travel Collection',
        description: 'My travel memories from around the world',
        eventId: null,
        createdBy: users[1]._id,
        isPublic: true
      }
    ];
    
    const albums = await Album.insertMany(sampleAlbums);
    console.log(`✅ Inserted ${albums.length} albums`);
    return albums;
  } catch (error) {
    console.error('❌ Error seeding albums:', error.message);
    return [];
  }
};

const seedPosts = async (albums, users) => {
  try {
    console.log('🖼️  Seeding posts/memories...');
    
    // Check if posts already exist
    const existingCount = await Post.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Posts already exist (${existingCount} found). Skipping...`);
      return await Post.find().limit(10);
    }
    
    if (albums.length === 0 || users.length === 0) {
      console.log('⚠️  No albums or users available. Skipping posts...');
      return [];
    }
    
    const samplePosts = [
      {
        caption: 'Opening session was incredible! So much energy in the room.',
        album: albums[0]._id,
        user: users[1]._id,
        media: [
          { url: 'https://placehold.co/600x400/000000/FFFFFF/png?text=Workshop+Opening', type: 'image', filename: 'workshop-opening.png' }
        ],
        likes: [{ user: users[0]._id }, { user: users[2]._id }],
        comments: [
          { user: users[0]._id, text: 'Thanks for attending! Glad you enjoyed it.' }
        ],
        visibility: 'public'
      },
      {
        caption: 'The main stage setup looks amazing! Can\'t wait for the performances.',
        album: albums[1]._id,
        user: users[5]._id,
        media: [
          { url: 'https://placehold.co/600x400/EC4899/FFFFFF/png?text=Music+Festival', type: 'image', filename: 'festival-stage.png' }
        ],
        likes: [{ user: users[4]._id }, { user: users[7]._id }],
        comments: [
          { user: users[4]._id, text: 'It\'s going to be epic!' }
        ],
        visibility: 'public'
      },
      {
        caption: 'Sunset at Santorini - absolutely breathtaking!',
        album: albums[2]._id,
        user: users[1]._id,
        media: [
          { url: 'https://placehold.co/600x400/EF4444/FFFFFF/png?text=Santorini+Sunset', type: 'image', filename: 'santorini.png' }
        ],
        likes: [{ user: users[3]._id }, { user: users[5]._id }],
        comments: [
          { user: users[3]._id, text: 'This is on my bucket list!' }
        ],
        visibility: 'public'
      }
    ];
    
    const posts = await Post.insertMany(samplePosts);
    console.log(`✅ Inserted ${posts.length} posts/memories`);
    return posts;
  } catch (error) {
    console.error('❌ Error seeding posts:', error.message);
    return [];
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting simple database seeding...\n');
    
    // Seed one collection at a time
    const categories = await seedCategories();
    console.log('');
    
    const tags = await seedTags();
    console.log('');
    
    const users = await seedUsers();
    console.log('');
    
    const events = await seedEvents(categories, tags, users);
    console.log('');
    
    const albums = await seedAlbums(events, users);
    console.log('');
    
    const posts = await seedPosts(albums, users);
    console.log('');
    
    // Summary
    console.log('\n🎉 SIMPLE SEEDING COMPLETED!\n');
    console.log('📊 Summary:');
    console.log(`   - ${categories.length} Categories`);
    console.log(`   - ${tags.length} Tags`);
    console.log(`   - ${users.length} Users`);
    console.log(`   - ${events.length} Events`);
    console.log(`   - ${albums.length} Albums`);
    console.log(`   - ${posts.length} Posts/Memories`);
    console.log('\n💡 Test Credentials:');
    console.log('   Email: john@example.com');
    console.log('   Password: password123');
    console.log('\n   (All users have the same password: password123)\n');
    
  } catch (error) {
    console.error('❌ Error in seeding process:', error);
    throw error;
  }
};

// Run the seeding
const main = async () => {
  try {
    await connectDB();
    await seedDatabase();
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

main();
