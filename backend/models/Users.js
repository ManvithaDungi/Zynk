/**
 * Combined User Model
 * Merges authentication, social, and real-time collaboration features
 * Collection name: 'users'
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  
  // Authentication
  password: {
    type: String,
    required: true
  },
  
  // Profile Info
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  
  // Status & Activity
  status: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  
  // Real-time Features
  socketId: {
    type: String,
    default: null
  },
  
  // Social Features
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  postsCount: {
    type: Number,
    default: 0
  },
  
  // Account Settings
  isVerified: {
    type: Boolean,
    default: false
  },
  isPrivate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'users' // Explicit collection name
});

// Indexes
userSchema.index({ username: 1, email: 1 });
userSchema.index({ isActive: 1 });

// Virtual for initials
userSchema.virtual('initials').get(function() {
  return this.username
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
});

// Pre-save middleware for password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance Methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateActivity = function() {
  this.lastActive = new Date();
  return this.save();
};

userSchema.methods.setActive = function(socketId = null) {
  this.isActive = true;
  this.status = 'online';
  this.lastActive = new Date();
  if (socketId) {
    this.socketId = socketId;
  }
  return this.save();
};

userSchema.methods.setInactive = function() {
  this.isActive = false;
  this.status = 'offline';
  this.socketId = null;
  return this.save();
};

// Static Methods
userSchema.statics.getActiveUsers = function() {
  return this.find({ isActive: true }).sort({ lastActive: -1 });
};

userSchema.statics.getUserStats = async function() {
  const total = await this.countDocuments();
  const active = await this.countDocuments({ isActive: true });
  const offline = total - active;
  
  return {
    total,
    active,
    offline,
    onlinePercentage: total > 0 ? ((active / total) * 100).toFixed(2) : 0
  };
};

// JSON serialization
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    delete ret.password; // Don't expose password in JSON
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;