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

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zynk';
    console.log(`🔗 Connecting to: ${mongoUri}`);
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Test the connection
    await mongoose.connection.db.admin().ping();
    console.log('✅ MongoDB ping successful');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('\n💡 Make sure MongoDB is running:');
    console.error('   - Check if MongoDB service is started');
    console.error('   - Try: net start MongoDB (Windows) or sudo systemctl start mongod (Linux/Mac)');
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

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');
//dont clear existing data, only seed new data
    // Seed Categories
    console.log('📂 Seeding categories...');
    const categories = await Category.insertMany(sampleCategories);
    console.log(`✅ Inserted ${categories.length} categories`);
    categories.forEach(cat => {
      console.log(`   ${cat.icon} ${cat.name}`);
    });
    console.log('');

    // Seed Tags
    console.log('🏷️  Seeding tags...');
    const tagDocs = sampleTags.map(name => ({ name: name.toLowerCase(), usageCount: Math.floor(Math.random() * 50) }));
    const tags = await Tag.insertMany(tagDocs);
    console.log(`✅ Inserted ${tags.length} tags\n`);

    // Seed Users
    console.log('👥 Seeding users...');
    const users = await User.insertMany(sampleUsers);
    console.log(`✅ Inserted ${users.length} users`);
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
    });
    console.log('');

    // Seed Events
    console.log('📅 Seeding events...');
    const sampleEvents = [
      {
        title: 'React Mastery Workshop',
        description: 'Learn advanced React patterns and best practices in this comprehensive workshop. Perfect for developers looking to level up their React skills.',
        date: getRandomFutureDate(30),
        time: getRandomTime(),
        location: 'Tech Hub, Downtown',
        category: categories.find(c => c.name === 'Workshop')._id,
        tags: [tags[0]._id, tags[1]._id, tags[4]._id],
        maxAttendees: 50,
        organizer: users[0]._id,
        registeredUsers: [users[1]._id, users[2]._id, users[3]._id],
        allowChat: true,
        allowReviews: true,
        allowPolls: true,
        shareable: true,
        visibility: 'public'
      },
      {
        title: 'Summer Music Festival',
        description: 'Join us for an amazing day of live music featuring local and international artists. Food trucks, beverages, and great vibes!',
        date: getRandomFutureDate(60),
        time: '14:00',
        location: 'Central Park Amphitheater',
        category: categories.find(c => c.name === 'Music')._id,
        tags: [tags[6]._id, tags[8]._id, tags[16]._id],
        maxAttendees: 500,
        organizer: users[4]._id,
        registeredUsers: [users[0]._id, users[2]._id, users[5]._id, users[7]._id],
        allowChat: true,
        allowReviews: true,
        allowPolls: false,
        shareable: true,
        visibility: 'public'
      },
      {
        title: 'Startup Networking Mixer',
        description: 'Connect with fellow entrepreneurs, investors, and startup enthusiasts. Share ideas, make connections, and grow your network.',
        date: getRandomFutureDate(15),
        time: getRandomTime(),
        location: 'Innovation Center, Building B',
        category: categories.find(c => c.name === 'Meetup')._id,
        tags: [tags[0]._id, tags[1]._id, tags[11]._id],
        maxAttendees: 100,
        organizer: users[5]._id,
        registeredUsers: [users[1]._id, users[3]._id, users[6]._id],
        allowChat: true,
        allowReviews: true,
        allowPolls: true,
        shareable: true,
        visibility: 'public'
      },
      {
        title: 'AI & Machine Learning Conference',
        description: 'Leading experts discuss the latest trends and breakthroughs in artificial intelligence and machine learning. Includes keynote speeches and panel discussions.',
        date: getRandomFutureDate(45),
        time: '09:00',
        location: 'Convention Center, Hall A',
        category: categories.find(c => c.name === 'Conference')._id,
        tags: [tags[1]._id, tags[3]._id, tags[10]._id],
        maxAttendees: 300,
        organizer: users[0]._id,
        registeredUsers: [users[2]._id, users[4]._id, users[6]._id, users[8]._id],
        allowChat: true,
        allowReviews: true,
        allowPolls: true,
        shareable: true,
        visibility: 'public'
      },
      {
        title: 'Community Yoga Session',
        description: 'Free outdoor yoga session for all skill levels. Bring your own mat and enjoy a peaceful morning of mindfulness and movement.',
        date: getRandomFutureDate(7),
        time: '07:00',
        location: 'Riverside Park',
        category: categories.find(c => c.name === 'Health')._id,
        tags: [tags[2]._id, tags[6]._id, tags[8]._id],
        maxAttendees: 40,
        organizer: users[7]._id,
        registeredUsers: [users[1]._id, users[5]._id, users[9]._id],
        allowChat: true,
        allowReviews: true,
        allowPolls: false,
        shareable: true,
        visibility: 'public'
      },
      {
        title: 'Digital Art Exhibition',
        description: 'Explore stunning digital artwork from emerging and established artists. Interactive installations and VR experiences included.',
        date: getRandomFutureDate(20),
        time: '18:00',
        location: 'Modern Art Gallery',
        category: categories.find(c => c.name === 'Arts')._id,
        tags: [tags[5]._id, tags[7]._id, tags[16]._id],
        maxAttendees: 150,
        organizer: users[2]._id,
        registeredUsers: [users[0]._id, users[3]._id, users[6]._id],
        allowChat: true,
        allowReviews: true,
        allowPolls: true,
        shareable: true,
        visibility: 'public'
      },
      {
        title: 'Photography Workshop: Portrait Lighting',
        description: 'Learn professional portrait lighting techniques with hands-on practice. Bring your camera and prepare to transform your photography skills.',
        date: getRandomFutureDate(12),
        time: getRandomTime(),
        location: 'Photo Studio Pro, Studio 3',
        category: categories.find(c => c.name === 'Workshop')._id,
        tags: [tags[2]._id, tags[4]._id, tags[10]._id],
        maxAttendees: 20,
        organizer: users[2]._id,
        registeredUsers: [users[4]._id, users[7]._id],
        allowChat: true,
        allowReviews: true,
        allowPolls: false,
        shareable: true,
        visibility: 'public'
      },
      {
        title: 'Charity Run for Education',
        description: '5K charity run to support local education initiatives. All proceeds go to providing school supplies for underprivileged children.',
        date: getRandomFutureDate(25),
        time: '08:00',
        location: 'City Marathon Route',
        category: categories.find(c => c.name === 'Sports')._id,
        tags: [tags[6]._id, tags[16]._id, tags[18]._id],
        maxAttendees: 200,
        organizer: users[8]._id,
        registeredUsers: [users[1]._id, users[3]._id, users[5]._id, users[9]._id],
        allowChat: true,
        allowReviews: true,
        allowPolls: false,
        shareable: true,
        visibility: 'public'
      },
      {
        title: 'Web Development Bootcamp',
        description: 'Intensive 3-day bootcamp covering HTML, CSS, JavaScript, and modern frameworks. Certificate of completion provided.',
        date: getRandomFutureDate(35),
        time: '09:30',
        location: 'Code Academy, Room 201',
        category: categories.find(c => c.name === 'Education')._id,
        tags: [tags[2]._id, tags[4]._id, tags[10]._id],
        maxAttendees: 30,
        organizer: users[6]._id,
        registeredUsers: [users[0]._id, users[2]._id, users[8]._id],
        isRecurring: true,
        recurringPattern: 'monthly',
        recurringEndDate: getRandomFutureDate(180),
        allowChat: true,
        allowReviews: true,
        allowPolls: true,
        shareable: true,
        visibility: 'public'
      },
      {
        title: 'Holiday Party & Gift Exchange',
        description: 'Join us for festive fun, delicious food, and a gift exchange (gifts under $20). Bring your holiday spirit!',
        date: getRandomFutureDate(50),
        time: '19:00',
        location: 'Community Center',
        category: categories.find(c => c.name === 'Social')._id,
        tags: [tags[11]._id, tags[16]._id, tags[17]._id],
        maxAttendees: 80,
        organizer: users[3]._id,
        registeredUsers: [users[1]._id, users[4]._id, users[6]._id, users[9]._id],
        allowChat: true,
        allowReviews: false,
        allowPolls: true,
        shareable: true,
        visibility: 'public'
      }
    ];

    const events = await Event.insertMany(sampleEvents);
    console.log(`✅ Inserted ${events.length} events`);
    events.forEach(event => {
      console.log(`   - ${event.title} (${event.date.toDateString()})`);
    });
    console.log('');

    // Seed Albums
    console.log('📸 Seeding albums...');
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
        name: 'Networking Event Photos',
        description: 'Connections made at the Startup Networking Mixer',
        eventId: events[2]._id,
        createdBy: users[5]._id,
        isPublic: true
      },
      {
        name: 'AI Conference Sessions',
        description: 'Keynote speeches and panel discussions',
        eventId: events[3]._id,
        createdBy: users[0]._id,
        isPublic: true
      },
      {
        name: 'Yoga in the Park',
        description: 'Peaceful morning yoga session photos',
        eventId: events[4]._id,
        createdBy: users[7]._id,
        isPublic: true
      },
      {
        name: 'Personal Travel Collection',
        description: 'My travel memories from around the world',
        eventId: null,
        createdBy: users[1]._id,
        isPublic: true
      },
      {
        name: 'Family Moments',
        description: 'Special family memories',
        eventId: null,
        createdBy: users[3]._id,
        isPublic: false
      }
    ];

    const albums = await Album.insertMany(sampleAlbums);
    console.log(`✅ Inserted ${albums.length} albums`);
    albums.forEach(album => {
      console.log(`   - ${album.name}`);
    });
    console.log('');

    // Seed Posts (Memories)
    console.log('🖼️  Seeding posts/memories...');
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
        likes: [{ user: users[4]._id }, { user: users[7]._id }, { user: users[2]._id }],
        comments: [
          { user: users[4]._id, text: 'It\'s going to be epic!' }
        ],
        visibility: 'public'
      },
      {
        caption: 'Made some great connections today. Startup community is thriving!',
        album: albums[2]._id,
        user: users[3]._id,
        media: [
          { url: 'https://placehold.co/600x400/F59E0B/FFFFFF/png?text=Networking', type: 'image', filename: 'networking.png' }
        ],
        likes: [{ user: users[5]._id }, { user: users[6]._id }],
        comments: [],
        visibility: 'public'
      },
      {
        caption: 'Dr. Smith\'s keynote on neural networks was mind-blowing!',
        album: albums[3]._id,
        user: users[2]._id,
        media: [
          { url: 'https://placehold.co/600x400/84CC16/FFFFFF/png?text=AI+Conference', type: 'image', filename: 'keynote.png' }
        ],
        likes: [{ user: users[0]._id }, { user: users[4]._id }, { user: users[6]._id }, { user: users[8]._id }],
        comments: [
          { user: users[0]._id, text: 'One of the best talks I\'ve ever attended!' },
          { user: users[6]._id, text: 'The examples were so practical.' }
        ],
        visibility: 'public'
      },
      {
        caption: 'Perfect morning for yoga! Feeling refreshed and centered.',
        album: albums[4]._id,
        user: users[1]._id,
        media: [
          { url: 'https://placehold.co/600x400/14B8A6/FFFFFF/png?text=Yoga+Session', type: 'image', filename: 'yoga.png' }
        ],
        likes: [{ user: users[7]._id }, { user: users[5]._id }, { user: users[9]._id }],
        comments: [
          { user: users[7]._id, text: 'So glad you could make it! Same time next week?' }
        ],
        visibility: 'public'
      },
      {
        caption: 'Sunset at Santorini - absolutely breathtaking!',
        album: albums[5]._id,
        user: users[1]._id,
        media: [
          { url: 'https://placehold.co/600x400/EF4444/FFFFFF/png?text=Santorini+Sunset', type: 'image', filename: 'santorini.png' }
        ],
        likes: [{ user: users[3]._id }, { user: users[5]._id }],
        comments: [
          { user: users[3]._id, text: 'This is on my bucket list!' }
        ],
        visibility: 'public'
      },
      {
        caption: 'Family dinner - love these moments together ❤️',
        album: albums[6]._id,
        user: users[3]._id,
        media: [
          { url: 'https://placehold.co/600x400/8B5CF6/FFFFFF/png?text=Family+Time', type: 'image', filename: 'family.png' }
        ],
        likes: [],
        comments: [],
        visibility: 'private'
      },
      {
        caption: 'Hands-on coding session - everyone learning React hooks!',
        album: albums[0]._id,
        user: users[0]._id,
        media: [
          { url: 'https://placehold.co/600x400/000000/FFFFFF/png?text=Coding+Session', type: 'image', filename: 'coding.png' }
        ],
        likes: [{ user: users[1]._id }, { user: users[2]._id }, { user: users[3]._id }],
        comments: [
          { user: users[2]._id, text: 'Finally understand hooks!' }
        ],
        visibility: 'public'
      },
      {
        caption: 'Headliner performance was INCREDIBLE! 🎵🔥',
        album: albums[1]._id,
        user: users[7]._id,
        media: [
          { url: 'https://placehold.co/600x400/EC4899/FFFFFF/png?text=Headliner', type: 'image', filename: 'headliner.png' }
        ],
        likes: [{ user: users[4]._id }, { user: users[5]._id }, { user: users[0]._id }],
        comments: [
          { user: users[5]._id, text: 'Best concert ever!' }
        ],
        visibility: 'public'
      },
      {
        caption: 'Peaceful sunrise during our yoga session 🧘‍♀️',
        album: albums[4]._id,
        user: users[9]._id,
        media: [
          { url: 'https://placehold.co/600x400/14B8A6/FFFFFF/png?text=Sunrise+Yoga', type: 'image', filename: 'sunrise-yoga.png' }
        ],
        likes: [{ user: users[7]._id }, { user: users[1]._id }],
        comments: [
          { user: users[1]._id, text: 'What a beautiful start to the day!' }
        ],
        visibility: 'public'
      }
    ];

    const posts = await Post.insertMany(samplePosts);
    console.log(`✅ Inserted ${posts.length} posts/memories`);
    posts.forEach((post, index) => {
      console.log(`   - Post ${index + 1}: ${post.caption.substring(0, 50)}...`);
    });
    console.log('');

    // Summary
    console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!\n');
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
    console.error('❌ Error seeding database:', error);
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

