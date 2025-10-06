/**
 * User Model
 * Defines the schema and model for users in the collaboration hub
 * Stores user information including name, email, status, and activity
 */

const mongoose = require('mongoose');

/**
 * User Schema Definition
 * Fields:
 * - username: Unique identifier for the user
 * - email: User's email address
 * - isActive: Current online/offline status
 * - lastActive: Timestamp of last activity
 * - createdAt: Account creation timestamp
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  isActive: {
    type: Boolean,
    default: false,
    index: true // Index for faster queries on active users
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  socketId: {
    type: String,
    default: null // Store current socket connection ID for real-time updates
  },
  avatar: {
    type: String,
    default: null // Optional: Store avatar URL or initials
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
  collection: 'users' // Explicitly set collection name
});

/**
 * Index for faster queries
 * Compound index on username and email
 */
userSchema.index({ username: 1, email: 1 });

/**
 * Virtual field to generate user initials
 * Used for avatar display when no avatar image is set
 */
userSchema.virtual('initials').get(function() {
  if (!this.username) return 'UN';
  return this.username
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
});

/**
 * Instance method to update user's last active timestamp
 * Called whenever user performs an action
 */
userSchema.methods.updateActivity = function() {
  this.lastActive = new Date();
  return this.save();
};

/**
 * Instance method to set user as active
 * @param {String} socketId - The socket connection ID
 */
userSchema.methods.setActive = function(socketId = null) {
  this.isActive = true;
  this.status = 'online';
  this.lastActive = new Date();
  if (socketId) {
    this.socketId = socketId;
  }
  return this.save();
};

/**
 * Instance method to set user as inactive
 */
userSchema.methods.setInactive = function() {
  this.isActive = false;
  this.status = 'offline';
  this.socketId = null;
  return this.save();
};

/**
 * Static method to get all active users
 * @returns {Promise<Array>} - Array of active users
 */
userSchema.statics.getActiveUsers = function() {
  return this.find({ isActive: true }).sort({ lastActive: -1 });
};

/**
 * Static method to get user count statistics
 * @returns {Promise<Object>} - Statistics object with counts
 */
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

/**
 * Pre-save middleware
 * Generates initials if avatar is not set
 */
userSchema.pre('save', function(next) {
  // Generate default avatar if not set
  if (!this.avatar) {
    this.avatar = this.initials;
  }
  next();
});

/**
 * Configure JSON serialization
 * Remove sensitive fields when converting to JSON
 */
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;