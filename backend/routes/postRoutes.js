const express = require('express');
const router = express.Router();
const {
  createPost,
  getFeed,
  getUserPosts,
  deletePost
} = require('../controllers/postController');
const protect = require('../middleware/protect');
const { upload } = require('../config/cloudinary');

router.post('/', protect, upload.single('media'), createPost);
router.get('/feed', protect, getFeed);
router.get('/user/:userId', protect, getUserPosts);
router.delete('/:postId', protect, deletePost);

module.exports = router;