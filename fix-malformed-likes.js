const mongoose = require('mongoose');
require('dotenv').config();

// Import the Post model
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
    process.exit(1);
  }
};

// Function to fix malformed likes
const fixMalformedLikes = async () => {
  try {
    console.log('🔍 Checking for posts with malformed likes...');
    
    // Find all posts
    const posts = await Post.find({});
    console.log(`📊 Found ${posts.length} total posts`);
    
    let fixedCount = 0;
    let totalMalformedLikes = 0;
    
    for (const post of posts) {
      let hasMalformedLikes = false;
      const originalLikesCount = post.likes.length;
      
      // Filter out likes with undefined or null user
      const validLikes = post.likes.filter(like => {
        if (!like.user) {
          hasMalformedLikes = true;
          totalMalformedLikes++;
          return false;
        }
        return true;
      });
      
      // If we found malformed likes, update the post
      if (hasMalformedLikes) {
        post.likes = validLikes;
        await post.save();
        fixedCount++;
        
        console.log(`🔧 Fixed post ${post._id}: removed ${originalLikesCount - validLikes.length} malformed likes`);
      }
    }
    
    console.log('\n🎉 Cleanup completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Posts checked: ${posts.length}`);
    console.log(`   - Posts fixed: ${fixedCount}`);
    console.log(`   - Malformed likes removed: ${totalMalformedLikes}`);
    
    if (fixedCount === 0) {
      console.log('✅ No malformed likes found - database is clean!');
    }
    
  } catch (error) {
    console.error('❌ Error fixing malformed likes:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    await fixMalformedLikes();
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
};

main();
