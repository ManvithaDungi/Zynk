const { MongoClient } = require('mongodb');
require('dotenv').config();

// Direct MongoDB connection without Mongoose
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zynk';
    console.log(`🔗 Connecting to: ${mongoUri}`);
    
    const client = new MongoClient(mongoUri);
    await client.connect();
    
    // Test the connection
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Connected to MongoDB');
    
    return client;
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
  { name: 'John Smith', email: 'john@example.com', password: '$2a$10$rQZ8K9mP2nL3oI4jK5lM6eN7fO8gP9hQ0iR1jS2kT3lU4mV5nW6oX7pY8qZ' }, // password123
  { name: 'Sarah Johnson', email: 'sarah@example.com', password: '$2a$10$rQZ8K9mP2nL3oI4jK5lM6eN7fO8gP9hQ0iR1jS2kT3lU4mV5nW6oX7pY8qZ' },
  { name: 'Mike Davis', email: 'mike@example.com', password: '$2a$10$rQZ8K9mP2nL3oI4jK5lM6eN7fO8gP9hQ0iR1jS2kT3lU4mV5nW6oX7pY8qZ' },
  { name: 'Lisa Chen', email: 'lisa@example.com', password: '$2a$10$rQZ8K9mP2nL3oI4jK5lM6eN7fO8gP9hQ0iR1jS2kT3lU4mV5nW6oX7pY8qZ' },
  { name: 'David Wilson', email: 'david@example.com', password: '$2a$10$rQZ8K9mP2nL3oI4jK5lM6eN7fO8gP9hQ0iR1jS2kT3lU4mV5nW6oX7pY8qZ' },
  { name: 'Emma Rodriguez', email: 'emma@example.com', password: '$2a$10$rQZ8K9mP2nL3oI4jK5lM6eN7fO8gP9hQ0iR1jS2kT3lU4mV5nW6oX7pY8qZ' },
  { name: 'Alex Thompson', email: 'alex@example.com', password: '$2a$10$rQZ8K9mP2nL3oI4jK5lM6eN7fO8gP9hQ0iR1jS2kT3lU4mV5nW6oX7pY8qZ' },
  { name: 'Maria Garcia', email: 'maria@example.com', password: '$2a$10$rQZ8K9mP2nL3oI4jK5lM6eN7fO8gP9hQ0iR1jS2kT3lU4mV5nW6oX7pY8qZ' },
  { name: 'James Brown', email: 'james@example.com', password: '$2a$10$rQZ8K9mP2nL3oI4jK5lM6eN7fO8gP9hQ0iR1jS2kT3lU4mV5nW6oX7pY8qZ' },
  { name: 'Rachel Kim', email: 'rachel@example.com', password: '$2a$10$rQZ8K9mP2nL3oI4jK5lM6eN7fO8gP9hQ0iR1jS2kT3lU4mV5nW6oX7pY8qZ' }
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
const seedDatabase = async (client) => {
  try {
    const db = client.db('zynk');
    console.log('🌱 Starting direct database seeding...\n');
    
    // Add timestamps to all documents
    const now = new Date();
    const addTimestamps = (docs) => docs.map(doc => ({ ...doc, createdAt: now, updatedAt: now }));
    
    // Seed Categories
    console.log('📂 Seeding categories...');
    const categoriesCollection = db.collection('categories');
    const existingCategories = await categoriesCollection.countDocuments();
    
    if (existingCategories === 0) {
      const categoriesWithTimestamps = addTimestamps(sampleCategories);
      await categoriesCollection.insertMany(categoriesWithTimestamps);
      console.log(`✅ Inserted ${sampleCategories.length} categories`);
    } else {
      console.log(`⚠️  Categories already exist (${existingCategories} found). Skipping...`);
    }
    
    // Get categories for reference
    const categories = await categoriesCollection.find({}).toArray();
    console.log('');
    
    // Seed Tags
    console.log('🏷️  Seeding tags...');
    const tagsCollection = db.collection('tags');
    const existingTags = await tagsCollection.countDocuments();
    
    if (existingTags === 0) {
      const tagsWithTimestamps = addTimestamps(
        sampleTags.map(name => ({ 
          name: name.toLowerCase(), 
          usageCount: Math.floor(Math.random() * 50),
          isActive: true
        }))
      );
      await tagsCollection.insertMany(tagsWithTimestamps);
      console.log(`✅ Inserted ${sampleTags.length} tags`);
    } else {
      console.log(`⚠️  Tags already exist (${existingTags} found). Skipping...`);
    }
    
    // Get tags for reference
    const tags = await tagsCollection.find({}).toArray();
    console.log('');
    
    // Seed Users
    console.log('👥 Seeding users...');
    const usersCollection = db.collection('users');
    const existingUsers = await usersCollection.countDocuments();
    
    if (existingUsers === 0) {
      const usersWithTimestamps = addTimestamps(sampleUsers);
      await usersCollection.insertMany(usersWithTimestamps);
      console.log(`✅ Inserted ${sampleUsers.length} users`);
    } else {
      console.log(`⚠️  Users already exist (${existingUsers} found). Skipping...`);
    }
    
    // Get users for reference
    const users = await usersCollection.find({}).toArray();
    console.log('');
    
    // Seed Events
    console.log('📅 Seeding events...');
    const eventsCollection = db.collection('events');
    const existingEvents = await eventsCollection.countDocuments();
    
    if (existingEvents === 0 && categories.length > 0 && users.length > 0) {
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
          status: 'active',
          isRecurring: false,
          recurringPattern: 'none',
          allowWaitlist: true,
          waitlistLimit: 50,
          allowChat: true,
          allowReviews: true,
          allowPolls: true,
          shareable: true,
          visibility: 'public',
          settings: {
            allowDownload: true,
            allowSharing: true,
            allowComments: true
          }
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
          status: 'active',
          isRecurring: false,
          recurringPattern: 'none',
          allowWaitlist: true,
          waitlistLimit: 50,
          allowChat: true,
          allowReviews: true,
          allowPolls: false,
          shareable: true,
          visibility: 'public',
          settings: {
            allowDownload: true,
            allowSharing: true,
            allowComments: true
          }
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
          status: 'active',
          isRecurring: false,
          recurringPattern: 'none',
          allowWaitlist: true,
          waitlistLimit: 50,
          allowChat: true,
          allowReviews: true,
          allowPolls: true,
          shareable: true,
          visibility: 'public',
          settings: {
            allowDownload: true,
            allowSharing: true,
            allowComments: true
          }
        }
      ];
      
      const eventsWithTimestamps = addTimestamps(sampleEvents);
      await eventsCollection.insertMany(eventsWithTimestamps);
      console.log(`✅ Inserted ${sampleEvents.length} events`);
    } else {
      console.log(`⚠️  Events already exist (${existingEvents} found). Skipping...`);
    }
    
    // Get events for reference
    const events = await eventsCollection.find({}).toArray();
    console.log('');
    
    // Seed Albums
    console.log('📸 Seeding albums...');
    const albumsCollection = db.collection('albums');
    const existingAlbums = await albumsCollection.countDocuments();
    
    if (existingAlbums === 0 && events.length > 0 && users.length > 0) {
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
      
      const albumsWithTimestamps = addTimestamps(sampleAlbums);
      await albumsCollection.insertMany(albumsWithTimestamps);
      console.log(`✅ Inserted ${sampleAlbums.length} albums`);
    } else {
      console.log(`⚠️  Albums already exist (${existingAlbums} found). Skipping...`);
    }
    
    // Get albums for reference
    const albums = await albumsCollection.find({}).toArray();
    console.log('');
    
    // Seed Posts
    console.log('🖼️  Seeding posts/memories...');
    const postsCollection = db.collection('posts');
    const existingPosts = await postsCollection.countDocuments();
    
    if (existingPosts === 0 && albums.length > 0 && users.length > 0) {
      const samplePosts = [
        {
          caption: 'Opening session was incredible! So much energy in the room.',
          album: albums[0]._id,
          user: users[1]._id,
          media: [
            { url: 'https://placehold.co/600x400/000000/FFFFFF/png?text=Workshop+Opening', type: 'image', filename: 'workshop-opening.png' }
          ],
          likes: [{ user: users[0]._id, likedAt: now }, { user: users[2]._id, likedAt: now }],
          comments: [
            { user: users[0]._id, text: 'Thanks for attending! Glad you enjoyed it.', createdAt: now }
          ],
          visibility: 'public',
          settings: {
            allowDownload: true,
            allowSharing: true,
            allowComments: true
          }
        },
        {
          caption: 'The main stage setup looks amazing! Can\'t wait for the performances.',
          album: albums[1]._id,
          user: users[5]._id,
          media: [
            { url: 'https://placehold.co/600x400/EC4899/FFFFFF/png?text=Music+Festival', type: 'image', filename: 'festival-stage.png' }
          ],
          likes: [{ user: users[4]._id, likedAt: now }, { user: users[7]._id, likedAt: now }],
          comments: [
            { user: users[4]._id, text: 'It\'s going to be epic!', createdAt: now }
          ],
          visibility: 'public',
          settings: {
            allowDownload: true,
            allowSharing: true,
            allowComments: true
          }
        },
        {
          caption: 'Sunset at Santorini - absolutely breathtaking!',
          album: albums[2]._id,
          user: users[1]._id,
          media: [
            { url: 'https://placehold.co/600x400/EF4444/FFFFFF/png?text=Santorini+Sunset', type: 'image', filename: 'santorini.png' }
          ],
          likes: [{ user: users[3]._id, likedAt: now }, { user: users[5]._id, likedAt: now }],
          comments: [
            { user: users[3]._id, text: 'This is on my bucket list!', createdAt: now }
          ],
          visibility: 'public',
          settings: {
            allowDownload: true,
            allowSharing: true,
            allowComments: true
          }
        }
      ];
      
      const postsWithTimestamps = addTimestamps(samplePosts);
      await postsCollection.insertMany(postsWithTimestamps);
      console.log(`✅ Inserted ${samplePosts.length} posts/memories`);
    } else {
      console.log(`⚠️  Posts already exist (${existingPosts} found). Skipping...`);
    }
    
    // Get final counts
    const finalCounts = {
      categories: await categoriesCollection.countDocuments(),
      tags: await tagsCollection.countDocuments(),
      users: await usersCollection.countDocuments(),
      events: await eventsCollection.countDocuments(),
      albums: await albumsCollection.countDocuments(),
      posts: await postsCollection.countDocuments()
    };
    
    // Summary
    console.log('\n🎉 DIRECT SEEDING COMPLETED!\n');
    console.log('📊 Final Database State:');
    console.log(`   - ${finalCounts.categories} Categories`);
    console.log(`   - ${finalCounts.tags} Tags`);
    console.log(`   - ${finalCounts.users} Users`);
    console.log(`   - ${finalCounts.events} Events`);
    console.log(`   - ${finalCounts.albums} Albums`);
    console.log(`   - ${finalCounts.posts} Posts/Memories`);
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
  let client;
  try {
    client = await connectDB();
    await seedDatabase(client);
    console.log('✅ Seeding completed successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('✅ Disconnected from MongoDB');
    }
    process.exit(0);
  }
};

main();
