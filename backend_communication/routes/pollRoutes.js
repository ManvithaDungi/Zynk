/**
 * Poll Routes
 * Handles all HTTP routes for poll management
 * CRUD operations and voting functionality for polls
 */

const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const User = require('../models/User');

/**
 * @route   GET /api/polls
 * @desc    Get all polls
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const polls = await Poll.find()
      .populate('createdBy', 'username email avatar')
      .sort({ createdAt: -1 })
      .select('-__v');
    
    res.json({
      success: true,
      count: polls.length,
      data: polls
    });
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching polls',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/polls/active
 * @desc    Get all active polls
 * @access  Public
 */
router.get('/active', async (req, res) => {
  try {
    const activePolls = await Poll.getActivePolls();
    
    res.json({
      success: true,
      count: activePolls.length,
      data: activePolls
    });
  } catch (error) {
    console.error('Error fetching active polls:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active polls',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/polls/stats
 * @desc    Get poll statistics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await Poll.getPollStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching poll stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching poll statistics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/polls/user/:userId/history
 * @desc    Get user's voting history
 * @access  Public
 */
router.get('/user/:userId/history', async (req, res) => {
  try {
    const polls = await Poll.getUserVotingHistory(req.params.userId);
    
    res.json({
      success: true,
      count: polls.length,
      data: polls
    });
  } catch (error) {
    console.error('Error fetching voting history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching voting history',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/polls/:id
 * @desc    Get single poll by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id)
      .populate('createdBy', 'username email avatar')
      .select('-__v');
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }
    
    res.json({
      success: true,
      data: poll
    });
  } catch (error) {
    console.error('Error fetching poll:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching poll',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/polls/:id/results
 * @desc    Get poll results with percentages
 * @access  Public
 */
router.get('/:id/results', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }
    
    // Get results using virtual property
    const results = poll.results;
    
    res.json({
      success: true,
      data: {
        question: poll.question,
        totalVotes: poll.totalVotes,
        results: results,
        status: poll.status,
        isActive: poll.isActive
      }
    });
  } catch (error) {
    console.error('Error fetching poll results:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching poll results',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/polls
 * @desc    Create a new poll
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { question, description, options, createdBy, allowMultipleVotes, expiresAt, pollType } = req.body;
    
    // Validation
    if (!question || !options || !createdBy) {
      return res.status(400).json({
        success: false,
        message: 'Question, options, and creator are required'
      });
    }
    
    // Verify creator exists
    const user = await User.findById(createdBy);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Creator user not found'
      });
    }
    
    // Format options
    const formattedOptions = options.map(option => ({
      optionText: typeof option === 'string' ? option : option.optionText,
      votes: 0,
      voters: []
    }));
    
    // Create poll
    const poll = await Poll.create({
      question,
      description: description || '',
      options: formattedOptions,
      createdBy,
      creatorName: user.username,
      allowMultipleVotes: allowMultipleVotes || false,
      pollType: pollType || 'single',
      expiresAt: expiresAt || null
    });
    
    // Populate creator info
    await poll.populate('createdBy', 'username email avatar');
    
    res.status(201).json({
      success: true,
      message: 'Poll created successfully',
      data: poll
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    
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
      message: 'Error creating poll',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/polls/:id/vote
 * @desc    Cast a vote in a poll
 * @access  Public
 */
router.post('/:id/vote', async (req, res) => {
  try {
    const { userId, optionId } = req.body;
    
    if (!userId || !optionId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and option ID are required'
      });
    }
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }
    
    // Cast vote using instance method
    await poll.castVote(userId, optionId);
    
    // Populate creator
    await poll.populate('createdBy', 'username email avatar');
    
    res.json({
      success: true,
      message: 'Vote cast successfully',
      data: poll
    });
  } catch (error) {
    console.error('Error casting vote:', error);
    
    // Handle custom errors from castVote method
    if (error.message.includes('not accepting votes') || 
        error.message.includes('expired') || 
        error.message.includes('already voted')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error casting vote',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/polls/:id/vote
 * @desc    Remove a vote from a poll
 * @access  Public
 */
router.delete('/:id/vote', async (req, res) => {
  try {
    const { userId, optionId } = req.body;
    
    if (!userId || !optionId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and option ID are required'
      });
    }
    
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }
    
    await poll.removeVote(userId, optionId);
    
    res.json({
      success: true,
      message: 'Vote removed successfully',
      data: poll
    });
  } catch (error) {
    console.error('Error removing vote:', error);
    
    if (error.message.includes('Vote not found') || error.message.includes('Invalid option')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error removing vote',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/polls/:id
 * @desc    Update poll (question, description, etc.)
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  try {
    const { question, description, expiresAt } = req.body;
    
    const updateData = {};
    if (question !== undefined) updateData.question = question;
    if (description !== undefined) updateData.description = description;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt;
    
    const poll = await Poll.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('createdBy', 'username email avatar');
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Poll updated successfully',
      data: poll
    });
  } catch (error) {
    console.error('Error updating poll:', error);
    
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
      message: 'Error updating poll',
      error: error.message
    });
  }
});

/**
 * @route   PATCH /api/polls/:id/close
 * @desc    Close a poll (stop accepting votes)
 * @access  Public
 */
router.patch('/:id/close', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }
    
    await poll.closePoll();
    
    res.json({
      success: true,
      message: 'Poll closed successfully',
      data: poll
    });
  } catch (error) {
    console.error('Error closing poll:', error);
    res.status(500).json({
      success: false,
      message: 'Error closing poll',
      error: error.message
    });
  }
});

/**
 * @route   PATCH /api/polls/:id/reopen
 * @desc    Reopen a closed poll
 * @access  Public
 */
router.patch('/:id/reopen', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }
    
    await poll.reopenPoll();
    
    res.json({
      success: true,
      message: 'Poll reopened successfully',
      data: poll
    });
  } catch (error) {
    console.error('Error reopening poll:', error);
    res.status(500).json({
      success: false,
      message: 'Error reopening poll',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/polls/:id
 * @desc    Delete poll by ID
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const poll = await Poll.findByIdAndDelete(req.params.id);
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Poll deleted successfully',
      data: poll
    });
  } catch (error) {
    console.error('Error deleting poll:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting poll',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/polls/export/json
 * @desc    Export all polls as JSON
 * @access  Public
 */
router.get('/export/json', async (req, res) => {
  try {
    const polls = await Poll.find()
      .populate('createdBy', 'username email')
      .sort({ createdAt: 1 })
      .select('-__v');
    
    res.json({
      success: true,
      exportDate: new Date().toISOString(),
      count: polls.length,
      data: polls
    });
  } catch (error) {
    console.error('Error exporting polls:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting polls',
      error: error.message
    });
  }
});

module.exports = router;