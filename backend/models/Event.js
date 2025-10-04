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
    type: String,
    enum: ["Conference", "Workshop", "Meetup", "Social", "Sports", "Arts", "Music", "Other"],
    default: "Other"
  },
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
  }
}, {
  timestamps: true
});

// Indexes for better performance
eventSchema.index({ organizer: 1, createdAt: -1 });
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ category: 1 });

// Virtual for registration count
eventSchema.virtual('registrationCount').get(function() {
  return this.registeredUsers.length;
});

// Ensure virtual fields are serialized
eventSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);