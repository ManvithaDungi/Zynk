// backend/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/zynk'
    if (!process.env.MONGO_URI) {
      console.warn('[DB] MONGO_URI not set. Using default:', mongoUri)
    }
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: false,
      sslValidate: false,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Stop the app if DB fails
  }
};

module.exports = connectDB;
