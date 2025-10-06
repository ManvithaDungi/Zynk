// server.js
require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

// ROUTES
const eventRoutes = require("./routes/eventRoutes");

// CONFIG
const config = {
  port: process.env.PORT || 5000,
  mongoURI:
    process.env.MONGO_URI ||
    "mongodb+srv://manvitha:23318@cluster0.ju7oxft.mongodb.net/zynk?retryWrites=true&w=majority&appName=Cluster0",
};

// EXPRESS APP
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

// RATE LIMITER
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use(limiter);

// STATIC FILES
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// LOGGING MIDDLEWARE
app.use(
  "/api/events",
  (req, res, next) => {
    console.log(`📩 ${req.method} ${req.originalUrl}`);
    next();
  },
  eventRoutes
);

// ✅ HEALTH CHECK ENDPOINT
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server running healthy 🚀" });
});

// ✅ (Optional) ANALYTICS ENDPOINT (for stats)
app.get("/api/events/stats", async (req, res) => {
  try {
    const Event = require("./models/Event");
    const events = await Event.find();

    const monthCount = {};
    const tagCount = {};

    events.forEach((e) => {
      const month = new Date(e.date).toLocaleString("default", { month: "short" });
      monthCount[month] = (monthCount[month] || 0) + 1;
      const tag = e.tag || "untagged";
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });

    res.json({ monthCount, tagCount, totalEvents: events.length });
  } catch (err) {
    console.error("Error generating stats:", err);
    res.status(500).json({ error: "Failed to generate stats" });
  }
});

// SOCKET.IO SETUP
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // 🔓 For dev; tighten for prod
});

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// MONGODB CONNECTION (modern syntax)
mongoose
  .connect(config.mongoURI, {
    tlsAllowInvalidCertificates: true,
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    server.listen(config.port, () =>
      console.log(`🚀 Server running on port ${config.port}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
