require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

// Import routes
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/eventRoutes");
const userRoutes = require("./routes/userRoutes");
const albumRoutes = require("./routes/albumRoutes");
const postsRoutes = require("./routes/postsRoutes");
const exploreRoutes = require("./routes/exploreRoutes");
const searchRoutes = require("./routes/searchRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const tagRoutes = require("./routes/tagRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const pollRoutes = require("./routes/pollRoutes");
const chatRoutes = require("./routes/chatRoutes");
const privacyManagerRoutes = require("./routes/privacyManagerRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const adminSettingsRoutes = require("./routes/adminSettingsRoutes");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection with optimized settings - Use MONGO_URI from environment
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/zynk";
console.log('🔗 Connecting to MongoDB:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs

mongoose.connect(mongoUri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

mongoose.connection.on("connected", () => {
  console.log("✅ Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err.message);
});

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userName = decoded.username;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userName} connected`);

  // Join event room
  socket.on('join-event', (eventId) => {
    socket.join(`event-${eventId}`);
    console.log(`User ${socket.userName} joined event ${eventId}`);
  });

  // Leave event room
  socket.on('leave-event', (eventId) => {
    socket.leave(`event-${eventId}`);
    console.log(`User ${socket.userName} left event ${eventId}`);
  });

  // Handle chat messages
  socket.on('send-message', async (data) => {
    try {
      const { eventId, message, messageType = 'text' } = data;
      
      // Save message to database
      const ChatMessage = require('./models/ChatMessage');
      const newMessage = new ChatMessage({
        event: eventId,
        user: socket.userId,
        message: message,
        messageType: messageType
      });
      
      await newMessage.save();
      await newMessage.populate('user', 'name email avatar');

      // Broadcast message to event room
      io.to(`event-${eventId}`).emit('new-message', {
        id: newMessage._id,
        message: newMessage.message,
        messageType: newMessage.messageType,
        user: {
          id: newMessage.user._id,
          name: newMessage.user.name,
          avatar: newMessage.user.avatar
        },
        createdAt: newMessage.createdAt
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(`event-${data.eventId}`).emit('user-typing', {
      userId: socket.userId,
      userName: socket.userName,
      isTyping: data.isTyping
    });
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.userName} disconnected`);
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/explore", exploreRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/privacyManager", privacyManagerRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "Server is running", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  try {
    await mongoose.disconnect();
    server.close(() => {
      console.log("✅ MongoDB disconnected. Server shutting down.");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = { app, server, io };