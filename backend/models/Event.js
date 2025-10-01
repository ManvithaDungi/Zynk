const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    maxlength: 300
  },
  category: {
    type: String,
    enum: ["Conference", "Workshop", "Meetup", "Social", "Sports", "Arts", "Music", "Other"],
    default: "Other"
  },
  maxAttendees: {
    type: Number,
    required: true,
    min: 1,
    max: 10000,
    default: 100
  },
  thumbnail: {
    url: String,
    publicId: String // For Cloudinary
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
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
module.exports = mongoose.model('Event', eventSchema);