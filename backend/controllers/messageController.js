const Message = require('../models/Message');
const User = require('../models/User');

const getUsersForChat = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const followingIds = currentUser.following.map(id => id.toString());

    // People who messaged me
    const messagedMe = await Message.distinct('senderId', {
      receiverId: req.user._id
    });

    // People I messaged
    const iMessaged = await Message.distinct('receiverId', {
      senderId: req.user._id
    });

    // All unique user IDs excluding self
    const allUserIds = [...new Set([
      ...followingIds,
      ...messagedMe.map(id => id.toString()),
      ...iMessaged.map(id => id.toString())
    ])].filter(id => id !== req.user._id.toString());

    const users = await User.find({
      _id: { $in: allUserIds }
    }).select('username profilePic');

    // Get last message for each user
    const usersWithMeta = await Promise.all(users.map(async (u) => {
      const lastMessage = await Message.findOne({
        $or: [
          { senderId: req.user._id, receiverId: u._id },
          { senderId: u._id, receiverId: req.user._id }
        ]
      }).sort({ createdAt: -1 });

      const isFollowing = followingIds.includes(u._id.toString());
      const theyMessagedMe = messagedMe.map(id => id.toString()).includes(u._id.toString());
      
      // isRequest = they messaged me but I don't follow them
      const isRequest = !isFollowing && theyMessagedMe;

      return {
        ...u.toObject(),
        lastMessage: lastMessage ? {
          text: lastMessage.text,
          createdAt: lastMessage.createdAt,
          senderId: lastMessage.senderId
        } : null,
        isRequest
      };
    }));

    // Sort by last message time
    usersWithMeta.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || 0;
      const bTime = b.lastMessage?.createdAt || 0;
      return new Date(bTime) - new Date(aTime);
    });

    res.status(200).json(usersWithMeta);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId }
      ]
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      { senderId: userId, receiverId: myId, seen: false },
      { seen: true }
    );

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { text } = req.body;
    const message = new Message({
      senderId: req.user._id,
      receiverId: userId,
      text
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user._id,
      seen: false
    });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getUnreadPerSender = async (req, res) => {
  try {
    const counts = await Message.aggregate([
      {
        $match: {
          receiverId: req.user._id,
          seen: false
        }
      },
      {
        $group: {
          _id: '$senderId',
          count: { $sum: 1 }
        }
      }
    ]);
    res.status(200).json(counts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUsersForChat,
  getMessages,
  sendMessage,
  getUnreadCount,
  getUnreadPerSender
};