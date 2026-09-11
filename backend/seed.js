const mongoose = require('mongoose');
require('dotenv').config();

// Job/Opportunity Schema Schema inline check
const opportunitySchema = new mongoose.Schema({
  title: String,
  companyName: String,
  type: String,
  experienceLevel: String,
  location: String,
  domain: String,
  skills: [String],
  deadline: String,
  description: String,
  postedBy: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now }
});

const Opportunity = mongoose.models.Opportunity || mongoose.model('Opportunity', opportunitySchema);

const sampleData = [
  {
    title: 'Frontend Developer Intern',
    companyName: 'TechCorp Solutions',
    type: 'Internship',
    experienceLevel: 'Fresher',
    location: 'Remote / Bangalore',
    domain: 'Computer Science / IT (B.Tech, BCA, MCA)',
    skills: ['React', 'JavaScript', 'HTML/CSS', 'Tailwind'],
    deadline: '2026-10-30',
    description: 'Work on building responsive UI components using React and Web APIs.'
  },
  {
    title: 'Backend Node.js Developer',
    companyName: 'CloudScale Systems',
    type: 'Job',
    experienceLevel: '0-1 Years',
    location: 'Pune / Hybrid',
    domain: 'Software Engineering (B.Tech / MCA)',
    skills: ['Node.js', 'Express.js', 'MongoDB', 'REST APIs'],
    deadline: '2026-11-15',
    description: 'Design and manage scalable backend microservices and databases.'
  },
  {
    title: 'Management Trainee - HR & Operations',
    companyName: 'GrowthX Pvt Ltd',
    type: 'Job',
    experienceLevel: 'Fresher',
    location: 'Delhi NCR',
    domain: 'Management / HR (MBA, BBA)',
    skills: ['Communication', 'Talent Acquisition', 'MS Excel', 'HR Analytics'],
    deadline: '2026-10-25',
    description: 'Coordinate recruitment drives, employee onboarding, and internal operations.'
  },
  {
    title: 'Data Analyst Intern',
    companyName: 'Analytics Edge',
    type: 'Internship',
    experienceLevel: 'Fresher',
    location: 'Remote',
    domain: 'Data Science / Commerce (B.Sc, B.Com, B.Tech)',
    skills: ['Python', 'SQL', 'Power BI', 'Excel'],
    deadline: '2026-10-20',
    description: 'Analyze client datasets, create dashboards, and deliver actionable insights.'
  },
  {
    title: 'Mechanical Design Engineer Trainee',
    companyName: 'AutoTech Dynamics',
    type: 'Job',
    experienceLevel: 'Fresher',
    location: 'Ahmedabad / On-site',
    domain: 'Mechanical / Automobile Engineering (B.E / B.Tech)',
    skills: ['AutoCAD', 'SolidWorks', 'ANSYS', 'GD&T'],
    deadline: '2026-11-05',
    description: 'Design mechanical components, draft 3D models, and perform structural testing.'
  },
  {
    title: 'Digital Marketing Specialist',
    companyName: 'Nexus Media',
    type: 'Job',
    experienceLevel: '0-2 Years',
    location: 'Mumbai',
    domain: 'Marketing / Media (B.Com, BBA, BA)',
    skills: ['SEO', 'Google Ads', 'Content Creation', 'Social Media'],
    deadline: '2026-10-28',
    description: 'Manage paid advertising campaigns and boost organic reach across social channels.'
  }
];

const seedDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobportal';
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // Delete duplicates if needed and re-insert fresh sample data
    await Opportunity.deleteMany({});
    await Opportunity.insertMany(sampleData);

    console.log('✅ Real Opportunities & Jobs Seeded Successfully!');
    process.exit();
  } catch (err) {
    console.error('❌ Seeding Failed:', err);
    process.exit(1);
  }
};

seedDB();