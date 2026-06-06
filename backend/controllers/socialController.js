const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const SavedPost = require('../models/SavedPost');

// Helper to create notification + emit via socket
const createNotification = async (userId, senderId, type, postId = null, io = null, onlineUsers = null) => {
  if (userId.toString() === senderId.toString()) return;
  try {
    const notification = new Notification({ userId, senderId, type, postId });
    await notification.save();

    // Emit real-time notification if user is online
    if (io && onlineUsers) {
      const populatedNotification = await notification.populate([
        { path: 'senderId', select: 'username profilePic' },
        { path: 'postId', select: 'mediaUrl title' }
      ]);
      const receiverSocketId = onlineUsers.get(userId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newNotification', populatedNotification);
      }
    }
  } catch (err) {
    console.error('Notification error:', err);
  }
};

let _io = null;
let _onlineUsers = null;

// Called from server.js to inject socket instance
const setSocketInstance = (io, onlineUsers) => {
  _io = io;
  _onlineUsers = onlineUsers;
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const alreadyLiked = post.likes.includes(req.user._id);

    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
      await post.save();
      return res.status(200).json({ message: 'Post unliked', likes: post.likes.length });
    } else {
      post.likes.push(req.user._id);
      await post.save();
      await createNotification(post.userId, req.user._id, 'like', post._id, _io, _onlineUsers);
      return res.status(200).json({ message: 'Post liked', likes: post.likes.length });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = new Comment({
      postId: req.params.postId,
      userId: req.user._id,
      text
    });
    await comment.save();
    post.comments.push(comment._id);
    await post.save();

    await createNotification(post.userId, req.user._id, 'comment', post._id, _io, _onlineUsers);

    const populatedComment = await comment.populate('userId', 'username profilePic');
    res.status(201).json({ message: 'Comment added', comment: populatedComment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .populate('userId', 'username profilePic')
      .sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const followUser = async (req, res) => {
  try {
    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user._id);
    if (!userToFollow) return res.status(404).json({ message: 'User not found' });

    const alreadyFollowing = currentUser.following.includes(req.params.userId);

    if (alreadyFollowing) {
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== req.params.userId
      );
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== req.user._id.toString()
      );
      await currentUser.save();
      await userToFollow.save();
      return res.status(200).json({ message: 'Unfollowed successfully' });
    } else {
      currentUser.following.push(req.params.userId);
      userToFollow.followers.push(req.user._id);
      await currentUser.save();
      await userToFollow.save();
      await createNotification(req.params.userId, req.user._id, 'follow', null, _io, _onlineUsers);
      return res.status(200).json({ message: 'Followed successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Save / Unsave post
const savePost = async (req, res) => {
  try {
    const existing = await SavedPost.findOne({
      userId: req.user._id,
      postId: req.params.postId
    });

    if (existing) {
      await SavedPost.findByIdAndDelete(existing._id);
      return res.status(200).json({ message: 'Post unsaved', saved: false });
    } else {
      await SavedPost.create({
        userId: req.user._id,
        postId: req.params.postId
      });
      const post = await Post.findById(req.params.postId);
      if (post) {
        await createNotification(post.userId, req.user._id, 'save', post._id, _io, _onlineUsers);
      }
      return res.status(200).json({ message: 'Post saved', saved: true });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get saved posts for current user
const getSavedPosts = async (req, res) => {
  try {
    const saved = await SavedPost.find({ userId: req.user._id })
      .populate({
        path: 'postId',
        populate: { path: 'userId', select: 'username profilePic' }
      })
      .sort({ createdAt: -1 });

    const posts = saved.map(s => s.postId).filter(Boolean);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get saved status for a post
const getSavedStatus = async (req, res) => {
  try {
    const existing = await SavedPost.findOne({
      userId: req.user._id,
      postId: req.params.postId
    });
    res.status(200).json({ saved: !!existing });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  likePost,
  addComment,
  getComments,
  followUser,
  savePost,
  getSavedPosts,
  getSavedStatus,
  setSocketInstance
};