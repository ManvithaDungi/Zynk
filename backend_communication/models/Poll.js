/**
 * Poll Model
 * Defines the schema and model for polls in the collaboration hub
 * Stores poll questions, options, votes, and results for real-time polling
 */

const mongoose = require('mongoose');

/**
 * Poll Option Sub-Schema
 * Represents each option in a poll with votes tracking
 */
const pollOptionSchema = new mongoose.Schema({
  optionText: {
    type: String,
    required: [true, 'Option text is required'],
    trim: true,
    maxlength: [200, 'Option text cannot exceed 200 characters']
  },
  votes: {
    type: Number,
    default: 0,
    min: 0
  },
  voters: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { _id: true });

/**
 * Poll Schema Definition
 * Fields:
 * - question: The poll question
 * - options: Array of poll options with votes
 * - createdBy: User who created the poll
 * - isActive: Whether poll is currently accepting votes
 * - totalVotes: Total number of votes cast
 * - allowMultipleVotes: Whether users can vote multiple times
 * - expiresAt: Optional expiration date
 */
const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Poll question is required'],
    trim: true,
    minlength: [5, 'Question must be at least 5 characters'],
    maxlength: [500, 'Question cannot exceed 500 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  options: {
    type: [pollOptionSchema],
    required: [true, 'Poll must have at least 2 options'],
    validate: {
      validator: function(options) {
        return options.length >= 2 && options.length <= 10;
      },
      message: 'Poll must have between 2 and 10 options'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  creatorName: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  totalVotes: {
    type: Number,
    default: 0,
    min: 0
  },
  allowMultipleVotes: {
    type: Boolean,
    default: false
  },
  votersList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  expiresAt: {
    type: Date,
    default: null
  },
  pollType: {
    type: String,
    enum: ['single', 'multiple'],
    default: 'single'
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'expired'],
    default: 'active'
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'polls' // Explicitly set collection name
});

/**
 * Indexes for faster queries
 */
pollSchema.index({ isActive: 1, createdAt: -1 });
pollSchema.index({ createdBy: 1 });
pollSchema.index({ status: 1 });

/**
 * Virtual property to check if poll is expired
 */
pollSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

/**
 * Virtual property to get poll results with percentages
 */
pollSchema.virtual('results').get(function() {
  return this.options.map(option => ({
    optionText: option.optionText,
    votes: option.votes,
    percentage: this.totalVotes > 0 
      ? ((option.votes / this.totalVotes) * 100).toFixed(2) 
      : 0,
    voters: option.voters.length
  }));
});

/**
 * Instance method to cast a vote
 * @param {String} userId - The ID of the user voting
 * @param {String} optionId - The ID of the option being voted for
 * @returns {Promise} - Updated poll document
 */
pollSchema.methods.castVote = async function(userId, optionId) {
  // Check if poll is active
  if (!this.isActive || this.status !== 'active') {
    throw new Error('This poll is not accepting votes');
  }
  
  // Check if poll is expired
  if (this.isExpired) {
    this.status = 'expired';
    this.isActive = false;
    await this.save();
    throw new Error('This poll has expired');
  }
  
  // Check if user already voted (if multiple votes not allowed)
  if (!this.allowMultipleVotes && this.votersList.includes(userId)) {
    throw new Error('You have already voted in this poll');
  }
  
  // Find the option
  const option = this.options.id(optionId);
  if (!option) {
    throw new Error('Invalid option selected');
  }
  
  // Check if user already voted for this specific option
  const alreadyVotedForOption = option.voters.some(
    voter => voter.user.toString() === userId.toString()
  );
  
  if (alreadyVotedForOption) {
    throw new Error('You have already voted for this option');
  }
  
  // Add vote
  option.votes += 1;
  option.voters.push({
    user: userId,
    votedAt: new Date()
  });
  
  // Add user to voters list if not already there
  if (!this.votersList.includes(userId)) {
    this.votersList.push(userId);
  }
  
  // Update total votes
  this.totalVotes += 1;
  
  return this.save();
};

/**
 * Instance method to remove a vote
 * @param {String} userId - The ID of the user removing vote
 * @param {String} optionId - The ID of the option
 * @returns {Promise} - Updated poll document
 */
pollSchema.methods.removeVote = async function(userId, optionId) {
  const option = this.options.id(optionId);
  if (!option) {
    throw new Error('Invalid option');
  }
  
  // Find and remove the voter
  const voterIndex = option.voters.findIndex(
    voter => voter.user.toString() === userId.toString()
  );
  
  if (voterIndex === -1) {
    throw new Error('Vote not found');
  }
  
  option.voters.splice(voterIndex, 1);
  option.votes = Math.max(0, option.votes - 1);
  this.totalVotes = Math.max(0, this.totalVotes - 1);
  
  // Check if user has any other votes in this poll
  const hasOtherVotes = this.options.some(opt => 
    opt.voters.some(voter => voter.user.toString() === userId.toString())
  );
  
  // Remove from votersList if no other votes
  if (!hasOtherVotes) {
    this.votersList = this.votersList.filter(
      voterId => voterId.toString() !== userId.toString()
    );
  }
  
  return this.save();
};

/**
 * Instance method to close poll
 */
pollSchema.methods.closePoll = function() {
  this.isActive = false;
  this.status = 'closed';
  return this.save();
};

/**
 * Instance method to reopen poll
 */
pollSchema.methods.reopenPoll = function() {
  this.isActive = true;
  this.status = 'active';
  return this.save();
};

/**
 * Static method to get active polls
 * @returns {Promise<Array>} - Array of active polls
 */
pollSchema.statics.getActivePolls = function() {
  return this.find({ isActive: true, status: 'active' })
    .populate('createdBy', 'username email avatar')
    .sort({ createdAt: -1 });
};

/**
 * Static method to get poll statistics
 * @returns {Promise<Object>} - Statistics object
 */
pollSchema.statics.getPollStats = async function() {
  const total = await this.countDocuments();
  const active = await this.countDocuments({ isActive: true, status: 'active' });
  const closed = await this.countDocuments({ status: 'closed' });
  const expired = await this.countDocuments({ status: 'expired' });
  
  // Get total votes across all polls
  const votesAggregate = await this.aggregate([
    {
      $group: {
        _id: null,
        totalVotes: { $sum: '$totalVotes' }
      }
    }
  ]);
  
  const totalVotes = votesAggregate.length > 0 ? votesAggregate[0].totalVotes : 0;
  
  return {
    total,
    active,
    closed,
    expired,
    totalVotes,
    averageVotesPerPoll: total > 0 ? (totalVotes / total).toFixed(2) : 0
  };
};

/**
 * Static method to get user's voting history
 * @param {String} userId - The user ID
 * @returns {Promise<Array>} - Array of polls user voted in
 */
pollSchema.statics.getUserVotingHistory = function(userId) {
  return this.find({ votersList: userId })
    .populate('createdBy', 'username avatar')
    .sort({ createdAt: -1 });
};

/**
 * Pre-save middleware to update status based on expiration
 */
pollSchema.pre('save', async function(next) {
  // Check expiration
  if (this.expiresAt && new Date() > this.expiresAt) {
    this.status = 'expired';
    this.isActive = false;
  }
  
  // Set creator name if not set
  if (this.isNew && !this.creatorName && this.createdBy) {
    const User = mongoose.model('User');
    const user = await User.findById(this.createdBy);
    if (user) {
      this.creatorName = user.username;
    }
  }
  
  next();
});

/**
 * Configure JSON serialization
 */
pollSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

// Create and export the Poll model
const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;