const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const {
  createJob,
  getJobs,
  deleteJob,
  toggleJobStatus
} = require('../controllers/jobController');

router.post('/', protect, createJob);
router.get('/', protect, getJobs);
router.delete('/:jobId', protect, deleteJob);
router.put('/toggle/:jobId', protect, toggleJobStatus);

module.exports = router;