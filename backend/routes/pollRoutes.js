const express = require('express');
const Poll = require('../models/Poll');
const Event = require('../models/Event');
const { authenticateToken } = require('../utils/jwtAuth');
const { isValidObjectId, sanitizeString } = require('../utils/validation');

const router = express.Router();

// Get polls for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const polls = await Poll.find({ event: eventId, isActive: true })
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({
      polls: polls.map(poll => ({
        id: poll._id,
        question: poll.question,
        options: poll.options.map(option => ({
          text: option.text,
          votes: option.votes.length,
          userVoted: option.votes.some(vote => vote.user.toString() === req.user?.userId)
        })),
        allowMultipleVotes: poll.allowMultipleVotes,
        isActive: poll.isActive,
        expiresAt: poll.expiresAt,
        totalVotes: poll.totalVotes,
        createdBy: {
          id: poll.createdBy._id,
          name: poll.createdBy.name,
          avatar: poll.createdBy.avatar
        },
        createdAt: poll.createdAt
      }))
    });
  } catch (error) {
    console.error('Get polls error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a poll
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { event, question, options, allowMultipleVotes, expiresAt } = req.body;

    if (!isValidObjectId(event)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    if (!question || !options || options.length < 2) {
      return res.status(400).json({ message: 'Question and at least 2 options are required' });
    }

    const eventDoc = await Event.findById(event);
    if (!eventDoc) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer
    if (eventDoc.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only event organizers can create polls' });
    }

    const pollData = {
      event,
      createdBy: req.user.userId,
      question: sanitizeString(question),
      options: options.map(option => ({
        text: sanitizeString(option),
        votes: []
      })),
      allowMultipleVotes: allowMultipleVotes || false,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    };

    const poll = new Poll(pollData);
    const savedPoll = await poll.save();
    await savedPoll.populate('createdBy', 'name email avatar');

    res.status(201).json({
      message: 'Poll created successfully',
      poll: {
        id: savedPoll._id,
        question: savedPoll.question,
        options: savedPoll.options.map(option => ({
          text: option.text,
          votes: option.votes.length
        })),
        allowMultipleVotes: savedPoll.allowMultipleVotes,
        isActive: savedPoll.isActive,
        expiresAt: savedPoll.expiresAt,
        totalVotes: savedPoll.totalVotes,
        createdBy: {
          id: savedPoll.createdBy._id,
          name: savedPoll.createdBy.name,
          avatar: savedPoll.createdBy.avatar
        },
        createdAt: savedPoll.createdAt
      }
    });
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Vote on a poll
router.post('/:pollId/vote', authenticateToken, async (req, res) => {
  try {
    const { pollId } = req.params;
    const { optionIndex } = req.body;

    if (!isValidObjectId(pollId)) {
      return res.status(400).json({ message: 'Invalid poll ID' });
    }

    if (optionIndex === undefined || optionIndex < 0) {
      return res.status(400).json({ message: 'Valid option index is required' });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (!poll.isActive) {
      return res.status(400).json({ message: 'Poll is not active' });
    }

    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'Poll has expired' });
    }

    if (optionIndex >= poll.options.length) {
      return res.status(400).json({ message: 'Invalid option index' });
    }

    // Check if user already voted
    const hasVoted = poll.options.some(option => 
      option.votes.some(vote => vote.user.toString() === req.user.userId)
    );

    if (hasVoted && !poll.allowMultipleVotes) {
      return res.status(400).json({ message: 'You have already voted on this poll' });
    }

    // Add vote
    poll.options[optionIndex].votes.push({
      user: req.user.userId,
      votedAt: new Date()
    });

    // Update total votes
    poll.totalVotes = poll.options.reduce((total, option) => total + option.votes.length, 0);

    await poll.save();

    res.json({
      message: 'Vote recorded successfully',
      totalVotes: poll.totalVotes
    });
  } catch (error) {
    console.error('Vote on poll error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update poll
router.put('/:pollId', authenticateToken, async (req, res) => {
  try {
    const { pollId } = req.params;
    const { question, isActive } = req.body;

    if (!isValidObjectId(pollId)) {
      return res.status(400).json({ message: 'Invalid poll ID' });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if user is the creator
    if (poll.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only poll creators can update polls' });
    }

    if (question) poll.question = sanitizeString(question);
    if (isActive !== undefined) poll.isActive = isActive;

    await poll.save();

    res.json({
      message: 'Poll updated successfully',
      poll: {
        id: poll._id,
        question: poll.question,
        isActive: poll.isActive
      }
    });
  } catch (error) {
    console.error('Update poll error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete poll
router.delete('/:pollId', authenticateToken, async (req, res) => {
  try {
    const { pollId } = req.params;

    if (!isValidObjectId(pollId)) {
      return res.status(400).json({ message: 'Invalid poll ID' });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if user is the creator
    if (poll.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only poll creators can delete polls' });
    }

    await Poll.findByIdAndDelete(pollId);

    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    console.error('Delete poll error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
