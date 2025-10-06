const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config();

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
    coverImage: "/images/memories/professional-networking-event.png",
    postCount: 0,
    posts: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Award Ceremonies",
    description: "Memorable moments from award ceremonies and recognition events",
    coverImage: "/images/memories/award-ceremony.png",
    postCount: 0,
    posts: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Conference Highlights",
    description: "Key moments and insights from various conferences and seminars",
    coverImage: "/images/memories/conference-keynote.png",
    postCount: 0,
    posts: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Team Building",
    description: "Fun and candid moments from team building activities",
    coverImage: "/images/memories/candid-moments.png",
    postCount: 0,
    posts: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Venue Showcases",
    description: "Beautiful venues and event spaces we've worked with",
    coverImage: "/images/posts/modern-event-venue.png",
    postCount: 0,
    posts: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Food & Catering",
    description: "Delicious food and catering experiences from our events",
    coverImage: "/images/memories/event-food.png",
    postCount: 0,
    posts: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Networking Sessions",
    description: "Professional networking and connection moments",
    coverImage: "/images/memories/networking-session.png",
    postCount: 0,
    posts: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Group Photos",
    description: "Diverse group photos from various events and gatherings",
    coverImage: "/images/memories/diverse-group-photo.png",
    postCount: 0,
    posts: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const sampleMemories = [
  {
    title: "Annual Company Awards 2024",
    content: "Celebrating outstanding achievements and recognizing our top performers at the annual awards ceremony. A night filled with inspiration and recognition.",
    tags: ["awards", "recognition", "celebration", "achievement"],
    category: "highlights",
    visibility: "public",
    location: "Grand Ballroom, Downtown Hotel",
    eventDate: new Date('2024-01-15'),
    imageUrl: "/images/memories/award-ceremony.png",
    likes: [],
    comments: [],
    views: 156,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    title: "Tech Conference Keynote",
    content: "Inspiring keynote presentation on the future of technology and innovation. The speaker delivered powerful insights about digital transformation.",
    tags: ["technology", "innovation", "keynote", "conference"],
    category: "highlights", 
    visibility: "public",
    location: "Convention Center, Tech District",
    eventDate: new Date('2024-02-20'),
    imageUrl: "/images/memories/conference-keynote.png",
    likes: [],
    comments: [],
    views: 203,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date()
  },
  {
    title: "Candid Team Moments",
    content: "Behind-the-scenes candid moments during our team building retreat. These authentic moments show the real spirit of our team.",
    tags: ["team", "candid", "authentic", "behind-the-scenes"],
    category: "candid",
    visibility: "private",
    location: "Mountain Resort, Lake District",
    eventDate: new Date('2024-03-10'),
    imageUrl: "/images/memories/candid-moments.png",
    likes: [],
    comments: [],
    views: 89,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date()
  },
  {
    title: "Diverse Group Celebration",
    content: "Beautiful group photo showcasing the diversity and inclusivity of our community. A moment that represents unity and togetherness.",
    tags: ["diversity", "inclusion", "community", "unity"],
    category: "group",
    visibility: "public",
    location: "Community Center, Main Street",
    eventDate: new Date('2024-03-25'),
    imageUrl: "/images/memories/diverse-group-photo.png",
    likes: [],
    comments: [],
    views: 234,
    createdAt: new Date('2024-03-25'),
    updatedAt: new Date()
  },
  {
    title: "Gourmet Event Catering",
    content: "Exquisite culinary experience featuring gourmet dishes and premium beverages. The catering team delivered an exceptional dining experience.",
    tags: ["food", "catering", "gourmet", "dining"],
    category: "venue",
    visibility: "public",
    location: "Luxury Hotel, City Center",
    eventDate: new Date('2024-04-05'),
    imageUrl: "/images/memories/event-food.png",
    likes: [],
    comments: [],
    views: 178,
    createdAt: new Date('2024-04-05'),
    updatedAt: new Date()
  },
  {
    title: "Professional Networking Event",
    content: "High-level networking session bringing together industry leaders and professionals. Great connections and meaningful conversations.",
    tags: ["networking", "professional", "connections", "industry"],
    category: "highlights",
    visibility: "public",
    location: "Business Center, Financial District",
    eventDate: new Date('2024-04-18'),
    imageUrl: "/images/memories/professional-networking-event.png",
    likes: [],
    comments: [],
    views: 189,
    createdAt: new Date('2024-04-18'),
    updatedAt: new Date()
  },
  {
    title: "Interactive Networking Session",
    content: "Engaging networking session with interactive activities and breakout discussions. Participants made valuable connections.",
    tags: ["networking", "interactive", "connections", "engagement"],
    category: "candid",
    visibility: "public",
    location: "Innovation Hub, Tech Campus",
    eventDate: new Date('2024-05-02'),
    imageUrl: "/images/memories/networking-session.png",
    likes: [],
    comments: [],
    views: 145,
    createdAt: new Date('2024-05-02'),
    updatedAt: new Date()
  },
  {
    title: "Grand Opening Ceremony",
    content: "Spectacular grand opening ceremony for our new flagship venue. A milestone moment in our company's growth journey.",
    tags: ["grand-opening", "milestone", "celebration", "venue"],
    category: "highlights",
    visibility: "public",
    location: "Flagship Venue, Business District",
    eventDate: new Date('2024-05-15'),
    imageUrl: "/images/posts/grand-opening-ceremony.png",
    likes: [],
    comments: [],
    views: 267,
    createdAt: new Date('2024-05-15'),
    updatedAt: new Date()
  },
  {
    title: "Modern Event Venue",
    content: "Showcasing our state-of-the-art event venue with cutting-edge technology and elegant design. Perfect for any occasion.",
    tags: ["venue", "modern", "technology", "design"],
    category: "venue",
    visibility: "public",
    location: "Modern Event Center, Innovation District",
    eventDate: new Date('2024-05-28'),
    imageUrl: "/images/posts/modern-event-venue.png",
    likes: [],
    comments: [],
    views: 198,
    createdAt: new Date('2024-05-28'),
    updatedAt: new Date()
  },
  {
    title: "Team Building Adventure",
    content: "Exciting team building activities that brought our team closer together. Fun challenges and collaborative problem-solving.",
    tags: ["team-building", "adventure", "collaboration", "fun"],
    category: "group",
    visibility: "private",
    location: "Adventure Park, Mountain Range",
    eventDate: new Date('2024-06-08'),
    imageUrl: "/images/memories/diverse-group-photo.png",
    likes: [],
    comments: [],
    views: 112,
    createdAt: new Date('2024-06-08'),
    updatedAt: new Date()
  },
  {
    title: "Award Night Preparation",
    content: "Behind-the-scenes preparation for the annual awards night. The team working hard to make everything perfect.",
    tags: ["preparation", "behind-the-scenes", "awards", "teamwork"],
    category: "candid",
    visibility: "private",
    location: "Event Hall, Corporate Center",
    eventDate: new Date('2024-06-20'),
    imageUrl: "/images/memories/award-ceremony.png",
    likes: [],
    comments: [],
    views: 87,
    createdAt: new Date('2024-06-20'),
    updatedAt: new Date()
  },
  {
    title: "Conference Breakout Session",
    content: "Interactive breakout session during the tech conference. Participants engaged in deep discussions about emerging technologies.",
    tags: ["conference", "breakout", "discussion", "technology"],
    category: "candid",
    visibility: "public",
    location: "Conference Center, Tech District",
    eventDate: new Date('2024-07-05'),
    imageUrl: "/images/memories/conference-keynote.png",
    likes: [],
    comments: [],
    views: 134,
    createdAt: new Date('2024-07-05'),
    updatedAt: new Date()
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
    likes: [],
    comments: [],
    views: 89,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Event Venue Showcase",
    content: "Take a virtual tour of our stunning event venues. From intimate spaces to grand halls, we have the perfect venue for every occasion.",
    imageUrl: "/images/posts/modern-event-venue.png",
    tags: ["venue", "showcase", "tour", "spaces"],
    category: "showcase",
    visibility: "public",
    likes: [],
    comments: [],
    views: 67,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Memories from Last Month",
    content: "Here are some of our favorite memories from last month's events. Thank you to everyone who made these moments special.",
    imageUrl: "/images/memories/professional-networking-event.png",
    tags: ["memories", "monthly", "highlights", "thank-you"],
    category: "highlights",
    visibility: "public",
    likes: [],
    comments: [],
    views: 78,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Connect to MongoDB
const connectDB = async () => {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zynk');
  await client.connect();
  console.log('✅ Connected to MongoDB');
  return client;
};

// Main seeding function
const seedMemoriesAndAlbums = async () => {
  const client = await connectDB();
  const db = client.db();
  
  try {
    console.log('🌱 Starting memories and albums seeding...');
    
    // Get or create a sample user
    const usersCollection = db.collection('users');
    let user = await usersCollection.findOne({ email: 'admin@zynk.com' });
    
    if (!user) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const userResult = await usersCollection.insertOne({
        name: 'Admin User',
        email: 'admin@zynk.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      user = { _id: userResult.insertedId, name: 'Admin User', email: 'admin@zynk.com' };
      console.log('👤 Created admin user');
    } else {
      console.log('👤 Found existing admin user');
    }
    
    // Create albums
    console.log('📁 Creating albums...');
    const albumsCollection = db.collection('albums');
    
    // Check if albums already exist
    const existingAlbums = await albumsCollection.countDocuments();
    if (existingAlbums > 0) {
      console.log(`📁 Found ${existingAlbums} existing albums, skipping album creation`);
    } else {
      const albumsWithUserId = sampleAlbums.map(album => ({
        ...album,
        userId: user._id
      }));
      
      const albumResult = await albumsCollection.insertMany(albumsWithUserId);
      console.log(`✅ Created ${albumResult.insertedCount} albums`);
    }
    
    // Get all albums for memory assignment
    const allAlbums = await albumsCollection.find({}).toArray();
    
    // Create memories (posts) and associate them with albums
    console.log('📸 Creating memories...');
    const postsCollection = db.collection('posts');
    
    // Check if posts already exist
    const existingPosts = await postsCollection.countDocuments();
    if (existingPosts > 0) {
      console.log(`📸 Found ${existingPosts} existing posts, skipping memory creation`);
    } else {
      const createdMemories = [];
      
      for (let i = 0; i < sampleMemories.length; i++) {
        const memoryData = sampleMemories[i];
        
        // Assign memory to an album (cycling through albums)
        const assignedAlbum = allAlbums[i % allAlbums.length];
        
        const memory = {
          ...memoryData,
          userId: user._id,
          albumId: assignedAlbum._id
        };
        
        const memoryResult = await postsCollection.insertOne(memory);
        createdMemories.push(memoryResult.insertedId);
        
        // Update album with the new memory
        await albumsCollection.updateOne(
          { _id: assignedAlbum._id },
          { 
            $push: { posts: memoryResult.insertedId },
            $inc: { postCount: 1 },
            $set: { updatedAt: new Date() }
          }
        );
      }
      console.log(`✅ Created ${createdMemories.length} memories`);
    }
    
    // Create standalone posts
    console.log('📝 Creating standalone posts...');
    const standalonePosts = samplePosts.map(post => ({
      ...post,
      userId: user._id
    }));
    
    // Only create standalone posts if no existing posts
    if (existingPosts === 0) {
      const postResult = await postsCollection.insertMany(standalonePosts);
      console.log(`✅ Created ${postResult.insertedCount} standalone posts`);
    } else {
      console.log(`⚠️  Skipping standalone posts (existing posts: ${existingPosts})`);
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
    
    // Only create additional event memories if we have albums and no existing posts
    if (allAlbums.length > 0 && existingPosts === 0) {
      const eventMemories = [];
      for (let i = 0; i < eventImages.length; i++) {
        const eventTitle = eventTitles[i] || `Event ${i + 1}`;
        const assignedAlbum = allAlbums[i % allAlbums.length];
        
        const eventMemory = {
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
          likes: Math.floor(Math.random() * 40) + 8,
          comments: Math.floor(Math.random() * 12) + 2,
          views: Math.floor(Math.random() * 150) + 20
        };
        
        const eventResult = await postsCollection.insertOne(eventMemory);
        eventMemories.push(eventResult.insertedId);
        
        // Update album
        await albumsCollection.updateOne(
          { _id: assignedAlbum._id },
          { 
            $push: { posts: eventResult.insertedId },
            $inc: { postCount: 1 },
            $set: { updatedAt: new Date() }
          }
        );
      }
      console.log(`✅ Created ${eventMemories.length} additional event memories`);
    } else {
      console.log(`⚠️  Skipping additional event memories (existing posts: ${existingPosts}, albums: ${allAlbums.length})`);
    }
    
    // Summary
    const totalAlbums = await albumsCollection.countDocuments();
    const totalPosts = await postsCollection.countDocuments();
    
    console.log('\n🎉 Seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Total albums: ${totalAlbums}`);
    console.log(`   - Total posts: ${totalPosts}`);
    console.log(`   - User: ${user.name} (${user.email})`);
    
  } catch (error) {
    console.error('❌ Error seeding memories and albums:', error);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seeding
seedMemoriesAndAlbums().catch(console.error);
