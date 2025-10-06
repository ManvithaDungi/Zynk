const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb+srv://manvitha:23318@cluster0.ju7oxft.mongodb.net/media?retryWrites=true&w=majority';

async function checkData() {
  try {
    console.log('🔍 Checking database contents...\n');

    const client = new MongoClient(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      tls: true,
      tlsInsecure: true,
      authSource: 'admin',
      retryWrites: true,
      w: 'majority'
    });

    await client.connect();
    const db = client.db();

    const collections = ['users', 'categories', 'albums', 'events', 'posts', 'memories'];
    for (const collection of collections) {
      const count = await db.collection(collection).countDocuments();
      console.log(`${collection}: ${count} documents`);
    }

    // Show some sample data
    console.log('\n📋 Sample data:');

    const users = await db.collection('users').find({}).limit(2).toArray();
    if (users.length > 0) {
      console.log('Users:', users.map(u => ({ name: u.name, email: u.email })));
    }

    const events = await db.collection('events').find({}).limit(2).toArray();
    if (events.length > 0) {
      console.log('Events:', events.map(e => ({ title: e.title, date: e.date })));
    }

    await client.close();
    console.log('\n✅ Database check completed');
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  }
}

checkData();
