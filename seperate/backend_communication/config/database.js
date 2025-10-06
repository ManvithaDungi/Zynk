/**
 * MongoDB Database Configuration
 * Handles connection to MongoDB Atlas cluster
 * Provides connection URI and connection options
 */

const mongoose = require('mongoose');

// MongoDB Atlas connection string
const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://manvitha:23318@cluster0.ju7oxft.mongodb.net/media?retryWrites=true&w=majority';

/**
 * Connection options for MongoDB Atlas
 */
const connectionOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  tls: true,
  tlsAllowInvalidCertificates: true,
  authSource: 'admin',
  retryWrites: true,
  w: 'majority'
};

/**
 * Connect to MongoDB database
 * @returns {Promise} - Returns promise that resolves when connected
 */
const connectDB = async () => {
  try {
    // Attempt connection to MongoDB
    const conn = await mongoose.connect(MONGODB_URI, connectionOptions);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed through app termination');
      process.exit(0);
    });
    
    return conn;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit process with failure
  }
};

/**
 * Get current connection status
 * @returns {string} - Connection state description
 */
const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

module.exports = {
  connectDB,
  getConnectionStatus,
  MONGODB_URI
};