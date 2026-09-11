const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    companyName: { type: String, required: true },
    location: { type: String, required: true },
    experience: { type: String, required: true },
    domain: { type: String, required: true },
    type: { type: String, default: 'Full-Time' },
    skills: { type: [String], required: true },
    postedBy: { type: String } // Flexible string or ObjectId
  },
  { timestamps: true }
);

module.exports = mongoose.model('Opportunity', opportunitySchema);