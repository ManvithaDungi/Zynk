const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  question: {
    type: String,
    required: [true, 'Poll question is required'],
    trim: true,
    maxlength: [200, 'Question cannot exceed 200 characters']
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Option text cannot exceed 100 characters']
    },
    votes: [{
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
  allowMultipleVotes: {
    type: Boolean,
    default: false
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
