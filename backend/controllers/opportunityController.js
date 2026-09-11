const Opportunity = require('../models/Opportunity');

// 1. Post New Opportunity (Recruiter)
exports.createOpportunity = async (req, res) => {
  try {
    const { 
      title, companyName, type, location, experience, 
      domain, salaryOrStipend, duration, skills, description, deadline, recruiterId 
    } = req.body;

    // Required fields validation
    if (!title || !companyName || !location || !description) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    // Convert comma-separated string to array
    const skillsArray = typeof skills === 'string' 
      ? skills.split(',').map(s => s.trim()).filter(Boolean)
      : (Array.isArray(skills) ? skills : []);

    const newOpportunity = new Opportunity({
      title,
      companyName,
      type,
      location,
      experience,
      domain,
      salaryOrStipend, // Ensure schema matches this field
      duration,
      skills,
      description,
      deadline,
      recruiter: recruiterId // ya recruiterId
    });

    await newOpportunity.save();
    res.status(201).json({ message: 'Opportunity posted successfully!', opportunity: newOpportunity });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({ message: 'Failed to post opportunity', error: error.message });
  }
};

// 2. Get All Opportunities (Candidate Home Page)
exports.getAllOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find().sort({ createdAt: -1 });
    res.status(200).json(opportunities);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ message: 'Error fetching opportunities', error: error.message });
  }
};

// 3. Get Active Opportunities for Logged in Recruiter
exports.getRecruiterOpportunities = async (req, res) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : null;
    const opportunities = await Opportunity.find({ postedBy: userId }).sort({ createdAt: -1 });
    res.status(200).json(opportunities);
  } catch (error) {
    console.error('Error fetching recruiter listings:', error);
    res.status(500).json({ message: 'Error fetching recruiter listings', error: error.message });
  }
};