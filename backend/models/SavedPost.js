const mongoose = require('mongoose');

const savedPostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('SavedPost', savedPostSchema);