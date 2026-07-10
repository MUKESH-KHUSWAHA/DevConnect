const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const { upload } = require('../config/cloudinary');
const {
  getProfile,
  updateProfile,
  searchUsers
} = require('../controllers/profileController');

router.get('/search', protect, searchUsers);
router.get('/:userId', protect, getProfile);
router.put('/update', protect, upload.single('profilePic'), updateProfile);

module.exports = router;