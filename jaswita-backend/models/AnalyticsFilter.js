const mongoose = require("mongoose")

const analyticsFilterSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    default: "event-123",
  },
  metric: {
    type: String,
    enum: ["views", "likes", "shares", "comments", "downloads", "engagement"],
    required: true,
  },
  value: {
    type: Number,
    required: true,
    default: 0,
  },
  category: {
    type: String,
    enum: ["photos", "videos", "testimonials", "highlights", "candid", "group"],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: String,
  },
  memoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Memory",
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
})


module.exports = mongoose.model("AnalyticsFilter", analyticsFilterSchema)
