const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/zynk?ssl=false', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: false,
  tls: false,
  tlsInsecure: true,
});

// Define schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  avatar: String,
  bio: String,
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  postsCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isPrivate: { type: Boolean, default: false },
  lastLogin: Date
}, {
  timestamps: true
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 2000 },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true, maxlength: 300 },
  category: { type: String, enum: ["Conference", "Workshop", "Meetup", "Social", "Sports", "Arts", "Music", "Other"], default: "Other" },
  maxAttendees: { type: Number, required: true, min: 1, max: 10000, default: 100 },
  thumbnail: { url: String, publicId: String },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'cancelled', 'completed'], default: 'active' }
}, {
  timestamps: true
});

const albumSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, maxlength: 1000 },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  thumbnail: { url: String, publicId: String },
  isPublic: { type: Boolean, default: true }
}, {
  timestamps: true
});

const postSchema = new mongoose.Schema({
  caption: { type: String, required: true, maxlength: 2000 },
  media: [{
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], default: 'image' },
    filename: String
  }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
const Event = mongoose.model('Event', eventSchema);
const Album = mongoose.model('Album', albumSchema);
const Post = mongoose.model('Post', postSchema);

async function createSampleDataDirect() {
  try {
    console.log('🚀 Creating sample data directly in database...');
    
    // Create a test user
    console.log('👤 Creating test user...');
    const hashedPassword = await bcrypt.hash('sample123', 12);
    const testUser = new User({
      name: 'Sample User',
      email: 'sampleuser@example.com',
      password: hashedPassword,
      role: 'user'
    });
    
    const savedUser = await testUser.save();
    console.log('✅ User created:', savedUser.email);
    
    // Create sample events
    console.log('📅 Creating sample events...');
    const events = [
      {
        title: 'Tech Conference 2024',
        description: 'Join us for the biggest tech conference of the year featuring the latest innovations in AI, blockchain, and cloud computing.',
        date: new Date('2024-03-15'),
        time: '09:00',
        location: 'Convention Center, San Francisco',
        category: 'Conference',
        maxAttendees: 500,
        organizer: savedUser._id
      },
      {
        title: 'React Workshop',
        description: 'Learn React from scratch with hands-on exercises and real-world projects.',
        date: new Date('2024-03-20'),
        time: '14:00',
        location: 'Tech Hub, New York',
        category: 'Workshop',
        maxAttendees: 50,
        organizer: savedUser._id
      },
      {
        title: 'Networking Meetup',
        description: 'Connect with fellow developers and entrepreneurs in a casual networking environment.',
        date: new Date('2024-03-25'),
        time: '18:00',
        location: 'Downtown Cafe, Seattle',
        category: 'Social',
        maxAttendees: 100,
        organizer: savedUser._id
      }
    ];

    const createdEvents = [];
    for (const eventData of events) {
      const event = new Event(eventData);
      const savedEvent = await event.save();
      createdEvents.push(savedEvent);
      console.log(`✅ Created event: ${eventData.title}`);
    }

    // Create sample albums
    console.log('📸 Creating sample albums...');
    const albums = [
      {
        name: 'Tech Conference Memories',
        description: 'Photos and memories from the amazing tech conference',
        eventId: createdEvents[0]._id,
        createdBy: savedUser._id
      },
      {
        name: 'React Workshop Gallery',
        description: 'Learning moments and code snippets from the React workshop',
        eventId: createdEvents[1]._id,
        createdBy: savedUser._id
      },
      {
        name: 'Networking Event Photos',
        description: 'Great connections made at the networking meetup',
        eventId: createdEvents[2]._id,
        createdBy: savedUser._id
      }
    ];

    const createdAlbums = [];
    for (const albumData of albums) {
      const album = new Album(albumData);
      const savedAlbum = await album.save();
      createdAlbums.push(savedAlbum);
      console.log(`✅ Created album: ${albumData.name}`);
    }

    // Create sample posts
    console.log('💭 Creating sample posts...');
    const posts = [
      {
        caption: 'Had an amazing time at the tech conference! The AI presentations were mind-blowing. Can\'t wait for next year!',
        album: createdAlbums[0]._id,
        user: savedUser._id,
        media: [{
          url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500',
          type: 'image',
          filename: 'conference-photo.jpg'
        }]
      },
      {
        caption: 'Just finished the React workshop. Learned so much about hooks and state management. Time to build something awesome!',
        album: createdAlbums[1]._id,
        user: savedUser._id,
        media: [{
          url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500',
          type: 'image',
          filename: 'workshop-photo.jpg'
        }]
      },
      {
        caption: 'Great networking event! Met some incredible people and had fascinating conversations about the future of tech.',
        album: createdAlbums[2]._id,
        user: savedUser._id,
        media: [{
          url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500',
          type: 'image',
          filename: 'networking-photo.jpg'
        }]
      }
    ];

    let postsCreated = 0;
    for (const postData of posts) {
      const post = new Post(postData);
      await post.save();
      postsCreated++;
      console.log(`✅ Created post in album: ${postData.album}`);
    }

    console.log('🎉 Sample data creation completed!');
    console.log('📊 Summary:');
    console.log(`👤 Users created: 1`);
    console.log(`📅 Events created: ${createdEvents.length}`);
    console.log(`📸 Albums created: ${createdAlbums.length}`);
    console.log(`💭 Posts created: ${postsCreated}`);
    console.log('✅ You can now test the application with sample data!');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    mongoose.connection.close();
  }
}

createSampleDataDirect();
