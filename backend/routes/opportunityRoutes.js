const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const authMiddleware = require('../middleware/authMiddleware');

// 1. Post new Job/Internship (Supports both Direct POST and /create)
const handleCreateOpportunity = async (req, res) => {
  try {
    const { 
      title, 
      companyName, 
      location, 
      experience, 
      experienceLevel, 
      domain, 
      type, 
      skills, 
      deadline, 
      description, 
      recruiterId 
    } = req.body;

    if (!title || !companyName || !location) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    // Determine Recruiter ID from Token or Body
    const postedBy = req.user ? (req.user.id || req.user._id) : (recruiterId || null);

    // Format Skills Array
    const skillsArray = typeof skills === 'string'
      ? skills.split(',').map((s) => s.trim()).filter(Boolean)
      : (Array.isArray(skills) ? skills : []);

    const newJob = new Opportunity({
      title,
      companyName,
      location,
      experience: experience || experienceLevel || 'Fresher',
      experienceLevel: experienceLevel || experience || 'Fresher',
      domain: domain || 'General',
      type: type || 'Full-Time',
      skills: skillsArray,
      deadline,
      description: description || 'No description provided.',
      postedBy
    });

    await newJob.save();
    res.status(201).json({ message: 'Job posted successfully!', job: newJob });
  } catch (error) {
    console.error('Job Posting Error:', error);
    res.status(500).json({ message: 'Failed to post job', error: error.message });
  }
};

// POST /api/opportunities and POST /api/opportunities/create
router.post('/', handleCreateOpportunity);
router.post('/create', handleCreateOpportunity);

// 2. Get all jobs (For Student/Candidate Home Page - Supports GET / and GET /all)
const handleGetAllOpportunities = async (req, res) => {
  try {
    const jobs = await Opportunity.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

router.get('/', handleGetAllOpportunities);
router.get('/all', handleGetAllOpportunities);

// 3. Get Active Recruiter Listings (Token Based)
router.get('/my-listings', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const jobs = await Opportunity.find({ postedBy: userId }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recruiter listings', error: error.message });
  }
});

// 4. Get jobs posted by specific recruiter (By URL Param)
router.get('/recruiter/:recruiterId', async (req, res) => {
  try {
    const jobs = await Opportunity.find({ postedBy: req.params.recruiterId }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posted jobs', error: error.message });
  }
});

module.exports = router;