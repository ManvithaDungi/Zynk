const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
require("./scripts/seedData");

const bulkCategorizeRoutes = require("./routes/bulkCategorizeRoutes");
const analyticsRoutes = require("./routes/analyticsFilterRoutes");
const privacyRoutes = require("./routes/privacyManagerRoutes");


//const Memory = require("./models/BulkCategorize");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://manvitha:23318@cluster0.ju7oxft.mongodb.net/media?retryWrites=true&w=majority';

console.log(`🔗 Connecting to: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);

mongoose.connect(mongoUri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  tls: true,
  tlsAllowInvalidCertificates: true,
  authSource: 'admin',
  retryWrites: true,
  w: 'majority'
});

mongoose.connection.on("connected", () => {
  console.log("✅ Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err.message);
});

// API Routes

app.use("/api/bulkcategorize", bulkCategorizeRoutes);
app.use("/api/privacyManager", privacyRoutes);
app.use("/api/analyticsFilter", analyticsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
