const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  time: {
    type: String,
    required: [true, 'Time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    maxlength: [300, 'Location cannot exceed 300 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  maxAttendees: {
    type: Number,
    required: [true, 'Max attendees is required'],
    min: [1, 'Max attendees must be at least 1'],
    max: [10000, 'Max attendees cannot exceed 10000'],
    default: 100
  },
  thumbnail: {
    url: {
      type: String,
      default: null
    },
    publicId: {
      type: String,
      default: null
    }
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer is required']
  },
  registeredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  },
  // New fields for enhanced features
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['weekly', 'monthly', 'none'],
    default: 'none'
  },
  recurringEndDate: {
    type: Date
  },
  allowWaitlist: {
    type: Boolean,
    default: true
  },
  waitlistLimit: {
    type: Number,
    default: 50
  },
  allowChat: {
    type: Boolean,
    default: true
  },
  allowReviews: {
    type: Boolean,
    default: true
  },
  allowPolls: {
    type: Boolean,
    default: true
  },
  shareable: {
    type: Boolean,
    default: true
  },
  // Privacy settings
  visibility: {
    type: String,
    enum: ['public', 'private', 'friends', 'group'],
    default: 'public'
  },
  settings: {
    allowDownload: {
      type: Boolean,
      default: true
    },
    allowSharing: {
      type: Boolean,
      default: true
    },
    allowComments: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
eventSchema.index({ organizer: 1, createdAt: -1 });
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ isRecurring: 1 });
eventSchema.index({ status: 1, date: 1 });

// Virtual for registration count
eventSchema.virtual('registrationCount').get(function() {
  return this.registeredUsers.length;
});

// Virtual for average rating
eventSchema.virtual('averageRating').get(function() {
  // This will be populated by aggregation
  return this._averageRating || 0;
});

// Virtual for total reviews
eventSchema.virtual('totalReviews').get(function() {
  // This will be populated by aggregation
  return this._totalReviews || 0;
});

// Ensure virtual fields are serialized
eventSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);