const mongoose = require("mongoose")

const postSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      trim: true,
      maxlength: [1000, "Caption cannot exceed 1000 characters"],
    },
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    media: [
      {
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["image", "video"],
          required: true,
        },
        filename: {
          type: String,
          required: true,
        },
      },
    ],
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        likedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: [500, "Comment cannot exceed 500 characters"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Index for better query performance
postSchema.index({ album: 1, createdAt: -1 })
postSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model("Post", postSchema)
