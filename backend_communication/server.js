/**
 * Main Server File
 * Express server setup with Socket.IO integration
 * Configures middleware, routes, and starts the server
 */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/database');
const { initializeSocket } = require('./socket/socketHandler');

// Import routes
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const pollRoutes = require('./routes/pollRoutes');

/**
 * Initialize Express application
 */
const app = express();

/**
 * Create HTTP server
 */
const server = http.createServer(app);

/**
 * Initialize Socket.IO with CORS configuration
 */
const io = socketIO(server, {
  cors: {
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

/**
 * Configuration
 */
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Middleware Setup
 */

// CORS - Allow cross-origin requests
app.use(cors({
  origin: '*',
  credentials: true
}));

// Body parser - Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Morgan - HTTP request logger (only in development)
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

/**
 * API Routes
 */

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Collaboration Hub API is running',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      messages: '/api/messages',
      polls: '/api/polls',
      health: '/api/health'
    },
    socketNamespace: '/collaboration'
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const { getConnectionStatus } = require('./config/database');
  
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: getConnectionStatus(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Mount API routes
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/polls', pollRoutes);

/**
 * Download/Export Endpoints
 */

// Export users as CSV
app.get('/api/export/users/csv', async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.find().sort({ createdAt: -1 });
    
    // Generate CSV
    let csv = 'ID,Username,Email,Status,Active,Last Active,Created At\n';
    users.forEach(user => {
      csv += `${user._id},${user.username},${user.email},${user.status},${user.isActive},${user.lastActive},${user.createdAt}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({ success: false, message: 'Error exporting users' });
  }
});

// Export messages as CSV
app.get('/api/export/messages/csv', async (req, res) => {
  try {
    const Message = require('./models/Message');
    const messages = await Message.find()
      .populate('sender', 'username email')
      .sort({ createdAt: 1 });
    
    // Generate CSV
    let csv = 'ID,Sender,Content,Type,Created At\n';
    messages.forEach(msg => {
      const content = msg.content.replace(/"/g, '""'); // Escape quotes
      csv += `${msg._id},"${msg.senderName}","${content}",${msg.messageType},${msg.createdAt}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=messages.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting messages:', error);
    res.status(500).json({ success: false, message: 'Error exporting messages' });
  }
});

// Export polls as CSV
app.get('/api/export/polls/csv', async (req, res) => {
  try {
    const Poll = require('./models/Poll');
    const polls = await Poll.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    
    // Generate CSV
    let csv = 'ID,Question,Creator,Total Votes,Status,Created At\n';
    polls.forEach(poll => {
      const question = poll.question.replace(/"/g, '""');
      csv += `${poll._id},"${question}",${poll.creatorName},${poll.totalVotes},${poll.status},${poll.createdAt}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=polls.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting polls:', error);
    res.status(500).json({ success: false, message: 'Error exporting polls' });
  }
});

// Export all data as JSON
app.get('/api/export/all/json', async (req, res) => {
  try {
    const User = require('./models/User');
    const Message = require('./models/Message');
    const Poll = require('./models/Poll');
    
    const users = await User.find().sort({ createdAt: -1 });
    const messages = await Message.find()
      .populate('sender', 'username email')
      .sort({ createdAt: 1 });
    const polls = await Poll.find()
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });
    
    const exportData = {
      exportDate: new Date().toISOString(),
      counts: {
        users: users.length,
        messages: messages.length,
        polls: polls.length
      },
      data: {
        users,
        messages,
        polls
      }
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=collaboration_hub_data.json');
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting all data:', error);
    res.status(500).json({ success: false, message: 'Error exporting data' });
  }
});

/**
 * Error Handling Middleware
 */

// 404 Handler - Route not found
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: NODE_ENV === 'development' ? err.stack : undefined
  });
});

/**
 * Initialize Socket.IO
 */
initializeSocket(io);

/**
 * Start Server
 */
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start listening
    server.listen(PORT, () => {
      console.log('\n🎉 ======================================');
      console.log('🚀 Collaboration Hub Server Started');
      console.log('🎉 ======================================');
      console.log(`📍 Server running on: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`🔌 Socket.IO namespace: /collaboration`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
      console.log('\n📋 Available Endpoints:');
      console.log(`   - Users:    ${PORT}/api/users`);
      console.log(`   - Messages: ${PORT}/api/messages`);
      console.log(`   - Polls:    ${PORT}/api/polls`);
      console.log('\n📥 Export Endpoints:');
      console.log(`   - Users CSV:    ${PORT}/api/export/users/csv`);
      console.log(`   - Messages CSV: ${PORT}/api/export/messages/csv`);
      console.log(`   - Polls CSV:    ${PORT}/api/export/polls/csv`);
      console.log(`   - All JSON:     ${PORT}/api/export/all/json`);
      console.log('🎉 ======================================\n');
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

/**
 * Graceful Shutdown
 */
process.on('SIGTERM', async () => {
  console.log('⚠️ SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('🔌 Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\n⚠️ SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('🔌 Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = { app, server, io };