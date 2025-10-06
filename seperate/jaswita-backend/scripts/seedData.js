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
    likes: 45,
    shares:12,
    views: 120,
    comments: 8,
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
    likes: 32,
    shares:12,
    views: 89,
    comments: 5,
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
    likes: 18,
    shares:12,
    views: 67,
    comments: 3,
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
    likes: 28,
    shares:12,
    views: 95,
    comments: 7,
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
    likes: 67,
    shares:12,
    views: 156,
    comments: 12,
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
    likes: 54,
    views: 134,
    comments: 9,
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
    likes: 39,
    views: 102,
    comments: 6,
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
    likes: 41,
    views: 118,
    comments: 8,
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
    likes: 23,
    views: 78,
    comments: 4,
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
    likes: 72,
    views: 189,
    comments: 15,
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
    likes: 45,
    comments: 8,
    shares: 12,
    category: "Event Highlights",
  },
  {
    date: "2024-01-16",
    views: 89,
    likes: 32,
    comments: 5,
    shares: 8,
    category: "Group Photos",
  },
  {
    date: "2024-01-17",
    views: 67,
    likes: 18,
    comments: 3,
    shares: 2,
    category: "Candid Moments",
  },
  {
    date: "2024-01-18",
    views: 95,
    likes: 28,
    comments: 7,
    shares: 5,
    category: "Venue Shots",
  },
  {
    date: "2024-01-19",
    views: 156,
    likes: 67,
    comments: 12,
    shares: 18,
    category: "Event Highlights",
  },
  {
    date: "2024-01-20",
    views: 134,
    likes: 54,
    comments: 9,
    shares: 15,
    category: "Event Highlights",
  },
  {
    date: "2024-01-21",
    views: 102,
    likes: 39,
    comments: 6,
    shares: 7,
    category: "Group Photos",
  },
  {
    date: "2024-01-22",
    views: 118,
    likes: 41,
    comments: 8,
    shares: 11,
    category: "Candid Moments",
  },
  {
    date: "2024-01-23",
    views: 78,
    likes: 23,
    comments: 4,
    shares: 3,
    category: "Group Photos",
  },
  {
    date: "2024-01-24",
    views: 189,
    likes: 72,
    comments: 15,
    shares: 22,
    category: "Event Highlights",
  },
]

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://manvitha:23318@cluster0.ju7oxft.mongodb.net/media?retryWrites=true&w=majority';

    console.log(`🔗 Connecting to: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);

    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      tls: true,
      tlsAllowInvalidCertificates: true,
      authSource: 'admin',
      retryWrites: true,
      w: 'majority'
    });
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await mongoose.connection.db
      .collection("memories")
      .deleteMany({});
    await mongoose.connection.db
      .collection("users")
      .deleteMany({});
    await mongoose.connection.db
      .collection("groups")
      .deleteMany({});

    // Insert sample data
    await mongoose.connection.db
      .collection("memories")
      .insertMany(sampleMemories);
    await mongoose.connection.db
      .collection("users")
      .insertMany(sampleUsers);
    await mongoose.connection.db
      .collection("groups")
      .insertMany(sampleGroups);

    console.log("Sample data inserted successfully!");
    console.log(`- ${sampleMemories.length} memories`);
    console.log(`- ${sampleUsers.length} users`);
    console.log(`- ${sampleGroups.length} groups`);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
