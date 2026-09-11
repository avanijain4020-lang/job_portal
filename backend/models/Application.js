const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Opportunity', 
      required: true 
    },
    applicant: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    applicantName: { 
      type: String, 
      required: true 
    },
    applicantEmail: { 
      type: String, 
      required: true 
    },
    degree: { 
      type: String, 
      required: true 
    },
    college: { 
      type: String, 
      required: true 
    },
    experienceYears: { 
      type: String, 
      default: 'Fresher' 
    },
    linkedinUrl: { 
      type: String 
    },
    githubUrl: { 
      type: String 
    },
    coverNote: { 
      type: String 
    },
    resumeLink: { 
      type: String, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['Pending', 'Applied', 'Interview Scheduled', 'Accepted', 'Rejected'],
      default: 'Pending' 
    },
    
    // PERMANENT STORAGE FOR SCHEDULED INTERVIEW
    interviewDate: { 
      type: String, 
      default: '' 
    },
    interviewTime: { 
      type: String, 
      default: '' 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Application || mongoose.model('Application', applicationSchema);