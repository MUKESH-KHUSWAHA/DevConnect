const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const { getNotifications, markAllRead } = require('../controllers/notificationController');

router.get('/', protect, getNotifications);
router.put('/read', protect, markAllRead);

module.exports = router;