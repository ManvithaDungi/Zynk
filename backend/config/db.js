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
      // Note: TLS options adjusted to handle SSL/TLS handshake errors
      const connectionOptions = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 30000,
        // TLS configuration - relaxed for troubleshooting SSL handshake issues
        // If this fixes the error, consider investigating certificate chain issues
        tls: true,
        tlsAllowInvalidCertificates: true,  // Allows connection even with certificate validation issues
        tlsAllowInvalidHostnames: true,      // Allows hostname mismatch
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
      
      // Check for SSL/TLS specific errors
      if (error.message.includes('SSL') || error.message.includes('TLS') || 
          error.message.includes('OPENSSL') || error.message.includes('ALERT')) {
        console.error('🔒 SSL/TLS Error detected. This may be due to:');
        console.error('   - Certificate validation issues');
        console.error('   - Firewall/proxy blocking TLS connections');
        console.error('   - Network configuration problems');
        console.error('   - MongoDB Atlas cluster TLS settings');
      }
      
      if (i === retries - 1) {
        console.error('💡 MongoDB Atlas connection failed after all attempts');
        console.error('💡 Please check your MongoDB Atlas settings:');
        console.error('💡 1. IP whitelist: https://cloud.mongodb.com/v2/[your-cluster-id]/security/network/whitelist');
        console.error('💡 2. Database user permissions');
        console.error('💡 3. Cluster status and network access');
        console.error('💡 4. Try updating your connection string with ?retryWrites=false&w=majority');
        console.error('💡 5. Check if your network/firewall allows TLS connections to MongoDB Atlas');
        console.error('💡 6. Verify your MongoDB Atlas cluster is accessible and not paused');
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