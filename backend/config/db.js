const mongoose = require("mongoose");

// Connection health check
let isConnected = false;
let connectionRetries = 0;
const maxRetries = 5;

const checkConnectionHealth = () => {
  return mongoose.connection.readyState === 1;
};

const handleConnectionError = async (error) => {
  isConnected = false;
  connectionRetries++;
  
  if (connectionRetries <= maxRetries) {
    console.log(`🔄 Attempting to reconnect... (${connectionRetries}/${maxRetries})`);
    setTimeout(() => {
      connectDB();
    }, 5000 * connectionRetries); // Exponential backoff
  } else {
    console.error('❌ Max reconnection attempts reached. Please check your MongoDB connection.');
  }
};

const connectDB = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const mongoUri = process.env.MONGO_URI;

      if (!mongoUri) {
        console.error('❌ MONGO_URI environment variable is not set');
        process.exit(1);
      }

      console.log(`🔗 Connecting to: ${mongoUri.replace(/\/\/.*@/, '//***:***@')} (Attempt ${i + 1}/${retries})`);

      // Use the tested working configuration for MongoDB Atlas
      const connectionOptions = {
        maxPoolSize: 1,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 10000,
        connectTimeoutMS: 5000,
        tls: true,
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false,
        authSource: 'admin',
        retryWrites: true,
        w: 'majority',
        bufferCommands: false,
        retryReads: true
      };

      console.log(`📋 Using optimized Atlas configuration`);

      const conn = await mongoose.connect(mongoUri, connectionOptions);

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      isConnected = true;
      connectionRetries = 0;
      
      // Add connection event handlers
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err.message);
        handleConnectionError(err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
        isConnected = false;
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
        isConnected = true;
        connectionRetries = 0;
      });
      
      return conn;
    } catch (error) {
      console.error(`❌ Database connection error (Attempt ${i + 1}/${retries}): ${error.message}`);
      
      if (i === retries - 1) {
        console.error('💡 MongoDB Atlas connection failed after all attempts');
        console.error('💡 Please check your MongoDB Atlas settings:');
        console.error('💡 1. IP whitelist: https://cloud.mongodb.com/v2/[your-cluster-id]/security/network/whitelist');
        console.error('💡 2. Database user permissions');
        console.error('💡 3. Cluster status and network access');
        console.error('💡 4. Try updating your connection string with ?retryWrites=false&w=majority');
        process.exit(1);
      } else {
        console.log(`⏳ Retrying connection in 3 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
};

module.exports = {
  connectDB,
  checkConnectionHealth: () => checkConnectionHealth(),
  isConnected: () => isConnected
};