const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tag name is required'],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag name cannot exceed 30 characters']
  },
  usageCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Note: Name index is automatically created by unique: true constraint
// Additional indexes for better performance
tagSchema.index({ usageCount: -1 });
tagSchema.index({ isActive: 1 });

module.exports = mongoose.model('Tag', tagSchema);
