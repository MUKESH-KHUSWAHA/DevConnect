const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // DevConnect specific fields
  title: {
    type: String,
    default: ""
  },
  caption: {
    type: String,
    default: ""
  },
  mediaUrl: {
    type: String,
    default: ""
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', 'none'],
    default: 'none'
  },
  githubLink: {
    type: String,
    default: ""
  },
  liveLink: {
    type: String,
    default: ""
  },
  tags: {
    type: [String],  // ['react', 'nodejs', 'fullstack']
    default: []
  },
  postType: {
    type: String,
    enum: ['project', 'snippet', 'general'],
    default: 'general'
  },
  codeSnippet: {
    type: String,
    default: ""
  },
  codeLanguage: {
    type: String,
    default: "javascript"
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],

  aiReview: {
    concept: { type: String, default: "" },
    issues: { type: String, default: "" },
    optimized: { type: String, default: "" },
    generatedAt: { type: Date, default: null }
  }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);