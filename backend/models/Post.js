const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  caption: {
    type: String,
    required: [true, 'Caption is required'],
    trim: true,
    maxlength: [2000, "Caption cannot exceed 2000 characters"]
  },
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Album",
    required: [true, 'Album is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, 'User is required']
  },
  media: [{
    url: {
      type: String,
      required: [true, 'Media URL is required'],
      validate: {
        validator: function(url) {
          return /^https?:\/\/.+/.test(url);
        },
        message: 'Media URL must be a valid HTTP/HTTPS URL'
      }
    },
    type: {
      type: String,
      enum: ["image", "video"],
      required: [true, 'Media type is required']
    },
    filename: {
      type: String,
      required: [true, 'Filename is required']
    }
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, 'Comment user is required']
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"]
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
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

// Indexes for better query performance
postSchema.index({ album: 1, createdAt: -1 });
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

// Virtual for likes count
postSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Virtual for comments count
postSchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

// Ensure virtual fields are serialized
postSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("Post", postSchema);