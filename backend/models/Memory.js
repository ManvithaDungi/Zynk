const mongoose = require("mongoose")

const memorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Memory title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    mediaUrl: {
      type: String,
      required: [true, "Media URL is required"],
    },
    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
        },
        text: {
          type: String,
          required: true,
          maxlength: [500, "Comment cannot exceed 500 characters"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

memorySchema.index({ album: 1 })
memorySchema.index({ event: 1 })
memorySchema.index({ createdBy: 1 })

module.exports = mongoose.model("Memory", memorySchema)
