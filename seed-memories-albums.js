const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import models
const User = require('./backend/models/User');
const Album = require('./backend/models/Album');
const Post = require('./backend/models/Post');
const Category = require('./backend/models/Category');
const Tag = require('./backend/models/Tag');

// Available images
const memoryImages = [
  'award-ceremony.png',
  'candid-moments.png', 
  'conference-keynote.png',
  'diverse-group-photo.png',
  'event-food.png',
  'networking-session.png',
  'professional-networking-event.png'
];

const postImages = [
  'grand-opening-ceremony.png',
  'modern-event-venue.png'
];

const eventImages = [
  'event1.jpg',
  'event2.jpg', 
  'event3.jpg',
  'event4.jpg',
  'event5.jpg'
];

// Sample data
const sampleAlbums = [
  {
    name: "Corporate Events 2024",
    description: "Collection of all corporate events and networking sessions from 2024",
    coverImage: "/images/memories/professional-networking-event.png"
  },
  {
    name: "Award Ceremonies",
    description: "Memorable moments from award ceremonies and recognition events",
    coverImage: "/images/memories/award-ceremony.png"
  },
  {
    name: "Conference Highlights",
    description: "Key moments and insights from various conferences and seminars",
    coverImage: "/images/memories/conference-keynote.png"
  },
  {
    name: "Team Building",
    description: "Fun and candid moments from team building activities",
    coverImage: "/images/memories/candid-moments.png"
  },
  {
    name: "Venue Showcases",
    description: "Beautiful venues and event spaces we've worked with",
    coverImage: "/images/posts/modern-event-venue.png"
  },
  {
    name: "Food & Catering",
    description: "Delicious food and catering experiences from our events",
    coverImage: "/images/memories/event-food.png"
  },
  {
    name: "Networking Sessions",
    description: "Professional networking and connection moments",
    coverImage: "/images/memories/networking-session.png"
  },
  {
    name: "Group Photos",
    description: "Diverse group photos from various events and gatherings",
    coverImage: "/images/memories/diverse-group-photo.png"
  }
];

const sampleMemories = [
  {
    title: "Annual Company Awards 2024",
    description: "Celebrating outstanding achievements and recognizing our top performers at the annual awards ceremony. A night filled with inspiration and recognition.",
    tags: ["awards", "recognition", "celebration", "achievement"],
    category: "highlights",
    visibility: "public",
    location: "Grand Ballroom, Downtown Hotel",
    date: new Date('2024-01-15'),
    imageUrl: "/images/memories/award-ceremony.png"
  },
  {
    title: "Tech Conference Keynote",
    description: "Inspiring keynote presentation on the future of technology and innovation. The speaker delivered powerful insights about digital transformation.",
    tags: ["technology", "innovation", "keynote", "conference"],
    category: "highlights", 
    visibility: "public",
    location: "Convention Center, Tech District",
    date: new Date('2024-02-20'),
    imageUrl: "/images/memories/conference-keynote.png"
  },
  {
    title: "Candid Team Moments",
    description: "Behind-the-scenes candid moments during our team building retreat. These authentic moments show the real spirit of our team.",
    tags: ["team", "candid", "authentic", "behind-the-scenes"],
    category: "candid",
    visibility: "private",
    location: "Mountain Resort, Lake District",
    date: new Date('2024-03-10'),
    imageUrl: "/images/memories/candid-moments.png"
  },
  {
    title: "Diverse Group Celebration",
    description: "Beautiful group photo showcasing the diversity and inclusivity of our community. A moment that represents unity and togetherness.",
    tags: ["diversity", "inclusion", "community", "unity"],
    category: "group",
    visibility: "public",
    location: "Community Center, Main Street",
    date: new Date('2024-03-25'),
    imageUrl: "/images/memories/diverse-group-photo.png"
  },
  {
    title: "Gourmet Event Catering",
    description: "Exquisite culinary experience featuring gourmet dishes and premium beverages. The catering team delivered an exceptional dining experience.",
    tags: ["food", "catering", "gourmet", "dining"],
    category: "venue",
    visibility: "public",
    location: "Luxury Hotel, City Center",
    date: new Date('2024-04-05'),
    imageUrl: "/images/memories/event-food.png"
  },
  {
    title: "Professional Networking Event",
    description: "High-level networking session bringing together industry leaders and professionals. Great connections and meaningful conversations.",
    tags: ["networking", "professional", "connections", "industry"],
    category: "highlights",
    visibility: "public",
    location: "Business Center, Financial District",
    date: new Date('2024-04-18'),
    imageUrl: "/images/memories/professional-networking-event.png"
  },
  {
    title: "Interactive Networking Session",
    description: "Engaging networking session with interactive activities and breakout discussions. Participants made valuable connections.",
    tags: ["networking", "interactive", "connections", "engagement"],
    category: "candid",
    visibility: "public",
    location: "Innovation Hub, Tech Campus",
    date: new Date('2024-05-02'),
    imageUrl: "/images/memories/networking-session.png"
  },
  {
    title: "Grand Opening Ceremony",
    description: "Spectacular grand opening ceremony for our new flagship venue. A milestone moment in our company's growth journey.",
    tags: ["grand-opening", "milestone", "celebration", "venue"],
    category: "highlights",
    visibility: "public",
    location: "Flagship Venue, Business District",
    date: new Date('2024-05-15'),
    imageUrl: "/images/posts/grand-opening-ceremony.png"
  },
  {
    title: "Modern Event Venue",
    description: "Showcasing our state-of-the-art event venue with cutting-edge technology and elegant design. Perfect for any occasion.",
    tags: ["venue", "modern", "technology", "design"],
    category: "venue",
    visibility: "public",
    location: "Modern Event Center, Innovation District",
    date: new Date('2024-05-28'),
    imageUrl: "/images/posts/modern-event-venue.png"
  },
  {
    title: "Team Building Adventure",
    description: "Exciting team building activities that brought our team closer together. Fun challenges and collaborative problem-solving.",
    tags: ["team-building", "adventure", "collaboration", "fun"],
    category: "group",
    visibility: "private",
    location: "Adventure Park, Mountain Range",
    date: new Date('2024-06-08'),
    imageUrl: "/images/memories/diverse-group-photo.png"
  },
  {
    title: "Award Night Preparation",
    description: "Behind-the-scenes preparation for the annual awards night. The team working hard to make everything perfect.",
    tags: ["preparation", "behind-the-scenes", "awards", "teamwork"],
    category: "candid",
    visibility: "private",
    location: "Event Hall, Corporate Center",
    date: new Date('2024-06-20'),
    imageUrl: "/images/memories/award-ceremony.png"
  },
  {
    title: "Conference Breakout Session",
    description: "Interactive breakout session during the tech conference. Participants engaged in deep discussions about emerging technologies.",
    tags: ["conference", "breakout", "discussion", "technology"],
    category: "candid",
    visibility: "public",
    location: "Conference Center, Tech District",
    date: new Date('2024-07-05'),
    imageUrl: "/images/memories/conference-keynote.png"
  }
];

const samplePosts = [
  {
    title: "Welcome to Our New Platform",
    content: "We're excited to announce the launch of our new event management platform. This will revolutionize how we organize and manage events.",
    imageUrl: "/images/posts/grand-opening-ceremony.png",
    tags: ["announcement", "platform", "launch", "innovation"],
    category: "announcement",
    visibility: "public",
    author: "admin"
  },
  {
    title: "Event Venue Showcase",
    content: "Take a virtual tour of our stunning event venues. From intimate spaces to grand halls, we have the perfect venue for every occasion.",
    imageUrl: "/images/posts/modern-event-venue.png",
    tags: ["venue", "showcase", "tour", "spaces"],
    category: "showcase",
    visibility: "public",
    author: "admin"
  },
  {
    title: "Memories from Last Month",
    content: "Here are some of our favorite memories from last month's events. Thank you to everyone who made these moments special.",
    imageUrl: "/images/memories/professional-networking-event.png",
    tags: ["memories", "monthly", "highlights", "thank-you"],
    category: "highlights",
    visibility: "public",
    author: "admin"
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // SSL/TLS configuration for MongoDB Atlas
      tls: true,
      tlsAllowInvalidCertificates: true, // For development
      authSource: 'admin',
      retryWrites: true,
      w: 'majority'
    });
    console.log('✅ Connected to MongoDB');
    
    // Test the connection
    await mongoose.connection.db.admin().ping();
    console.log('✅ MongoDB ping successful');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Main seeding function
const seedMemoriesAndAlbums = async () => {
  try {
    console.log('🌱 Starting memories and albums seeding...');
    
    // Get or create a sample user
    let user = await User.findOne({ email: 'admin@zynk.com' });
    if (!user) {
      user = await User.create({
        name: 'Admin User',
        email: 'admin@zynk.com',
        password: 'admin123', // This will be hashed by the model
        role: 'admin'
      });
      console.log('👤 Created admin user');
    }
    
    // Get or create categories
    const categories = await Category.find();
    if (categories.length === 0) {
      console.log('📂 No categories found, creating default categories...');
      await Category.insertMany([
        { name: 'highlights', description: 'Event highlights and key moments' },
        { name: 'candid', description: 'Candid and behind-the-scenes moments' },
        { name: 'group', description: 'Group photos and team activities' },
        { name: 'venue', description: 'Venue showcases and spaces' },
        { name: 'announcement', description: 'Important announcements' },
        { name: 'showcase', description: 'Showcase content' }
      ]);
    }
    
    // Get or create tags
    const allTags = [...new Set([
      ...sampleMemories.flatMap(m => m.tags),
      ...samplePosts.flatMap(p => p.tags)
    ])];
    
    for (const tagName of allTags) {
      await Tag.findOneAndUpdate(
        { name: tagName },
        { name: tagName, description: `Tag for ${tagName}` },
        { upsert: true }
      );
    }
    console.log('🏷️ Created/updated tags');
    
    // Create albums
    console.log('📁 Creating albums...');
    const existingAlbums = await Album.countDocuments();
    let createdAlbums = [];
    
    if (existingAlbums > 0) {
      console.log(`📁 Found ${existingAlbums} existing albums, skipping album creation`);
      createdAlbums = await Album.find().limit(sampleAlbums.length);
    } else {
      for (const albumData of sampleAlbums) {
        const album = await Album.create({
          ...albumData,
          userId: user._id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        createdAlbums.push(album);
      }
      console.log(`✅ Created ${createdAlbums.length} albums`);
    }
    
    // Create memories (posts) and associate them with albums
    console.log('📸 Creating memories...');
    const existingPosts = await Post.countDocuments();
    let createdMemories = [];
    
    if (existingPosts > 0) {
      console.log(`📸 Found ${existingPosts} existing posts, skipping memory creation`);
    } else {
      for (let i = 0; i < sampleMemories.length; i++) {
        const memoryData = sampleMemories[i];
        
        // Assign memory to an album (cycling through albums)
        const assignedAlbum = createdAlbums[i % createdAlbums.length];
        
        const memory = await Post.create({
          title: memoryData.title,
          content: memoryData.description,
          imageUrl: memoryData.imageUrl,
          tags: memoryData.tags,
          category: memoryData.category,
          visibility: memoryData.visibility,
          location: memoryData.location,
          eventDate: memoryData.date,
          userId: user._id,
          albumId: assignedAlbum._id,
          createdAt: memoryData.date,
          updatedAt: new Date(),
        likes: [],
        comments: [],
        views: Math.floor(Math.random() * 200) + 10
        });
        
        createdMemories.push(memory);
        
        // Update album with the new memory
        await Album.findByIdAndUpdate(
          assignedAlbum._id,
          { 
            $push: { posts: memory._id },
            $inc: { postCount: 1 },
            updatedAt: new Date()
          }
        );
      }
      console.log(`✅ Created ${createdMemories.length} memories`);
    }
    
    // Create standalone posts
    console.log('📝 Creating standalone posts...');
    let createdPosts = [];
    
    if (existingPosts > 0) {
      console.log(`⚠️  Skipping standalone posts (existing posts: ${existingPosts})`);
    } else {
      for (const postData of samplePosts) {
        const post = await Post.create({
          ...postData,
          userId: user._id,
          createdAt: new Date(),
          updatedAt: new Date(),
        likes: [],
        comments: [],
        views: Math.floor(Math.random() * 100) + 5
        });
        createdPosts.push(post);
      }
      console.log(`✅ Created ${createdPosts.length} standalone posts`);
    }
    
    // Create some additional memories with event images
    console.log('🎉 Creating additional event memories...');
    const eventTitles = [
      "Summer Gala 2024",
      "Tech Innovation Summit", 
      "Annual Charity Ball",
      "Product Launch Event",
      "Industry Conference"
    ];
    
    if (existingPosts > 0) {
      console.log(`⚠️  Skipping additional event memories (existing posts: ${existingPosts})`);
    } else {
      for (let i = 0; i < eventImages.length; i++) {
        const eventTitle = eventTitles[i] || `Event ${i + 1}`;
        const assignedAlbum = createdAlbums[i % createdAlbums.length];
        
        const eventMemory = await Post.create({
          title: eventTitle,
          content: `Memorable moments from ${eventTitle}. A fantastic event that brought together amazing people and created lasting memories.`,
          imageUrl: `/images/events/${eventImages[i]}`,
          tags: ["event", "memories", "celebration", "gathering"],
          category: "highlights",
          visibility: "public",
          location: "Various Venues",
          eventDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          userId: user._id,
          albumId: assignedAlbum._id,
          createdAt: new Date(),
          updatedAt: new Date(),
        likes: [],
        comments: [],
        views: Math.floor(Math.random() * 150) + 20
        });
        
        // Update album
        await Album.findByIdAndUpdate(
          assignedAlbum._id,
          { 
            $push: { posts: eventMemory._id },
            $inc: { postCount: 1 },
            updatedAt: new Date()
          }
        );
      }
      console.log(`✅ Created ${eventImages.length} additional event memories`);
    }
    
    // Summary
    console.log('\n🎉 Seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Albums created: ${createdAlbums.length}`);
    console.log(`   - Memories created: ${createdMemories.length}`);
    console.log(`   - Standalone posts created: ${createdPosts.length}`);
    console.log(`   - Additional event memories: ${eventImages.length}`);
    console.log(`   - Total posts: ${createdMemories.length + createdPosts.length + eventImages.length}`);
    console.log(`   - User: ${user.name} (${user.email})`);
    
  } catch (error) {
    console.error('❌ Error seeding memories and albums:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seeding
const runSeeding = async () => {
  await connectDB();
  await seedMemoriesAndAlbums();
};

runSeeding().catch(console.error);
