const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profilePic: {
    type: String,
    default: ""
  },
  bio: {
    type: String,
    default: ""
  },
  // DevConnect specific fields
  githubUrl: {
    type: String,
    default: ""
  },
  linkedinUrl: {
    type: String,
    default: ""
  },
  portfolioUrl: {
    type: String,
    default: ""
  },
  techStack: {
    type: [String],  // ['React', 'Node.js', 'MongoDB']
    default: []
  },
  openToWork: {
    type: Boolean,
    default: false
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);