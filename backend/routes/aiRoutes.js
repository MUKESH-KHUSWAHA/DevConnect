const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const { reviewCode } = require('../controllers/aiController');

// Only code review — profile optimizer removed
router.post('/review/:postId', protect, reviewCode);

module.exports = router;