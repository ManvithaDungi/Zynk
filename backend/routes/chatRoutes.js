const express = require('express');
const ChatMessage = require('../models/ChatMessage');
const Event = require('../models/Event');
const { authenticateToken } = require('../utils/jwtAuth');
const { isValidObjectId, sanitizeString } = require('../utils/validation');

const router = express.Router();

// Get chat messages for an event
router.get('/event/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is registered for the event
    if (!event.registeredUsers.includes(req.user.userId)) {
      return res.status(403).json({ message: 'You must be registered for this event to view chat' });
    }

    const messages = await ChatMessage.find({ 
      event: eventId,
      isDeleted: false 
    })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ChatMessage.countDocuments({ 
      event: eventId,
      isDeleted: false 
    });

    res.json({
      messages: messages.reverse().map(message => ({
        id: message._id,
        message: message.message,
        messageType: message.messageType,
        user: {
          id: message.user._id,
          name: message.user.name,
          avatar: message.user.avatar
        },
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
    console.error('Get chat messages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send a chat message
router.post('/event/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { message, messageType = 'text' } = req.body;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is registered for the event
    if (!event.registeredUsers.includes(req.user.userId)) {
      return res.status(403).json({ message: 'You must be registered for this event to send messages' });
    }

    // Check if chat is enabled for the event
    if (!event.allowChat) {
      return res.status(403).json({ message: 'Chat is not enabled for this event' });
    }

    const messageData = {
      event: eventId,
      user: req.user.userId,
      message: sanitizeString(message),
      messageType: messageType
    };

    const chatMessage = new ChatMessage(messageData);
    const savedMessage = await chatMessage.save();
    await savedMessage.populate('user', 'name email avatar');

    res.status(201).json({
      message: 'Message sent successfully',
      chatMessage: {
        id: savedMessage._id,
        message: savedMessage.message,
        messageType: savedMessage.messageType,
        user: {
          id: savedMessage.user._id,
          name: savedMessage.user.name,
          avatar: savedMessage.user.avatar
        },
        createdAt: savedMessage.createdAt
      }
    });
  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a chat message
router.delete('/messages/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!isValidObjectId(messageId)) {
      return res.status(400).json({ message: 'Invalid message ID' });
    }

    const chatMessage = await ChatMessage.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the message sender
    if (chatMessage.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    // Soft delete
    chatMessage.isDeleted = true;
    chatMessage.deletedAt = new Date();
    await chatMessage.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete chat message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
