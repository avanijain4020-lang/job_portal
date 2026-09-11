const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Application = require('../models/Application');

// Helper function: Request se User ID nikalne ke liye
const getUserIdFromReq = (req) => {
  if (req.user?._id) return req.user._id;
  if (req.user?.id) return req.user.id;
  if (req.headers['user-id']) return req.headers['user-id'];
  if (req.query.userId) return req.query.userId;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      return decoded.id || decoded._id || decoded.userId;
    } catch (err) {
      console.error("JWT Decode Error in applicationRoutes:", err.message);
    }
  }

  return null;
};

// ==========================================
// 1. FETCH ALL APPLICATIONS (RECRUITER / EMPLOYER)
// ==========================================
router.get(['/', '/all'], async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('job')
      .populate('applicant')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(applications || []);
  } catch (error) {
    console.error("Error fetching recruiter applications:", error);
    return res.status(500).json({ message: "Server error fetching applications", error: error.message });
  }
});

// ==========================================
// 2. FETCH CANDIDATE APPLICATIONS (MY APPLICATIONS)
// ==========================================
router.get(['/candidate-applications', '/my-applications', '/user/:userId'], async (req, res) => {
  try {
    const userId = req.params.userId || getUserIdFromReq(req);

    if (!userId) {
      return res.status(200).json({ success: true, applications: [] });
    }

    const applications = await Application.find({
      $or: [
        { applicant: userId },
        { candidateId: userId },
        { user: userId }
      ]
    })
      .populate('job')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error("Error fetching candidate applications:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 3. SCHEDULE INTERVIEW (MONGODB DATABASE SAVE FIX)
// ==========================================
router.put('/:id/schedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { interviewDate, interviewTime } = req.body;

    if (!interviewDate || !interviewTime) {
      return res.status(400).json({ message: "Interview date and time are required" });
    }

    // Direct MongoDB Database Update
    const updatedApp = await Application.findByIdAndUpdate(
      id,
      { 
        $set: { 
          status: 'Interview Scheduled',
          interviewDate: String(interviewDate),
          interviewTime: String(interviewTime)
        } 
      },
      { new: true, runValidators: false }
    ).populate('job');

    if (!updatedApp) {
      return res.status(404).json({ message: "Application not found in Database" });
    }

    console.log("SUCCESSFULLY SAVED TO DB:", updatedApp);

    return res.status(200).json({
      success: true,
      message: "Interview scheduled permanently in DB",
      application: updatedApp
    });
  } catch (error) {
    console.error("Error scheduling interview in database:", error);
    return res.status(500).json({ message: "Server error scheduling interview" });
  }
});

module.exports = router;