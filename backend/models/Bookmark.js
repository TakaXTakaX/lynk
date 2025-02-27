const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  collection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  },
  favicon: String,
  thumbnail: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for user and URL
bookmarkSchema.index({ user: 1, url: 1 }, { unique: true });

// Create text index for search
bookmarkSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

module.exports = mongoose.model('Bookmark', bookmarkSchema);