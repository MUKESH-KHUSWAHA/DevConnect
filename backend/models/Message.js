const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  seen: {
    type: Boolean,
    default: false
  },
  jobRef: {
    title: { type: String, default: null },
    jobType: { type: String, default: null },
    location: { type: String, default: null },
    salary: { type: String, default: null }
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);