const Post = require('../models/Post');

const createPost = async (req, res) => {
  try {
    const {
      caption, title, githubLink,
      liveLink, tags, postType,
      codeSnippet, codeLanguage
    } = req.body;

    // For code snippets, no file needed
    // For project/general posts, file is optional
    let mediaUrl = "";
    let mediaType = "none";

    if (req.file) {
      mediaUrl = req.file.path;
      mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    }

    // Parse tags — comes as string from form data
    const parsedTags = tags
      ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags)
      : [];

    const newPost = new Post({
      userId: req.user._id,
      title,
      caption,
      mediaUrl,
      mediaType,
      githubLink,
      liveLink,
      tags: parsedTags,
      postType: postType || 'general',
      codeSnippet: codeSnippet || "",
      codeLanguage: codeLanguage || "javascript"
    });

    await newPost.save();

    res.status(201).json({
      message: 'Post created successfully',
      post: newPost
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getFeed = async (req, res) => {
  try {
    const { tag, tags } = req.query;

    let query = {};

    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim().toLowerCase());
      // $in → post must have AT LEAST ONE of selected tags
      // Also make sure tags array is not empty on the post
      query.tags = { $in: tagArray, $exists: true, $ne: [] };
    } else if (tag) {
      query.tags = { $in: [tag.toLowerCase()], $exists: true, $ne: [] };
    }
    // If no tag filter → return ALL posts (no query restriction)

    const posts = await Post.find(query)
      .populate('userId', 'username profilePic techStack openToWork')
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .populate('userId', 'username profilePic')
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Only owner can delete
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createPost, getFeed, getUserPosts, deletePost };