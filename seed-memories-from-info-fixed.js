/**
 * Memory Seeding Script based on info.txt requirements
 * Creates albums and memories according to the specifications in frontend/public/images/memories/info.txt
 * Uses the same pattern as seed-images-fixed.js for reliable connection
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

// Base URL for images
const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Exact MongoDB connection string from env.txt
const MONGO_URI = 'mongodb+srv://manvitha:23318@cluster0.ju7oxft.mongodb.net/media';

// Connect to MongoDB using direct client
const connectDB = async () => {
  try {
    console.log(`🔗 Connecting to: ${MONGO_URI.replace(/\/\/.*@/, '//***:***@')}`);

    const client = new MongoClient(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      tls: true,
      tlsAllowInvalidCertificates: true,
      authSource: 'admin',
      retryWrites: true,
      w: 'majority'
    });

    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');

    return client;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Main seeding function
const seedMemoriesFromInfo = async () => {
  try {
    console.log('🚀 Starting memory seeding based on info.txt...\n');

    const client = await connectDB();
    const db = client.db();

    // Get collections
    const usersCollection = db.collection('users');
    const categoriesCollection = db.collection('categories');
    const albumsCollection = db.collection('albums');
    const eventsCollection = db.collection('events');
    const memoriesCollection = db.collection('memories');

    // Create or get a sample user
    let user = await usersCollection.findOne({ email: 'memory.creator@example.com' });
    if (!user) {
      const userResult = await usersCollection.insertOne({
        name: 'Memory Creator',
        email: 'memory.creator@example.com',
        password: 'password123',
        bio: 'Creator of amazing memories',
        isVerified: true,
        followers: [],
        following: [],
        postsCount: 0,
        isPrivate: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      user = { _id: userResult.insertedId, email: 'memory.creator@example.com' };
      console.log('✅ Created sample user');
    } else {
      console.log('✅ Using existing user');
    }

    // Create categories if they don't exist
    const categoryNames = ['Music & Entertainment', 'Education & Workshops', 'Arts & Crafts', 'Games & Recreation'];
    const categories = {};

    for (const name of categoryNames) {
      let category = await categoriesCollection.findOne({ name });
      if (!category) {
        const categoryResult = await categoriesCollection.insertOne({
          name,
          description: `${name} events and activities`,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        category = { _id: categoryResult.insertedId, name };
        console.log(`✅ Created category: ${name}`);
      }
      categories[name] = category;
    }

    // Find or create events that match the requirements
    console.log('🎯 Finding or creating required events...');
    
    // Find "Balance Your Uni Life" event
    let balanceEvent = await eventsCollection.findOne({ title: { $regex: /balance.*uni.*life/i } });
    if (!balanceEvent) {
      const balanceEventResult = await eventsCollection.insertOne({
        title: 'Balance Your Uni Life',
        description: 'Study and social balance workshop for university students',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        time: '14:00',
        location: 'Student Center, Room 201',
        category: categories['Education & Workshops']._id,
        maxAttendees: 75,
        organizer: user._id,
        status: 'active',
        visibility: 'public',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      balanceEvent = { _id: balanceEventResult.insertedId, title: 'Balance Your Uni Life' };
      console.log('✅ Created "Balance Your Uni Life" event');
    } else {
      console.log('✅ Found existing "Balance Your Uni Life" event');
    }

    // Find "Board Games Night" event
    let boardGamesEvent = await eventsCollection.findOne({ title: { $regex: /board.*games.*night/i } });
    if (!boardGamesEvent) {
      const boardGamesEventResult = await eventsCollection.insertOne({
        title: 'Board Games Night 2024',
        description: 'Join us for an exciting evening of board games and socializing with fellow students.',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        time: '19:00',
        location: 'Student Recreation Center',
        category: categories['Games & Recreation']._id,
        maxAttendees: 40,
        organizer: user._id,
        status: 'active',
        visibility: 'public',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      boardGamesEvent = { _id: boardGamesEventResult.insertedId, title: 'Board Games Night 2024' };
      console.log('✅ Created "Board Games Night 2024" event');
    } else {
      console.log('✅ Found existing "Board Games Night 2024" event');
    }

    // Create albums and memories based on info.txt specifications
    console.log('\n📸 Creating albums and memories based on info.txt...\n');

    // 1. Create "Food Fest" album with mem6, mem7, mem5
    console.log('🍕 Creating Food Fest album...');
    let foodFestAlbum = await albumsCollection.findOne({ name: 'Food Fest' });
    if (!foodFestAlbum) {
      const foodFestAlbumResult = await albumsCollection.insertOne({
        name: 'Food Fest',
        description: 'Delicious moments from our food festival - students enjoying meals together',
        createdBy: user._id,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      foodFestAlbum = { _id: foodFestAlbumResult.insertedId, name: 'Food Fest' };
      console.log('✅ Created Food Fest album');
    } else {
      console.log('✅ Using existing Food Fest album');
    }

    // Create memories for Food Fest album
    const foodFestMemories = [
      {
        title: 'Group Dining Experience',
        description: 'A bunch of people eating together at the food festival',
        mediaUrl: `${BASE_URL}/images/memories/mem6.jpg`,
        mediaType: 'image',
        album: foodFestAlbum._id,
        event: balanceEvent._id,
        createdBy: user._id
      },
      {
        title: 'College Students Meal Time',
        description: 'College students eating together and sharing stories',
        mediaUrl: `${BASE_URL}/images/memories/mem7.jpg`,
        mediaType: 'image',
        album: foodFestAlbum._id,
        event: balanceEvent._id,
        createdBy: user._id
      },
      {
        title: 'Restaurant Gathering',
        description: 'College students enjoying a meal together in a restaurant',
        mediaUrl: `${BASE_URL}/images/memories/mem5.jpg`,
        mediaType: 'image',
        album: foodFestAlbum._id,
        event: balanceEvent._id,
        createdBy: user._id
      }
    ];

    let foodFestMemoryCount = 0;
    for (const memoryData of foodFestMemories) {
      const existingMemory = await memoriesCollection.findOne({ title: memoryData.title });
      if (!existingMemory) {
        await memoriesCollection.insertOne({
          ...memoryData,
          likes: [],
          comments: [],
          likesCount: 0,
          commentsCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        foodFestMemoryCount++;
        console.log(`✅ Created memory: ${memoryData.title}`);
      }
    }
    console.log(`✅ Food Fest album: ${foodFestMemoryCount} new memories created`);

    // 2. Create "Biochem Lab" album with mem9, mem2, mem1
    console.log('\n🧪 Creating Biochem Lab album...');
    let biochemLabAlbum = await albumsCollection.findOne({ name: 'Biochem Lab' });
    if (!biochemLabAlbum) {
      const biochemLabAlbumResult = await albumsCollection.insertOne({
        name: 'Biochem Lab',
        description: 'Scientific moments from biochemistry laboratory sessions',
        createdBy: user._id,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      biochemLabAlbum = { _id: biochemLabAlbumResult.insertedId, name: 'Biochem Lab' };
      console.log('✅ Created Biochem Lab album');
    } else {
      console.log('✅ Using existing Biochem Lab album');
    }

    // Create memories for Biochem Lab album
    const biochemLabMemories = [
      {
        title: 'Friends in Biochem Lab',
        description: 'Friends working together in a biochemistry laboratory',
        mediaUrl: `${BASE_URL}/images/memories/mem9.jpg`,
        mediaType: 'image',
        album: biochemLabAlbum._id,
        event: balanceEvent._id,
        createdBy: user._id
      },
      {
        title: 'Lab Partners Working',
        description: 'Two students working together in a biochemistry lab',
        mediaUrl: `${BASE_URL}/images/memories/mem2.jpg`,
        mediaType: 'image',
        album: biochemLabAlbum._id,
        event: balanceEvent._id,
        createdBy: user._id
      },
      {
        title: 'Test Tube Experiment',
        description: 'Two students working in a lab with test tubes',
        mediaUrl: `${BASE_URL}/images/memories/mem1.jpg`,
        mediaType: 'image',
        album: biochemLabAlbum._id,
        event: balanceEvent._id,
        createdBy: user._id
      }
    ];

    let biochemLabMemoryCount = 0;
    for (const memoryData of biochemLabMemories) {
      const existingMemory = await memoriesCollection.findOne({ title: memoryData.title });
      if (!existingMemory) {
        await memoriesCollection.insertOne({
          ...memoryData,
          likes: [],
          comments: [],
          likesCount: 0,
          commentsCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        biochemLabMemoryCount++;
        console.log(`✅ Created memory: ${memoryData.title}`);
      }
    }
    console.log(`✅ Biochem Lab album: ${biochemLabMemoryCount} new memories created`);

    // 3. Create "Study Group" album with mem8
    console.log('\n📚 Creating Study Group album...');
    let studyGroupAlbum = await albumsCollection.findOne({ name: 'Study Group' });
    if (!studyGroupAlbum) {
      const studyGroupAlbumResult = await albumsCollection.insertOne({
        name: 'Study Group',
        description: 'Students studying together and supporting each other',
        createdBy: user._id,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      studyGroupAlbum = { _id: studyGroupAlbumResult.insertedId, name: 'Study Group' };
      console.log('✅ Created Study Group album');
    } else {
      console.log('✅ Using existing Study Group album');
    }

    // Create memory for Study Group album
    const studyGroupMemory = {
      title: 'Study Session',
      description: 'Students studying together in a collaborative environment',
      mediaUrl: `${BASE_URL}/images/memories/mem8.jpg`,
      mediaType: 'image',
      album: studyGroupAlbum._id,
      event: balanceEvent._id, // Link to "Balance Your Uni Life" event
      createdBy: user._id
    };

    const existingStudyMemory = await memoriesCollection.findOne({ title: studyGroupMemory.title });
    let studyGroupMemoryCount = 0;
    if (!existingStudyMemory) {
      await memoriesCollection.insertOne({
        ...studyGroupMemory,
        likes: [],
        comments: [],
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      studyGroupMemoryCount++;
      console.log(`✅ Created memory: ${studyGroupMemory.title}`);
    }
    console.log(`✅ Study Group album: ${studyGroupMemoryCount} new memories created`);

    // 4. Create standalone memory for Board Game Night (mem4)
    console.log('\n🎲 Creating standalone Board Game Night memory...');
    const boardGameMemory = {
      title: 'Board Game Night',
      description: 'Students enjoying board games and socializing together',
      mediaUrl: `${BASE_URL}/images/memories/mem4.jpg`,
      mediaType: 'image',
      album: foodFestAlbum._id, // Use existing album for standalone memory
      event: boardGamesEvent._id, // Link to "Board Games Night 2024" event
      createdBy: user._id
    };

    const existingBoardGameMemory = await memoriesCollection.findOne({ title: boardGameMemory.title });
    let boardGameMemoryCount = 0;
    if (!existingBoardGameMemory) {
      await memoriesCollection.insertOne({
        ...boardGameMemory,
        likes: [],
        comments: [],
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      boardGameMemoryCount++;
      console.log(`✅ Created memory: ${boardGameMemory.title}`);
    }
    console.log(`✅ Board Game Night: ${boardGameMemoryCount} new memories created`);

    // 5. Create standalone memory for Guitar Singing (mem3)
    console.log('\n🎸 Creating standalone Guitar Singing memory...');
    const guitarSingingMemory = {
      title: 'Guitar Singing Session',
      description: 'Bunch of students having fun, singing with a guitar',
      mediaUrl: `${BASE_URL}/images/memories/mem3.jpg`,
      mediaType: 'image',
      album: foodFestAlbum._id, // Use existing album for standalone memory
      event: balanceEvent._id, // Link to existing event
      createdBy: user._id
    };

    const existingGuitarMemory = await memoriesCollection.findOne({ title: guitarSingingMemory.title });
    let guitarMemoryCount = 0;
    if (!existingGuitarMemory) {
      await memoriesCollection.insertOne({
        ...guitarSingingMemory,
        likes: [],
        comments: [],
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      guitarMemoryCount++;
      console.log(`✅ Created memory: ${guitarSingingMemory.title}`);
    }
    console.log(`✅ Guitar Singing: ${guitarMemoryCount} new memories created`);

    const totalNewMemories = foodFestMemoryCount + biochemLabMemoryCount + studyGroupMemoryCount + boardGameMemoryCount + guitarMemoryCount;

    console.log('\n✨ Memory seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Albums: 3 (Food Fest, Biochem Lab, Study Group)`);
    console.log(`   - Total new memories created: ${totalNewMemories}`);
    console.log(`   - Events linked: Balance Your Uni Life, Board Games Night 2024`);
    console.log('\n🎉 Memories are now available on your frontend!');
    console.log('📱 Check your memories section to see the new content');

    await client.close();
    console.log('🔌 Database connection closed');

    process.exit(0);
  } catch (error) {
    console.error('💥 Error during memory seeding:', error.message);
    process.exit(1);
  }
};

// Run the seeding
seedMemoriesFromInfo();
