const Job = require('../models/Job');

// Create a job post
const createJob = async (req, res) => {
  try {
    const {
      title, description, type,
      tags, location, salary, applyLink
    } = req.body;

    const parsedTags = tags
      ? (typeof tags === 'string'
        ? tags.split(',').map(t => t.trim())
        : tags)
      : [];

    const job = new Job({
      userId: req.user._id,
      title,
      description,
      type,
      tags: parsedTags,
      location: location || 'Remote',
      salary,
      applyLink
    });

    await job.save();
    res.status(201).json({ message: 'Job posted!', job });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all jobs with optional filter
const getJobs = async (req, res) => {
  try {
    const { type, tag } = req.query;
    let query = { isOpen: true };

    if (type && type !== 'all') {
      query.type = type;
    }
    if (tag) {
      query.tags = {
        $elemMatch: { $regex: `^${tag}$`, $options: 'i' }
      };
    }

    const jobs = await Job.find(query)
      .populate('userId', 'username profilePic techStack openToWork')
      .sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a job (only owner)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Job.findByIdAndDelete(req.params.jobId);
    res.status(200).json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle job open/closed
const toggleJobStatus = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    job.isOpen = !job.isOpen;
    await job.save();
    res.status(200).json({ message: `Job ${job.isOpen ? 'opened' : 'closed'}`, job });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createJob, getJobs, deleteJob, toggleJobStatus };