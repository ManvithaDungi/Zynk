/**
 * Message Routes
 * Handles all HTTP routes for chat message management
 * CRUD operations: Create, Read, Update, Delete messages
 */

const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');

/**
 * @route   GET /api/messages
 * @desc    Get all messages (with pagination)
 * @access  Public
 * @query   limit (default: 50), skip (default: 0)
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;
    
    const messages = await Message.find()
      .populate('sender', 'username email avatar status')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-__v');
    
    const total = await Message.countDocuments();
    
    res.json({
      success: true,
      count: messages.length,
      total,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/messages/recent
 * @desc    Get recent messages (last 50 by default)
 * @access  Public
 * @query   limit (default: 50)
 */
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const messages = await Message.getRecentMessages(limit);
    
    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent messages',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/messages/stats
 * @desc    Get message statistics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await Message.getMessageStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching message stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching message statistics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/messages/user/:userId
 * @desc    Get messages by specific user
 * @access  Public
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    
    const messages = await Message.getMessagesByUser(req.params.userId, limit);
    
    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching user messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user messages',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/messages/search
 * @desc    Search messages by content
 * @access  Public
 * @query   q (search query), limit (default: 20)
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const limit = parseInt(req.query.limit) || 20;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const messages = await Message.searchMessages(q, limit);
    
    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching messages',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/messages/:id
 * @desc    Get single message by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'username email avatar status')
      .select('-__v');
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error fetching message:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching message',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/messages
 * @desc    Create a new message
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { sender, senderName, content, messageType } = req.body;
    
    // Validation
    if (!sender || !content) {
      return res.status(400).json({
        success: false,
        message: 'Sender and content are required'
      });
    }
    
    // Verify sender exists
    const user = await User.findById(sender);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Sender user not found'
      });
    }
    
    // Create message
    const message = await Message.create({
      sender,
      senderName: senderName || user.username,
      content,
      messageType: messageType || 'text'
    });
    
    // Populate sender info
    await message.populate('sender', 'username email avatar status');
    
    res.status(201).json({
      success: true,
      message: 'Message created successfully',
      data: message
    });
  } catch (error) {
    console.error('Error creating message:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating message',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/messages/:id
 * @desc    Update message content (edit message)
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }
    
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Use the instance method to edit
    await message.editMessage(content);
    
    // Populate sender
    await message.populate('sender', 'username email avatar status');
    
    res.json({
      success: true,
      message: 'Message updated successfully',
      data: message
    });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating message',
      error: error.message
    });
  }
});

/**
 * @route   PATCH /api/messages/:id/read
 * @desc    Mark message as read by a user
 * @access  Public
 */
router.patch('/:id/read', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    await message.markAsRead(userId);
    
    res.json({
      success: true,
      message: 'Message marked as read',
      data: message
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking message as read',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/messages/:id
 * @desc    Delete message by ID
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Message deleted successfully',
      data: message
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/messages/old/:days
 * @desc    Delete messages older than specified days
 * @access  Public
 */
router.delete('/old/:days', async (req, res) => {
  try {
    const days = parseInt(req.params.days);
    
    if (isNaN(days) || days < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid number of days'
      });
    }
    
    const result = await Message.deleteOldMessages(days);
    
    res.json({
      success: true,
      message: `Deleted messages older than ${days} days`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting old messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting old messages',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/messages/export/json
 * @desc    Export all messages as JSON
 * @access  Public
 */
router.get('/export/json', async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('sender', 'username email')
      .sort({ createdAt: 1 })
      .select('-__v');
    
    res.json({
      success: true,
      exportDate: new Date().toISOString(),
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Error exporting messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting messages',
      error: error.message
    });
  }
});

module.exports = router;