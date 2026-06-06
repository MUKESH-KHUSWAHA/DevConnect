const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['internship', 'fulltime', 'freelance', 'hackathon', 'opensource', 'collab'],
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  location: {
    type: String,
    default: 'Remote'
  },
  salary: {
    type: String,
    default: ''
  },
  applyLink: {
    type: String,
    default: ''
  },
  isOpen: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);