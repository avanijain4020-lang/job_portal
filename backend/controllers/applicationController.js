const Application = require('../models/Application');

// 1. Candidate ki sabhi applied applications fetch karna
exports.getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // Schema ke mutabiq 'job' field ko populate karna
    const applications = await Application.find({ applicant: userId })
      .populate('job')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Error fetching candidate applications:', error);
    res.status(500).json({ message: 'Server error while fetching applications' });
  }
};

// 2. Candidate ka naye job/internship ke liye apply karna (All Schema Fields Included)
exports.applyForJob = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const {
      job, // ObjectId of Opportunity
      applicantName,
      applicantEmail,
      degree,
      college,
      experienceYears,
      linkedinUrl,
      githubUrl,
      coverNote,
      resumeLink
    } = req.body;

    // Check duplicate application
    const existingApp = await Application.findOne({
      applicant: userId,
      job: job
    });

    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied for this role.' });
    }

    const newApplication = new Application({
      applicant: userId,
      job,
      applicantName,
      applicantEmail,
      degree,
      college,
      experienceYears: experienceYears || 'Fresher',
      linkedinUrl,
      githubUrl,
      coverNote,
      resumeLink,
      status: 'Pending'
    });

    await newApplication.save();
    res.status(201).json({ 
      message: 'Application submitted successfully!', 
      application: newApplication 
    });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ message: 'Server error while submitting application' });
  }
};

// 3. Employer dwara Interview Schedule karna (SOLUTION FOR YOUR ISSUE)
exports.scheduleInterview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { interviewDate, interviewTime } = req.body;

    if (!interviewDate || !interviewTime) {
      return res.status(400).json({ message: 'Please provide both interview date and time.' });
    }

    // Database document update for interview status
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      {
        status: 'Interview Scheduled',
        interviewDate,
        interviewTime
      },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json({
      message: 'Interview scheduled successfully!',
      application: updatedApplication
    });
  } catch (error) {
    console.error('Error scheduling interview:', error);
    res.status(500).json({ message: 'Server error while scheduling interview' });
  }
};

// 4. Employer ke liye sabhi applications get karna
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('job')
      .populate('applicant', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching all applications:', error);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
};