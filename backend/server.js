require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// Import routes
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const userRoutes = require("./routes/userRoutes");
const memoryRoutes = require("./routes/memoryRoutes");
const albumRoutes = require("./routes/albumRoutes");
const postsRoutes = require("./routes/posts");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/zynk", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/memories", memoryRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/posts", postsRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  console.log("MongoDB disconnected. Server shutting down.");
  process.exit(0);
});

module.exports = app;
