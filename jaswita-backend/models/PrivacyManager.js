const mongoose = require("mongoose")

const privacyManagerSchema = new mongoose.Schema({
  memoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Memory",
    required: true,
  },
  visibility: {
    type: String,
    enum: ["public", "private", "friends", "group"],
    required: true,
  },
  allowedUsers: [
    {
      type: String,
    },
  ],
  allowedGroups: [
    {
      type: String,
    },
  ],
  restrictedUsers: [
    {
      type: String,
    },
  ],
  settings: {
    allowComments: {
      type: Boolean,
      default: true,
    },
    allowSharing: {
      type: Boolean,
      default: true,
    },
    allowDownload: {
      type: Boolean,
      default: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

privacyManagerSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model("PrivacyManager", privacyManagerSchema)
