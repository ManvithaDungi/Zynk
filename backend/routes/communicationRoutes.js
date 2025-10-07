const express = require('express');
const ChatMessage = require('../models/ChatMessage');
const Poll = require('../models/Poll');
const User = require('../models/User');
const { authenticate } = require('./auth');
const { isValidObjectId, sanitizeString } = require('../utils/validation');

const router = express.Router();

// ==================== GENERAL CHAT ROUTES ====================

// Get all messages (general chat)
router.get('/messages', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const messages = await ChatMessage.find({ event: null })
      .populate('sender', 'username name email avatar status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ChatMessage.countDocuments({ event: null });

    res.json({
      success: true,
      messages: messages.reverse().map(message => ({
        _id: message._id,
        content: message.content,
        messageType: message.messageType,
        sender: message.sender,
        senderName: message.senderName,
        isEdited: message.isEdited,
        editedAt: message.editedAt,
        createdAt: message.createdAt
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send a message (general chat)
router.post('/messages', authenticate, async (req, res) => {
  try {
    const { content, messageType = 'text' } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const messageData = {
      sender: req.userId,
      senderName: user.username || user.name,
      content: sanitizeString(content),
      messageType: messageType
    };

    const message = new ChatMessage(messageData);
    const savedMessage = await message.save();
    await savedMessage.populate('sender', 'username name email avatar status');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        _id: savedMessage._id,
        content: savedMessage.content,
        messageType: savedMessage.messageType,
        sender: savedMessage.sender,
        senderName: savedMessage.senderName,
        createdAt: savedMessage.createdAt
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Edit a message
router.put('/messages/:messageId', authenticate, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(messageId)) {
      return res.status(400).json({ message: 'Invalid message ID' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only edit your own messages' });
    }

    message.content = sanitizeString(content);
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: {
        _id: message._id,
        content: message.content,
        isEdited: message.isEdited,
        editedAt: message.editedAt
      }
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a message
router.delete('/messages/:messageId', authenticate, async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!isValidObjectId(messageId)) {
      return res.status(400).json({ message: 'Invalid message ID' });
    }

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ==================== GENERAL POLL ROUTES ====================

// Get all polls (general)
router.get('/polls', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const polls = await Poll.find({ event: null })
      .populate('createdBy', 'username name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Poll.countDocuments({ event: null });

    res.json({
      success: true,
      polls: polls.map(poll => ({
        _id: poll._id,
        question: poll.question,
        description: poll.description,
        options: poll.options.map(option => ({
          _id: option._id,
          optionText: option.optionText,
          votes: option.votes,
          voters: option.voters
        })),
        allowMultipleVotes: poll.allowMultipleVotes,
        pollType: poll.pollType,
        status: poll.status,
        isActive: poll.isActive,
        expiresAt: poll.expiresAt,
        totalVotes: poll.totalVotes,
        votersList: poll.votersList,
        createdBy: poll.createdBy,
        creatorName: poll.creatorName,
        createdAt: poll.createdAt
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get polls error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a poll (general)
router.post('/polls', authenticate, async (req, res) => {
  try {
    const { question, description, options, allowMultipleVotes, pollType, expiresAt } = req.body;

    if (!question || !options || options.length < 2) {
      return res.status(400).json({ message: 'Question and at least 2 options are required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const pollData = {
      createdBy: req.userId,
      creatorName: user.username || user.name,
      question: sanitizeString(question),
      description: description ? sanitizeString(description) : '',
      options: options.map(option => ({
        optionText: sanitizeString(option),
        votes: 0,
        voters: []
      })),
      allowMultipleVotes: allowMultipleVotes || false,
      pollType: pollType || 'single',
      expiresAt: expiresAt ? new Date(expiresAt) : null
    };

    const poll = new Poll(pollData);
    const savedPoll = await poll.save();
    await savedPoll.populate('createdBy', 'username name email avatar');

    res.status(201).json({
      success: true,
      message: 'Poll created successfully',
      data: {
        _id: savedPoll._id,
        question: savedPoll.question,
        description: savedPoll.description,
        options: savedPoll.options,
        allowMultipleVotes: savedPoll.allowMultipleVotes,
        pollType: savedPoll.pollType,
        status: savedPoll.status,
        isActive: savedPoll.isActive,
        totalVotes: savedPoll.totalVotes,
        createdBy: savedPoll.createdBy,
        creatorName: savedPoll.creatorName,
        createdAt: savedPoll.createdAt
      }
    });
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Vote on a poll
router.post('/polls/:pollId/vote', authenticate, async (req, res) => {
  try {
    const { pollId } = req.params;
    const { optionId } = req.body;

    if (!isValidObjectId(pollId) || !isValidObjectId(optionId)) {
      return res.status(400).json({ message: 'Invalid poll or option ID' });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (!poll.isActive || poll.status !== 'active') {
      return res.status(400).json({ message: 'Poll is not active' });
    }

    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'Poll has expired' });
    }

    const option = poll.options.id(optionId);
    if (!option) {
      return res.status(404).json({ message: 'Option not found' });
    }

    // Check if user already voted
    const hasVoted = poll.votersList.includes(req.userId);
    if (hasVoted && !poll.allowMultipleVotes) {
      return res.status(400).json({ message: 'You have already voted on this poll' });
    }

    // Check if user voted for this specific option
    const hasVotedForOption = option.voters.some(voter => voter.user.toString() === req.userId);
    if (hasVotedForOption) {
      return res.status(400).json({ message: 'You have already voted for this option' });
    }

    // Add vote
    option.votes += 1;
    option.voters.push({
      user: req.userId,
      votedAt: new Date()
    });

    // Add to voters list if not already there
    if (!poll.votersList.includes(req.userId)) {
      poll.votersList.push(req.userId);
    }

    // Update total votes
    poll.totalVotes = poll.options.reduce((total, opt) => total + opt.votes, 0);

    await poll.save();

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      totalVotes: poll.totalVotes
    });
  } catch (error) {
    console.error('Vote on poll error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Close a poll
router.put('/polls/:pollId/close', authenticate, async (req, res) => {
  try {
    const { pollId } = req.params;

    if (!isValidObjectId(pollId)) {
      return res.status(400).json({ message: 'Invalid poll ID' });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (poll.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only poll creators can close polls' });
    }

    poll.isActive = false;
    poll.status = 'closed';
    await poll.save();

    res.json({
      success: true,
      message: 'Poll closed successfully'
    });
  } catch (error) {
    console.error('Close poll error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a poll
router.delete('/polls/:pollId', authenticate, async (req, res) => {
  try {
    const { pollId } = req.params;

    if (!isValidObjectId(pollId)) {
      return res.status(400).json({ message: 'Invalid poll ID' });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (poll.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only poll creators can delete polls' });
    }

    await Poll.findByIdAndDelete(pollId);

    res.json({
      success: true,
      message: 'Poll deleted successfully'
    });
  } catch (error) {
    console.error('Delete poll error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ==================== USER MANAGEMENT ROUTES ====================

// Get all users
router.get('/users', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments();

    res.json({
      success: true,
      users: users.map(user => ({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        status: user.status,
        isActive: user.isActive,
        lastActive: user.lastActive,
        createdAt: user.createdAt
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a user
router.post('/users', authenticate, async (req, res) => {
  try {
    const { username, email, name } = req.body;

    if (!username || !email || !name) {
      return res.status(400).json({ message: 'Username, email, and name are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    const userData = {
      username: sanitizeString(username),
      email: email.toLowerCase().trim(),
      name: sanitizeString(name),
      password: 'temp123' // Temporary password, should be changed
    };

    const user = new User(userData);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        status: user.status,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a user
router.put('/users/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, name, status } = req.body;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username) user.username = sanitizeString(username);
    if (email) user.email = email.toLowerCase().trim();
    if (name) user.name = sanitizeString(name);
    if (status) user.status = status;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        status: user.status,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a user
router.delete('/users/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (userId === req.userId) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ==================== DASHBOARD STATS ====================

// Get communication statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalMessages = await ChatMessage.countDocuments();
    const totalPolls = await Poll.countDocuments();
    const activePolls = await Poll.countDocuments({ isActive: true, status: 'active' });

    // Get today's messages
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMessages = await ChatMessage.countDocuments({
      createdAt: { $gte: today }
    });

    // Get total votes across all polls
    const polls = await Poll.find({});
    const totalVotes = polls.reduce((total, poll) => total + poll.totalVotes, 0);

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        offline: totalUsers - activeUsers,
        onlinePercentage: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
      },
      messages: {
        total: totalMessages,
        today: todayMessages
      },
      polls: {
        total: totalPolls,
        active: activePolls,
        totalVotes: totalVotes
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
