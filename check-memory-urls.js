const mongoose = require('mongoose');
require('dotenv').config();

// Import the Memory model
const Memory = require('./backend/models/Memory');

async function checkMemoryUrls() {
  try {
    console.log('🔍 Checking Memory URLs in Database...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find all memories
    const memories = await Memory.find({});
    console.log(`📊 Found ${memories.length} memories in database`);
    
    // Check for placeholder URLs
    const placeholderMemories = memories.filter(memory => 
      memory.mediaUrl && (
        memory.mediaUrl.includes('via.placeholder.com') ||
        memory.mediaUrl.includes('picsum.photos') ||
        memory.mediaUrl.includes('placeholder')
      )
    );
    
    console.log(`\n🔍 Found ${placeholderMemories.length} memories with placeholder URLs:`);
    
    if (placeholderMemories.length > 0) {
      placeholderMemories.forEach((memory, index) => {
        console.log(`${index + 1}. ${memory.title}: ${memory.mediaUrl}`);
      });
      
      console.log('\n🔄 Updating placeholder URLs to local images...');
      
      // Update each memory with a local image
      const localImages = [
        '/images/memories/mem1.jpg',
        '/images/memories/mem2.jpg',
        '/images/memories/mem3.jpg',
        '/images/memories/mem4.jpg',
        '/images/memories/mem5.jpg',
        '/images/memories/mem6.jpg',
        '/images/memories/mem7.jpg',
        '/images/memories/mem8.jpg',
        '/images/memories/mem9.jpg'
      ];
      
      for (let i = 0; i < placeholderMemories.length; i++) {
        const memory = placeholderMemories[i];
        const newImageUrl = localImages[i % localImages.length]; // Cycle through available images
        
        await Memory.findByIdAndUpdate(memory._id, {
          mediaUrl: newImageUrl
        });
        
        console.log(`✅ Updated: ${memory.title} → ${newImageUrl}`);
      }
      
      console.log(`\n🎉 Successfully updated ${placeholderMemories.length} memories!`);
    } else {
      console.log('✅ No memories with placeholder URLs found');
    }
    
    // Check for any remaining placeholder URLs
    const remainingPlaceholders = await Memory.find({
      mediaUrl: { 
        $regex: /(via\.placeholder|picsum\.photos|placeholder)/i 
      }
    });
    
    if (remainingPlaceholders.length === 0) {
      console.log('✅ All memories now use local images!');
    } else {
      console.log(`⚠️  ${remainingPlaceholders.length} memories still have placeholder URLs`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkMemoryUrls();
