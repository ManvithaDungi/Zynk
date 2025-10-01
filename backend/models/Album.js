const mongoose = require("mongoose")

const albumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Album title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
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
    memories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Memory",
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    coverImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

albumSchema.index({ event: 1 })
albumSchema.index({ createdBy: 1 })

module.exports = mongoose.model("Album", albumSchema)
