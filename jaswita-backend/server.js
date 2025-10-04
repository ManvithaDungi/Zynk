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
mongoose.connect(
  process.env.MONGODB_URI ||
    "mongodb://localhost:27017/social-timeline"
);

// API Routes

app.use("/api/bulkcategorize", bulkCategorizeRoutes);
app.use("/api/privacyManager", privacyRoutes);
app.use("/api/analyticsFilter", analyticsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
