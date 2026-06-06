const User = require('../models/User');
const Post = require('../models/Post');

// Get any user's profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('followers', 'username profilePic')
      .populate('following', 'username profilePic');

    if (!user) return res.status(404).json({ message: 'User not found' });

    const posts = await Post.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    res.status(200).json({ user, posts });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update logged in user's profile
const updateProfile = async (req, res) => {
  try {
    const {
      username, bio, githubUrl,
      linkedinUrl, portfolioUrl,
      techStack, openToWork
    } = req.body;

    // Parse techStack
    const parsedTechStack = techStack
      ? (typeof techStack === 'string'
        ? techStack.split(',').map(t => t.trim())
        : techStack)
      : [];

    const updateData = {
      username,
      bio,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      techStack: parsedTechStack,
      openToWork: openToWork === 'true' || openToWork === true
    };

    // If profile pic uploaded
    if (req.file) {
      updateData.profilePic = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    let searchConditions = {
      _id: { $ne: req.user._id }
    };

    if (query && query.trim() !== '') {
      searchConditions.username = { $regex: query.trim(), $options: 'i' };
    }

    const currentUser = await User.findById(req.user._id);

    const users = await User.find(searchConditions)
      .select('username profilePic bio techStack openToWork followers');

    const usersWithFollowStatus = users.map(u => ({
      ...u.toObject(),
      isFollowing: currentUser.following.some(
        id => id.toString() === u._id.toString()
      )
    }));

    res.status(200).json(usersWithFollowStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile, searchUsers };