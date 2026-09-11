require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  credentials: true
}));

// Static folder for uploaded resumes
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobportal';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// ==========================================
// MULTER FILE UPLOAD SETUP FOR RESUME (PDF)
// ==========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const cleanFileName = file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueSuffix + '-' + cleanFileName);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ==========================================
// NODEMAILER TRANSPORTER SETUP
// ==========================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email Transporter Error:', error.message);
  } else {
    console.log('✅ Email Transporter Ready to Send Mails!');
  }
});

const sendScheduleEmail = async (candidateEmail, candidateName, jobTitle, companyName, date, time) => {
  if (!candidateEmail) {
    console.error('❌ Cannot send email: Candidate email missing');
    return;
  }

  const mailOptions = {
    from: `"Job Portal" <${process.env.EMAIL_USER}>`,
    to: candidateEmail,
    subject: `Interview Scheduled - ${jobTitle || 'Job Opportunity'} at ${companyName || 'Company'}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0284c7;">Hello ${candidateName || 'Candidate'},</h2>
        <p>Your interview has been successfully scheduled for the <strong>${jobTitle || 'Job Opportunity'}</strong> position at <strong>${companyName || 'Company'}</strong>.</p>
        <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 15px;">📅 <strong>Date:</strong> ${date || 'TBD'}</p>
          <p style="margin: 8px 0 0 0; font-size: 15px;">⏰ <strong>Time:</strong> ${time || 'TBD'}</p>
        </div>
        <p>Please log in to your dashboard to view complete details.</p>
        <br>
        <p style="margin: 0;">Best Regards,</p>
        <p style="margin: 4px 0 0 0;"><strong>${companyName || 'Recruitment Team'}</strong></p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email sent successfully to ${candidateEmail}:`, info.response);
  } catch (err) {
    console.error('❌ Failed to send email:', err.message);
  }
};

// ==========================================
// JWT AUTH MIDDLEWARE
// ==========================================
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
      req.user = decoded;
    } catch (err) {
      console.error('Invalid Token:', err.message);
    }
  }
  next();
};

app.use(authMiddleware);

const getUserId = (req) => {
  return (
    req.headers['user-id'] ||
    req.query.userId ||
    req.user?.id ||
    req.user?._id ||
    null
  );
};

// ==========================================
// SCHEMAS & MODELS
// ==========================================

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['candidate', 'recruiter', 'employer'], default: 'candidate' },
  companyName: { type: String, default: '' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  type: { type: String, default: 'Internship' },
  experienceLevel: { type: String, default: 'Fresher' },
  location: { type: String, required: true },
  domain: { type: String, default: 'General' },
  salaryOrStipend: { type: String, required: true },
  duration: { type: String, required: true },
  skillsRequired: { type: [String], default: [] },
  deadline: { type: String, default: '' },
  description: { type: String, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicantName: { type: String, required: true },
  applicantEmail: { type: String, required: true },
  phone: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },
  resumeLink: { type: String, required: true },
  coverLetter: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Applied', 'Reviewed', 'Accepted', 'Rejected', 'Interview Scheduled', 'Shortlisted', 'Pending'], 
    default: 'Applied' 
  },
  interviewDate: { type: String, default: '' },
  interviewTime: { type: String, default: '' }
}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role, companyName } = req.body;
    const normalizedEmail = email ? email.trim().toLowerCase() : '';

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Account already exists with this email. Please Sign In.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'candidate',
      companyName: role === 'recruiter' || role === 'employer' ? companyName : ''
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        companyName: newUser.companyName || ''
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email ? email.trim().toLowerCase() : '';

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'User not found with this email. Please Create an Account.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password. Please check your credentials.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName || ''
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ==========================================
// 2. JOBS & INTERNSHIPS ROUTES
// ==========================================

app.post('/api/jobs', async (req, res) => {
  try {
    const { title, company, companyName, type, experienceLevel, location, domain, salaryOrStipend, duration, description, skillsRequired, postedBy } = req.body;
    const finalCompany = company || companyName;

    if (!title || !finalCompany || !location) {
      return res.status(400).json({ message: 'Job Title, Company Name, and Location are required.' });
    }

    const newJob = new Job({
      title,
      company: finalCompany,
      type: type || 'Internship',
      experienceLevel: experienceLevel || 'Fresher',
      location,
      domain: domain || 'General',
      salaryOrStipend: salaryOrStipend || 'Not Disclosed',
      duration: duration || '3 Months',
      description: description || '',
      skillsRequired: skillsRequired || [],
      postedBy: postedBy || req.user?.id || null
    });

    await newJob.save();
    res.status(201).json({ message: 'Opportunity posted successfully!', job: newJob });
  } catch (err) {
    console.error('Job Post Error:', err);
    res.status(500).json({ message: 'Failed to post opportunity', error: err.message });
  }
});

app.get('/api/jobs', async (req, res) => {
  try {
    const { domain, type } = req.query;
    let filter = {};

    if (domain) filter.domain = { $regex: domain, $options: 'i' };
    if (type) filter.type = { $regex: type, $options: 'i' };

    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (err) {
    console.error('Fetch Jobs Error:', err);
    res.status(500).json({ message: 'Error fetching jobs', error: err.message });
  }
});

app.get('/api/jobs/my-jobs', async (req, res) => {
  try {
    const userId = getUserId(req);
    const filter = userId ? { postedBy: userId } : {};
    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (err) {
    console.error('Fetch My Jobs Error:', err);
    res.status(500).json({ message: 'Error fetching my jobs' });
  }
});

// ==========================================
// 3. APPLICATIONS & INTERVIEW ROUTES
// ==========================================

// APPLICATION SUBMISSION (FILE UPLOAD OR URL)
app.post('/api/applications', upload.single('resume'), async (req, res) => {
  try {
    const { jobId, candidateId, applicantName, applicantEmail, phone, linkedin, github, coverLetter, resumeLink: bodyResume } = req.body;
    const finalCandidateId = candidateId || getUserId(req);

    if (!jobId || !finalCandidateId) {
      return res.status(400).json({ message: 'Job ID and Candidate ID are required.' });
    }

    let finalResumeLink = '';
    if (req.file) {
      finalResumeLink = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    } else if (bodyResume) {
      finalResumeLink = bodyResume;
    } else {
      finalResumeLink = 'https://example.com/resume.pdf';
    }

    const newApp = new Application({
      job: jobId,
      candidate: finalCandidateId,
      applicantName: applicantName || req.user?.name || 'Applicant',
      applicantEmail: applicantEmail || req.user?.email || 'email@example.com',
      phone: phone || '',
      linkedin: linkedin || '',
      github: github || '',
      resumeLink: finalResumeLink,
      coverLetter: coverLetter || ''
    });

    await newApp.save();
    res.status(201).json({ message: 'Application submitted successfully!', application: newApp });
  } catch (err) {
    console.error('Application Error:', err);
    res.status(500).json({ message: 'Error submitting application', error: err.message });
  }
});

const handleGetCandidateApplications = async (req, res) => {
  try {
    const userId = getUserId(req) || req.params.userId;
    if (!userId) return res.status(200).json([]);

    const apps = await Application.find({ candidate: userId })
      .populate('job')
      .sort({ createdAt: -1 });

    res.status(200).json(apps);
  } catch (err) {
    console.error('Fetch Candidate Applications Error:', err);
    res.status(500).json({ message: 'Error fetching applications' });
  }
};

app.get('/api/applications/user/:userId', handleGetCandidateApplications);
app.get('/api/applications/candidate-applications', handleGetCandidateApplications);
app.get('/api/applications/my-applications', handleGetCandidateApplications);
app.get('/api/candidate-applications', handleGetCandidateApplications);

app.get('/api/applications', async (req, res) => {
  try {
    const apps = await Application.find()
      .populate('job')
      .populate('candidate', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(apps);
  } catch (err) {
    console.error('Fetch All Applications Error:', err);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

app.get('/api/applications/job/:jobId', async (req, res) => {
  try {
    const apps = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(apps);
  } catch (err) {
    console.error('Fetch Job Applications Error:', err);
    res.status(500).json({ message: 'Error fetching applications for job' });
  }
});

// SCHEDULE INTERVIEW ROUTE
const handleScheduleInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { interviewDate, interviewTime } = req.body;

    if (!interviewDate || !interviewTime) {
      return res.status(400).json({ message: 'Date and Time are required' });
    }

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
    ).populate('job').populate('candidate');

    if (!updatedApp) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const candidateEmail = updatedApp.applicantEmail || updatedApp.candidate?.email;

    sendScheduleEmail(
      candidateEmail,
      updatedApp.applicantName || updatedApp.candidate?.name,
      updatedApp.job?.title || 'Job Opportunity',
      updatedApp.job?.company || 'Company',
      interviewDate,
      interviewTime
    );

    return res.status(200).json({
      success: true,
      message: 'Interview scheduled and email notification sent successfully',
      application: updatedApp
    });
  } catch (err) {
    console.error('Schedule Interview Error:', err);
    return res.status(500).json({ message: 'Server error scheduling interview', error: err.message });
  }
};

app.put('/api/applications/:id/schedule', handleScheduleInterview);
app.post('/api/applications/:id/schedule', handleScheduleInterview);

// GENERAL STATUS UPDATE ROUTE
const handleStatusUpdate = async (req, res) => {
  try {
    const { status, interviewDate, interviewTime, date, time } = req.body;

    let updateFields = {};
    if (status) updateFields.status = status;

    const finalDate = interviewDate || date;
    const finalTime = interviewTime || time;

    if (finalDate) updateFields.interviewDate = String(finalDate);
    if (finalTime) updateFields.interviewTime = String(finalTime);

    const updatedApp = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    ).populate('job').populate('candidate');

    if (!updatedApp) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (status === 'Interview Scheduled' || finalDate) {
      const candidateEmail = updatedApp.applicantEmail || updatedApp.candidate?.email;
      sendScheduleEmail(
        candidateEmail,
        updatedApp.applicantName || updatedApp.candidate?.name,
        updatedApp.job?.title,
        updatedApp.job?.company,
        updatedApp.interviewDate,
        updatedApp.interviewTime
      );
    }

    res.status(200).json({ message: `Status updated successfully`, application: updatedApp });
  } catch (err) {
    console.error('Update Status Error:', err);
    res.status(500).json({ message: 'Error updating application status' });
  }
};

app.put('/api/applications/:id', handleStatusUpdate);
app.patch('/api/applications/:id/status', handleStatusUpdate);
app.put('/api/applications/status/:id', handleStatusUpdate);

// ==========================================
// SERVER LISTEN
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
module.exports = app;
});