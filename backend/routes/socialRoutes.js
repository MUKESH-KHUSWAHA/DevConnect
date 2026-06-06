const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const {
  likePost,
  addComment,
  getComments,
  followUser,
  savePost,
  getSavedPosts,
  getSavedStatus
} = require('../controllers/socialController');

router.put('/like/:postId', protect, likePost);
router.post('/comment/:postId', protect, addComment);
router.get('/comment/:postId', protect, getComments);
router.put('/follow/:userId', protect, followUser);
router.put('/save/:postId', protect, savePost);
router.get('/saved', protect, getSavedPosts);
router.get('/saved/:postId', protect, getSavedStatus);

module.exports = router;