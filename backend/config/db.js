const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.error('❌ MONGO_URI environment variable is not set');
      process.exit(1);
    }

    console.log(`🔗 Connecting to: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);

    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 60000,
      // SSL/TLS configuration for MongoDB Atlas
      tls: true,
      tlsAllowInvalidCertificates: true,
      authSource: 'admin',
      retryWrites: true,
      w: 'majority'
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    console.error('💡 Make sure your IP address is whitelisted in MongoDB Atlas');
    console.error('💡 Go to: https://cloud.mongodb.com/v2/[your-cluster-id]/security/network/whitelist');
    console.error('💡 Add your current IP address or use 0.0.0.0/0 for all IPs (less secure)');
    process.exit(1);
  }
};

module.exports = connectDB;