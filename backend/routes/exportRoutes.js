const express = require('express');
const ChatMessage = require('../models/ChatMessage');
const Poll = require('../models/Poll');
const User = require('../models/User');
const { authenticateToken } = require('../utils/jwtAuth');

const router = express.Router();

// Export users as CSV
router.get('/users/csv', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    let csv = 'ID,Username,Name,Email,Status,Active,Last Active,Created At\n';
    
    users.forEach(user => {
      csv += `${user._id},"${user.username}","${user.name}","${user.email}","${user.status}","${user.isActive}","${user.lastActive}","${user.createdAt}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export users CSV error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Export messages as CSV
router.get('/messages/csv', authenticateToken, async (req, res) => {
  try {
    const messages = await ChatMessage.find({})
      .populate('sender', 'username name email')
      .sort({ createdAt: -1 });

    let csv = 'ID,Sender,Sender Name,Content,Type,Edited,Created At\n';
    
    messages.forEach(message => {
      const senderName = message.sender ? message.sender.username || message.sender.name : message.senderName;
      csv += `${message._id},"${message.sender?._id || ''}","${senderName}","${message.content.replace(/"/g, '""')}","${message.messageType}","${message.isEdited}","${message.createdAt}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="messages.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export messages CSV error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Export polls as CSV
router.get('/polls/csv', authenticateToken, async (req, res) => {
  try {
    const polls = await Poll.find({})
      .populate('createdBy', 'username name email')
      .sort({ createdAt: -1 });

    let csv = 'ID,Question,Description,Created By,Status,Active,Total Votes,Options,Created At\n';
    
    polls.forEach(poll => {
      const creatorName = poll.createdBy ? poll.createdBy.username || poll.createdBy.name : poll.creatorName;
      const options = poll.options.map(opt => `${opt.optionText}(${opt.votes})`).join('; ');
      csv += `${poll._id},"${poll.question.replace(/"/g, '""')}","${poll.description?.replace(/"/g, '""') || ''}","${creatorName}","${poll.status}","${poll.isActive}","${poll.totalVotes}","${options}","${poll.createdAt}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="polls.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export polls CSV error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Export all data as JSON
router.get('/all/json', authenticateToken, async (req, res) => {
  try {
    const [users, messages, polls] = await Promise.all([
      User.find({}).select('-password').sort({ createdAt: -1 }),
      ChatMessage.find({}).populate('sender', 'username name email').sort({ createdAt: -1 }),
      Poll.find({}).populate('createdBy', 'username name email').sort({ createdAt: -1 })
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      users: users.map(user => ({
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        status: user.status,
        isActive: user.isActive,
        lastActive: user.lastActive,
        createdAt: user.createdAt
      })),
      messages: messages.map(message => ({
        _id: message._id,
        content: message.content,
        messageType: message.messageType,
        sender: message.sender,
        senderName: message.senderName,
        isEdited: message.isEdited,
        editedAt: message.editedAt,
        createdAt: message.createdAt
      })),
      polls: polls.map(poll => ({
        _id: poll._id,
        question: poll.question,
        description: poll.description,
        options: poll.options,
        allowMultipleVotes: poll.allowMultipleVotes,
        pollType: poll.pollType,
        status: poll.status,
        isActive: poll.isActive,
        totalVotes: poll.totalVotes,
        createdBy: poll.createdBy,
        creatorName: poll.creatorName,
        createdAt: poll.createdAt
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="communication_data.json"');
    res.json(exportData);
  } catch (error) {
    console.error('Export all data error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
