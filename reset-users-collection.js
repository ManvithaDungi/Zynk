const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/zynk?ssl=false', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: false,
  tls: false,
  tlsInsecure: true,
});

async function resetUsersCollection() {
  try {
    // Wait for connection
    await mongoose.connection.asPromise();
    console.log('✅ Connected to MongoDB');
    
    console.log('🗑️ Dropping users collection...');
    await mongoose.connection.db.collection('users').drop();
    console.log('✅ Users collection dropped');
    
    console.log('🔄 Recreating users collection with correct schema...');
    // The collection will be recreated automatically when we insert the first document
    
  } catch (error) {
    if (error.code === 26) {
      console.log('ℹ️ Users collection does not exist, nothing to drop');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    mongoose.connection.close();
  }
}

resetUsersCollection();
