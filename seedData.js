const mongoose = require("mongoose");
require("dotenv").config();

// Sample data for testing all forms
const sampleMemories = [
  {
    title: "Opening Ceremony Highlights",
    description: "Amazing moments from the event opening",
    author: "John Smith",
    category: "Event Highlights",
    tags: ["memorable", "exciting"],
    imageUrl: "/grand-opening-ceremony.png",
    status: "pending",
    priority: "high",
    visibility: "public",
    createdAt: new Date("2024-01-15"),
    reportCount: 0,
    likes: [],
    shares:12,
    views: 120,
    comments: [],
  },
  {
    title: "Group Photo Session",
    description: "Team building group photos",
    author: "Sarah Johnson",
    category: "Group Photos",
    tags: ["fun", "team"],
    imageUrl: "/diverse-group-photo.png",
    status: "approved",
    priority: "medium",
    visibility: "public",
    createdAt: new Date("2024-01-16"),
    reportCount: 0,
    likes: [],
    shares:12,
    views: 89,
    comments: [],
  },
  {
    title: "Candid Moments",
    description: "Natural, unposed moments",
    author: "Mike Davis",
    category: "Candid Moments",
    tags: ["natural", "beautiful"],
    imageUrl: "/candid-moments.png",
    status: "flagged",
    priority: "low",
    visibility: "restricted",
    createdAt: new Date("2024-01-17"),
    reportCount: 2,
    likes: [],
    shares:12,
    views: 67,
    comments: [],
  },
  {
    title: "Venue Architecture",
    description: "Beautiful venue shots",
    author: "Lisa Chen",
    category: "Venue Shots",
    tags: ["architecture", "beautiful"],
    imageUrl: "/modern-event-venue.png",
    status: "pending",
    priority: "medium",
    visibility: "public",
    createdAt: new Date("2024-01-18"),
    reportCount: 0,
    likes: [],
    shares:12,
    views: 95,
    comments: [],
  },
  {
    title: "Award Ceremony",
    description: "Recognition and awards presentation",
    author: "David Wilson",
    category: "Event Highlights",
    tags: ["achievement", "memorable"],
    imageUrl: "/award-ceremony.png",
    status: "approved",
    priority: "high",
    visibility: "public",
    createdAt: new Date("2024-01-19"),
    reportCount: 0,
    likes: [],
    shares:12,
    views: 156,
    comments: [],
  },
  {
    title: "Networking Session",
    description: "Professional networking and connections",
    author: "Emma Rodriguez",
    category: "Event Highlights",
    tags: ["networking", "professional"],
    imageUrl: "/professional-networking-event.png",
    status: "approved",
    priority: "high",
    visibility: "public",
    createdAt: new Date("2024-01-20"),
    reportCount: 0,
    likes: [],
    views: 134,
    comments: [],
    shares: 15,
  },
  {
    title: "Workshop Activities",
    description: "Interactive workshop sessions",
    author: "Alex Thompson",
    category: "Group Photos",
    tags: ["learning", "interactive"],
    imageUrl: "/diverse-group-photo.png",
    status: "pending",
    priority: "medium",
    visibility: "public",
    createdAt: new Date("2024-01-21"),
    reportCount: 0,
    likes: [],
    views: 102,
    comments: [],
    shares: 7,
  },
  {
    title: "Evening Reception",
    description: "Elegant evening reception moments",
    author: "Maria Garcia",
    category: "Candid Moments",
    tags: ["elegant", "evening"],
    imageUrl: "/candid-moments.png",
    status: "approved",
    priority: "medium",
    visibility: "public",
    createdAt: new Date("2024-01-22"),
    reportCount: 0,
    likes: [],
    views: 118,
    comments: [],
    shares: 11,
  },
  {
    title: "Outdoor Activities",
    description: "Fun outdoor team activities",
    author: "James Brown",
    category: "Group Photos",
    tags: ["outdoor", "activities"],
    imageUrl: "/modern-event-venue.png",
    status: "flagged",
    priority: "low",
    visibility: "private",
    createdAt: new Date("2024-01-23"),
    reportCount: 1,
    likes: [],
    views: 78,
    comments: [],
    shares: 3,
  },
  {
    title: "Closing Ceremony",
    description: "Memorable closing ceremony highlights",
    author: "Rachel Kim",
    category: "Event Highlights",
    tags: ["closing", "memorable"],
    imageUrl: "/grand-opening-ceremony.png",
    status: "approved",
    priority: "high",
    visibility: "public",
    createdAt: new Date("2024-01-24"),
    reportCount: 0,
    likes: [],
    views: 189,
    comments: [],
    shares: 22,
  },
];

const sampleUsers = [
  { name: "John Smith", email: "john@example.com", role: "organizer" },
  { name: "Sarah Johnson", email: "sarah@example.com", role: "attendee" },
  { name: "Mike Davis", email: "mike@example.com", role: "photographer" },
  { name: "Lisa Chen", email: "lisa@example.com", role: "attendee" },
  { name: "David Wilson", email: "david@example.com", role: "organizer" },
  { name: "Emma Rodriguez", email: "emma@example.com", role: "attendee" },
  { name: "Alex Thompson", email: "alex@example.com", role: "photographer" },
  { name: "Maria Garcia", email: "maria@example.com", role: "attendee" },
  { name: "James Brown", email: "james@example.com", role: "organizer" },
  { name: "Rachel Kim", email: "rachel@example.com", role: "attendee" },
];

const sampleGroups = [
  { name: "Event Organizers", memberCount: 8, description: "Main event organizing team" },
  { name: "Photographers", memberCount: 5, description: "Official event photographers" },
  { name: "VIP Attendees", memberCount: 15, description: "Special guests and VIPs" },
  { name: "Workshop Leaders", memberCount: 6, description: "Session facilitators and speakers" },
  { name: "Volunteers", memberCount: 12, description: "Event support volunteers" },
];

const sampleAnalytics = [
  {
    date: "2024-01-15",
    views: 120,
    likes: [],
    comments: [],
    shares: 12,
    category: "Event Highlights",
  },
  {
    date: "2024-01-16",
    views: 89,
    likes: [],
    comments: [],
    shares: 8,
    category: "Group Photos",
  },
  {
    date: "2024-01-17",
    views: 67,
    likes: [],
    comments: [],
    shares: 2,
    category: "Candid Moments",
  },
  {
    date: "2024-01-18",
    views: 95,
    likes: [],
    comments: [],
    shares: 5,
    category: "Venue Shots",
  },
  {
    date: "2024-01-19",
    views: 156,
    likes: [],
    comments: [],
    shares: 18,
    category: "Event Highlights",
  },
  {
    date: "2024-01-20",
    views: 134,
    likes: [],
    comments: [],
    shares: 15,
    category: "Event Highlights",
  },
  {
    date: "2024-01-21",
    views: 102,
    likes: [],
    comments: [],
    shares: 7,
    category: "Group Photos",
  },
  {
    date: "2024-01-22",
    views: 118,
    likes: [],
    comments: [],
    shares: 11,
    category: "Candid Moments",
  },
  {
    date: "2024-01-23",
    views: 78,
    likes: [],
    comments: [],
    shares: 3,
    category: "Group Photos",
  },
  {
    date: "2024-01-24",
    views: 189,
    likes: [],
    comments: [],
    shares: 22,
    category: "Event Highlights",
  },
]

async function seedDatabase() {
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
    console.log("Connected to MongoDB");

    // Check for existing data and only insert if collections are empty
    const memoriesCollection = mongoose.connection.db.collection("memories");
    const usersCollection = mongoose.connection.db.collection("users");
    const groupsCollection = mongoose.connection.db.collection("groups");

    // Check existing counts
    const existingMemories = await memoriesCollection.countDocuments();
    const existingUsers = await usersCollection.countDocuments();
    const existingGroups = await groupsCollection.countDocuments();

    console.log(`📊 Existing data found:`);
    console.log(`   - Memories: ${existingMemories}`);
    console.log(`   - Users: ${existingUsers}`);
    console.log(`   - Groups: ${existingGroups}`);

    // Insert sample data only if collections are empty
    if (existingMemories === 0) {
      await memoriesCollection.insertMany(sampleMemories);
      console.log(`✅ Inserted ${sampleMemories.length} memories`);
    } else {
      console.log(`⚠️  Memories already exist (${existingMemories} found). Skipping...`);
    }

    if (existingUsers === 0) {
      await usersCollection.insertMany(sampleUsers);
      console.log(`✅ Inserted ${sampleUsers.length} users`);
    } else {
      console.log(`⚠️  Users already exist (${existingUsers} found). Skipping...`);
    }

    if (existingGroups === 0) {
      await groupsCollection.insertMany(sampleGroups);
      console.log(`✅ Inserted ${sampleGroups.length} groups`);
    } else {
      console.log(`⚠️  Groups already exist (${existingGroups} found). Skipping...`);
    }

    // Final summary
    const finalMemories = await memoriesCollection.countDocuments();
    const finalUsers = await usersCollection.countDocuments();
    const finalGroups = await groupsCollection.countDocuments();

    console.log("\n🎉 Seeding completed successfully!");
    console.log(`📊 Final database state:`);
    console.log(`   - Total memories: ${finalMemories}`);
    console.log(`   - Total users: ${finalUsers}`);
    console.log(`   - Total groups: ${finalGroups}`);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
