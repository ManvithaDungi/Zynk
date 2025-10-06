const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    media: {
      type: String,
      trim: true,
    },
    tag: {
      type: String,
      enum: [
        "public",
        "sports",
        "meetings",
        "programme",
        "social",
        "department",
        "students",
      ],
      default: "public",
      required: true,
    },
    color: {
      type: String,
      default: "rgba(239, 68, 68, 0.6)", // default translucent red (Public)
    },
    collaborators: {
      type: [String],
      default: [],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
