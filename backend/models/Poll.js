const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: false // Make optional for general polls
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  creatorName: {
    type: String,
    required: [true, 'Creator name is required'],
    trim: true
  },
  question: {
    type: String,
    required: [true, 'Poll question is required'],
    trim: true,
    maxlength: [500, 'Question cannot exceed 500 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  options: [{
    optionText: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Option text cannot exceed 200 characters']
    },
    votes: {
      type: Number,
      default: 0
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
  }],
  votersList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  allowMultipleVotes: {
    type: Boolean,
    default: false
  },
  pollType: {
    type: String,
    enum: ['single', 'multiple'],
    default: 'single'
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date
  },
  totalVotes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
pollSchema.index({ event: 1, createdAt: -1 });
pollSchema.index({ createdBy: 1 });
pollSchema.index({ isActive: 1 });

// Virtual for total votes
pollSchema.virtual('voteCount').get(function() {
  return this.totalVotes;
});

// Ensure virtual fields are serialized
pollSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Poll', pollSchema);
