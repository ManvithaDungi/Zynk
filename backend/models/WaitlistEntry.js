const mongoose = require('mongoose');

const waitlistEntrySchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  position: {
    type: Number,
    required: [true, 'Position is required']
  },
  status: {
    type: String,
    enum: ['waiting', 'notified', 'registered', 'expired'],
    default: 'waiting'
  },
  notifiedAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Waitlist entries expire after 24 hours
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
waitlistEntrySchema.index({ event: 1, position: 1 });
waitlistEntrySchema.index({ user: 1 });
waitlistEntrySchema.index({ status: 1 });

// Ensure one waitlist entry per user per event
waitlistEntrySchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('WaitlistEntry', waitlistEntrySchema);
