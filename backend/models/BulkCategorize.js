const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema({
  title: { type: String, required: true },          // frontend uses this
  description: { type: String, required: true },    // frontend uses this
  author: { type: String, required: true },         // maps to userName
  imageUrl: { type: String },                       // maps to mediaUrl
  category: { type: String, default: "Uncategorized" },
  tags: [String],

  // Engagement
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  views: { type: Number, default: 0 },

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const BulkCategorize = mongoose.model("BulkCategorize", memorySchema);
module.exports = BulkCategorize;
