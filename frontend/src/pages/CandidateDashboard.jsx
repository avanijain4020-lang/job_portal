import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CandidateDashboard = () => {
  // State Management
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'applications'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals Control
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Application Form State - Matched with applicationSchema
  const [applicantData, setApplicantData] = useState({
    applicantName: '',
    applicantEmail: '',
    degree: '',
    college: '',
    experienceYears: 'Fresher',
    linkedinUrl: '',
    githubUrl: '',
    coverNote: '',
    resumeLink: ''
  });

  // Fetch Jobs & Candidate Applications
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('jwt');
      const headers = { Authorization: token ? `Bearer ${token}` : '' };

      // 1. Fetch Job Listings
      const jobRes = await axios.get('http://localhost:5000/api/jobs').catch(() => null);
      if (jobRes && jobRes.data) {
        let jobsData = jobRes.data;
        if (!Array.isArray(jobsData)) jobsData = jobsData.jobs || jobsData.data || [];
        setJobs(Array.isArray(jobsData) ? jobsData : []);
      }

      // 2. Fetch User's Applications (Including Interview Updates)
      const appRes = await axios.get('http://localhost:5000/api/applications/my-applications', { headers }).catch(() => null);
      if (appRes && appRes.data) {
        let appData = appRes.data;
        if (!Array.isArray(appData)) appData = appData.applications || appData.data || [];
        setMyApplications(Array.isArray(appData) ? appData : []);
      } else {
        // LocalStorage Fallback
        const localApps = JSON.parse(localStorage.getItem('myApplications') || '[]');
        setMyApplications(localApps);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-fill candidate profile details
    const savedProfile = JSON.parse(localStorage.getItem('candidateProfile') || '{}');
    if (savedProfile) {
      setApplicantData((prev) => ({
        ...prev,
        applicantName: savedProfile.fullName || savedProfile.name || '',
        applicantEmail: savedProfile.email || '',
        degree: savedProfile.degree || '',
        college: savedProfile.college || '',
        linkedinUrl: savedProfile.linkedinUrl || '',
        githubUrl: savedProfile.githubUrl || ''
      }));
    }
  }, []);

  // Filter Jobs based on Search & Category
  const filteredJobs = jobs.filter((job) => {
    const title = (job.title || '').toLowerCase();
    const company = (job.company || '').toLowerCase();
    const matchesSearch = title.includes(searchTerm.toLowerCase()) || company.includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || job.type === selectedCategory || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle Application Submit
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    const token = localStorage.getItem('token') || localStorage.getItem('jwt');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const applicationPayload = {
      job: selectedJob._id,
      applicant: user._id || user.id,
      applicantName: applicantData.applicantName,
      applicantEmail: applicantData.applicantEmail,
      degree: applicantData.degree,
      college: applicantData.college,
      experienceYears: applicantData.experienceYears,
      linkedinUrl: applicantData.linkedinUrl,
      githubUrl: applicantData.githubUrl,
      coverNote: applicantData.coverNote,
      resumeLink: applicantData.resumeLink,
      jobTitle: selectedJob.title,
      company: selectedJob.company,
      status: 'Pending'
    };

    try {
      const res = await axios.post('http://localhost:5000/api/applications', applicationPayload, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      
      const newApp = res.data?.application || applicationPayload;
      setMyApplications((prev) => [newApp, ...prev]);
      alert(`Application submitted successfully for ${selectedJob.title}!`);
    } catch (err) {
      console.error('API submit failed, saving locally:', err);
      const localApps = JSON.parse(localStorage.getItem('myApplications') || '[]');
      const savedApp = { ...applicationPayload, createdAt: new Date().toISOString() };
      localStorage.setItem('myApplications', JSON.stringify([...localApps, savedApp]));
      setMyApplications((prev) => [savedApp, ...prev]);
      alert(`Application saved offline for ${selectedJob.title}!`);
    } finally {
      setSelectedJob(null);
      setApplicantData((prev) => ({ ...prev, coverNote: '', resumeLink: '' }));
    }
  };

  // Helper function to render Status Badges
  const renderStatusBadge = (status, date, time) => {
    if (status === 'Interview Scheduled') {
      return (
        <div style={{ backgroundColor: '#1e1b4b', border: '1px solid #6366f1', padding: '8px 12px', borderRadius: '8px', textAlign: 'right' }}>
          <span style={{ backgroundColor: '#4f46e5', color: '#ffffff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-block' }}>
            📅 Interview Scheduled
          </span>
          {(date || time) && (
            <p style={{ margin: '6px 0 0 0', color: '#a5b4fc', fontSize: '0.8rem', fontWeight: '500' }}>
              {date && `Date: ${date}`} {time && `| Time: ${time}`}
            </p>
          )}
        </div>
      );
    }

    const badgeColors = {
      Accepted: { bg: '#14532d', color: '#4ade80' },
      Rejected: { bg: '#7f1d1d', color: '#f87171' },
      Pending: { bg: '#1e293b', color: '#cbd5e1' }
    };

    const style = badgeColors[status] || badgeColors.Pending;

    return (
      <span style={{ backgroundColor: style.bg, color: style.color, padding: '6px 14px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>
        {status || 'Pending'}
      </span>
    );
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', padding: '2rem 1.5rem', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      
      {/* HEADER & TAB NAVIGATION */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 2rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', margin: 0, color: '#38bdf8' }}>Candidate Portal</h1>
            <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Explore opportunities and track your interview schedules.</p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#0f172a', padding: '4px', borderRadius: '10px', border: '1px solid #1e293b' }}>
            <button
              onClick={() => setActiveTab('browse')}
              style={{ ...tabButtonStyle, backgroundColor: activeTab === 'browse' ? '#2563eb' : 'transparent', color: activeTab === 'browse' ? '#fff' : '#94a3b8' }}
            >
              🔍 Find Jobs
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              style={{ ...tabButtonStyle, backgroundColor: activeTab === 'applications' ? '#2563eb' : 'transparent', color: activeTab === 'applications' ? '#fff' : '#94a3b8' }}
            >
              📑 My Applications ({myApplications.length})
            </button>
          </div>
        </div>

        {/* SEARCH & FILTER BAR (FOR BROWSE TAB) */}
        {activeTab === 'browse' && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by job title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={inputStyle}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ ...inputStyle, width: '180px' }}
            >
              <option value="All">All Types</option>
              <option value="Internship">Internship</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: JOB LISTINGS */}
      {activeTab === 'browse' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {loading ? (
            <p style={{ color: '#94a3b8' }}>Loading opportunities...</p>
          ) : filteredJobs.length === 0 ? (
            <div style={emptyCardStyle}>
              No jobs match your search preferences.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {filteredJobs.map((job) => (
                <div key={job._id || job.id} style={jobCardStyle}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.2rem' }}>{job.title}</h3>
                      <span style={{ backgroundColor: '#1e3a8a', color: '#93c5fd', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {job.type || 'Internship'}
                      </span>
                    </div>
                    <p style={{ color: '#38bdf8', margin: '0.4rem 0 0 0', fontWeight: 'bold' }}>{job.company}</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.3rem 0 1rem 0' }}>📍 {job.location || 'Remote'} | 💰 {job.salary || 'Best in Industry'}</p>
                    <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.4', marginBottom: '1rem' }}>
                      {job.description ? `${job.description.substring(0, 100)}...` : 'No details provided.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedJob(job)}
                    style={{ width: '100%', backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY APPLICATIONS & INTERVIEW SCHEDULES */}
      {activeTab === 'applications' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#38bdf8', marginBottom: '1rem' }}>My Applications</h2>
          {myApplications.length === 0 ? (
            <div style={emptyCardStyle}>
              You haven't applied to any roles yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myApplications.map((app, index) => (
                <div key={app._id || index} style={{ ...jobCardStyle, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>
                      {app.jobTitle || app.job?.title || 'Applied Position'}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                      🏢 {app.company || app.job?.company || 'Company'}
                    </p>
                    {app.createdAt && (
                      <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.75rem' }}>
                        Applied on: {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div>
                    {renderStatusBadge(app.status, app.interviewDate, app.interviewTime)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FLOATING INSTRUCTION BUTTON */}
      <button
        onClick={() => setShowInstructions(true)}
        style={floatingButtonStyle}
      >
        💡 How to Use
      </button>

      {/* INSTRUCTION POPUP MODAL */}
      {showInstructions && (
        <div style={modalOverlayStyle}>
          <div style={modalCardStyle}>
            <h2 style={{ marginTop: 0, color: '#38bdf8' }}>📖 Candidate Instructions</h2>
            <ul style={{ lineHeight: '1.8', paddingLeft: '20px', color: '#cbd5e1' }}>
              <li><strong>Search Roles:</strong> Top search bar me role, company ya domain type karke jobs dhoondhein.</li>
              <li><strong>Explore Opportunities:</strong> Available jobs aur internships ke cards view karein.</li>
              <li><strong>Apply Now:</strong> Interested job card par <em>"Apply Now"</em> click karke details fill karein.</li>
              <li><strong>Track Applications:</strong> Top navigation bar se <em>"My Applications"</em> par jaakar interview schedule aur status check karein.</li>
            </ul>
            <button onClick={() => setShowInstructions(false)} style={submitButtonStyle}>
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* JOB APPLICATION MODAL */}
      {selectedJob && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalCardStyle, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#38bdf8' }}>Apply for {selectedJob.title}</h3>
              <button onClick={() => setSelectedJob(null)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            
            <form onSubmit={handleApplySubmit} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={gridRowStyle}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input required type="text" value={applicantData.applicantName} onChange={(e) => setApplicantData({ ...applicantData, applicantName: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input required type="email" value={applicantData.applicantEmail} onChange={(e) => setApplicantData({ ...applicantData, applicantEmail: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div style={gridRowStyle}>
                <div>
                  <label style={labelStyle}>Degree *</label>
                  <input required type="text" placeholder="e.g. B.Tech / B.Sc" value={applicantData.degree} onChange={(e) => setApplicantData({ ...applicantData, degree: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>College / University *</label>
                  <input required type="text" placeholder="College Name" value={applicantData.college} onChange={(e) => setApplicantData({ ...applicantData, college: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div style={gridRowStyle}>
                <div>
                  <label style={labelStyle}>Experience</label>
                  <select value={applicantData.experienceYears} onChange={(e) => setApplicantData({ ...applicantData, experienceYears: e.target.value })} style={inputStyle}>
                    <option value="Fresher">Fresher</option>
                    <option value="0-1 Years">0-1 Years</option>
                    <option value="1-3 Years">1-3 Years</option>
                    <option value="3+ Years">3+ Years</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Resume Link (Drive/Cloud) *</label>
                  <input required type="url" placeholder="https://..." value={applicantData.resumeLink} onChange={(e) => setApplicantData({ ...applicantData, resumeLink: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div style={gridRowStyle}>
                <div>
                  <label style={labelStyle}>LinkedIn URL</label>
                  <input type="url" placeholder="https://linkedin.com/in/..." value={applicantData.linkedinUrl} onChange={(e) => setApplicantData({ ...applicantData, linkedinUrl: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>GitHub / Portfolio URL</label>
                  <input type="url" placeholder="https://github.com/..." value={applicantData.githubUrl} onChange={(e) => setApplicantData({ ...applicantData, githubUrl: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Cover Note</label>
                <textarea rows="3" placeholder="Brief statement about your interest in this job..." value={applicantData.coverNote} onChange={(e) => setApplicantData({ ...applicantData, coverNote: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }}></textarea>
              </div>

              <button type="submit" style={submitButtonStyle}>
                Submit Application
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Styles
const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '0.85rem',
  outline: 'none',
  boxSizing: 'border-box'
};

const gridRowStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0.8rem'
};

const labelStyle = {
  fontSize: '0.8rem',
  color: '#cbd5e1',
  marginBottom: '0.3rem',
  display: 'block'
};

const tabButtonStyle = {
  padding: '8px 16px',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '0.9rem',
  transition: '0.2s'
};

const jobCardStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '12px',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};

const emptyCardStyle = {
  backgroundColor: '#0f172a',
  padding: '3rem',
  borderRadius: '12px',
  border: '1px solid #1e293b',
  textAlign: 'center',
  color: '#94a3b8'
};

const floatingButtonStyle = {
  position: 'fixed',
  bottom: '25px',
  right: '25px',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '50px',
  padding: '12px 22px',
  fontSize: '0.95rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 2000
};

const modalCardStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '12px',
  padding: '1.8rem',
  maxWidth: '580px',
  width: '90%',
  color: '#f8fafc',
  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
};

const submitButtonStyle = {
  marginTop: '0.8rem',
  width: '100%',
  padding: '11px',
  backgroundColor: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

export default CandidateDashboard;