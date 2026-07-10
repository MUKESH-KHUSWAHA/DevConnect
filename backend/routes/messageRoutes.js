const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const {
  getUsersForChat,
  getMessages,
  sendMessage,
  getUnreadCount,
  getUnreadPerSender
} = require('../controllers/messageController');

router.get('/users', protect, getUsersForChat);
router.get('/unread-count', protect, getUnreadCount);
router.get('/unread-per-sender', protect, getUnreadPerSender); // ← new
router.get('/:userId', protect, getMessages);
router.post('/:userId', protect, sendMessage);

module.exports = router;