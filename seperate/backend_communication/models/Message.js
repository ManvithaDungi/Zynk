/**
 * Message Model
 * Defines the schema and model for chat messages in the collaboration hub
 * Stores message content, sender info, and timestamps for real-time chat
 */

const mongoose = require('mongoose');

/**
 * Message Schema Definition
 * Fields:
 * - sender: Reference to User who sent the message
 * - content: The actual message text
 * - messageType: Type of message (text, system, notification)
 * - isRead: Whether message has been read
 * - readBy: Array of users who have read the message
 * - createdAt: Timestamp when message was sent
 */
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model
    required: [true, 'Sender is required']
  },
  senderName: {
    type: String,
    required: [true, 'Sender name is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'system', 'notification', 'announcement'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    device: String
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'messages' // Explicitly set collection name
});

/**
 * Index for faster queries
 * Compound index on sender and createdAt for efficient message retrieval
 */
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ createdAt: -1 }); // Index for sorting by time
messageSchema.index({ messageType: 1 }); // Index for filtering by type

/**
 * Virtual property to format message timestamp
 * Returns human-readable time format
 */
messageSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
});

/**
 * Virtual property to format message date
 * Returns human-readable date format
 */
messageSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

/**
 * Instance method to mark message as read by a user
 * @param {String} userId - The ID of the user marking as read
 */
messageSchema.methods.markAsRead = function(userId) {
  // Check if user already marked as read
  const alreadyRead = this.readBy.some(
    read => read.user.toString() === userId.toString()
  );
  
  if (!alreadyRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    this.isRead = true;
  }
  
  return this.save();
};

/**
 * Instance method to edit message content
 * @param {String} newContent - The new message content
 */
messageSchema.methods.editMessage = function(newContent) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

/**
 * Static method to get recent messages
 * @param {Number} limit - Maximum number of messages to retrieve
 * @returns {Promise<Array>} - Array of recent messages
 */
messageSchema.statics.getRecentMessages = function(limit = 50) {
  return this.find()
    .populate('sender', 'username email avatar status')
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Static method to get messages by user
 * @param {String} userId - The user ID to filter by
 * @param {Number} limit - Maximum number of messages
 * @returns {Promise<Array>} - Array of user's messages
 */
messageSchema.statics.getMessagesByUser = function(userId, limit = 100) {
  return this.find({ sender: userId })
    .populate('sender', 'username email avatar')
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Static method to get message statistics
 * @returns {Promise<Object>} - Statistics object
 */
messageSchema.statics.getMessageStats = async function() {
  const total = await this.countDocuments();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayCount = await this.countDocuments({
    createdAt: { $gte: today }
  });
  
  const byType = await this.aggregate([
    {
      $group: {
        _id: '$messageType',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return {
    total,
    today: todayCount,
    byType: byType.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {})
  };
};

/**
 * Static method to search messages
 * @param {String} searchTerm - Text to search for
 * @param {Number} limit - Maximum results
 * @returns {Promise<Array>} - Array of matching messages
 */
messageSchema.statics.searchMessages = function(searchTerm, limit = 20) {
  return this.find({
    content: { $regex: searchTerm, $options: 'i' } // Case-insensitive search
  })
    .populate('sender', 'username avatar')
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Static method to delete old messages
 * @param {Number} daysOld - Messages older than this will be deleted
 * @returns {Promise<Object>} - Delete operation result
 */
messageSchema.statics.deleteOldMessages = function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate }
  });
};

/**
 * Pre-save middleware
 * Automatically set senderName from populated sender
 */
messageSchema.pre('save', async function(next) {
  // If sender is populated and senderName is not set
  if (this.isNew && !this.senderName && this.sender) {
    const User = mongoose.model('User');
    const user = await User.findById(this.sender);
    if (user) {
      this.senderName = user.username;
    }
  }
  next();
});

/**
 * Configure JSON serialization
 * Include virtuals and remove version key
 */
messageSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

// Create and export the Message model
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;