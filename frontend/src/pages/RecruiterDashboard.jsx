import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Resume / Preferences Modal State
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedCandidateName, setSelectedCandidateName] = useState('');

  // Interview Schedule State
  const [interviewApp, setInterviewApp] = useState(null);
  const [interviewDetails, setInterviewDetails] = useState({ date: '', time: '', link: '' });

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    type: 'Internship',
    experience: 'Fresher',
    location: '',
    category: '',
    salary: '',
    duration: '',
    skills: '',
    deadline: '',
    description: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('jwt');

      // 1. Fetch Jobs
      const jobsRes = await axios.get('http://localhost:5000/api/jobs').catch(() => null);
      if (jobsRes && jobsRes.data) {
        let jobsData = jobsRes.data;
        if (!Array.isArray(jobsData)) jobsData = jobsData.jobs || jobsData.data || [];
        setJobs(Array.isArray(jobsData) ? jobsData : []);
      }

      // 2. Fetch Applications
      let appsData = [];
      try {
        const res = await axios.get('http://localhost:5000/api/applications', {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        appsData = res.data;
      } catch (err) {
        const fallbackRes = await axios.get('http://localhost:5000/api/applications/all');
        appsData = fallbackRes.data;
      }

      if (appsData && !Array.isArray(appsData)) {
        appsData = appsData.applications || appsData.data || appsData.myApplications || [];
      }

      if (Array.isArray(appsData)) {
        setApplications(appsData);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || localStorage.getItem('jwt');
    try {
      await axios.post('http://localhost:5000/api/jobs', formData, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      alert('New role posted successfully!');
      setFormData({
        title: '', company: '', type: 'Internship', experience: 'Fresher',
        location: '', category: '', salary: '', duration: '', skills: '', deadline: '', description: ''
      });
      fetchData();
    } catch (err) {
      console.error('Error posting role:', err);
      alert('Failed to post role');
    }
  };

  // Delete Job Post Handler
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing?')) return;
    const token = localStorage.getItem('token') || localStorage.getItem('jwt');
    try {
      await axios.delete(`http://localhost:5000/api/jobs/${jobId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      setJobs(prev => prev.filter(j => j._id !== jobId));
      alert('Job post deleted successfully!');
    } catch (err) {
      console.error('Failed to delete job listing:', err);
      alert('Failed to delete job listing.');
    }
  };

  const handleStatusUpdate = async (appId, newStatus) => {
    const token = localStorage.getItem('token') || localStorage.getItem('jwt');

    setApplications(prev =>
      prev.map(app => app._id === appId ? { ...app, status: newStatus } : app)
    );

    try {
      await axios.put(
        `http://localhost:5000/api/applications/${appId}`,
        { status: newStatus },
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      ).catch(async () => {
        return await axios.patch(
          `http://localhost:5000/api/applications/status/${appId}`,
          { status: newStatus },
          { headers: { Authorization: token ? `Bearer ${token}` : '' } }
        );
      });
    } catch (err) {
      console.error('Failed to update status in DB:', err);
      fetchData();
    }
  };

  // UPDATED: Backend API call to update interview details in MongoDB
  const handleScheduleInterviewSubmit = async (e) => {
    e.preventDefault();
    if (!interviewApp) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('jwt');
      
      const res = await axios.put(
        `http://localhost:5000/api/applications/${interviewApp._id}/schedule`,
        { 
          interviewDate: interviewDetails.date, 
          interviewTime: interviewDetails.time 
        },
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );

      if (res.data.success || res.status === 200) {
        alert(`Interview scheduled for ${interviewApp.applicantName || 'Candidate'} on ${interviewDetails.date} at ${interviewDetails.time}!`);
        
        // Update Local State with DB Response Data
        setApplications((prevApps) =>
          prevApps.map((app) =>
            app._id === interviewApp._id
              ? { 
                  ...app, 
                  status: 'Interview Scheduled', 
                  interviewDate: interviewDetails.date, 
                  interviewTime: interviewDetails.time 
                }
              : app
          )
        );

        setInterviewApp(null);
        setInterviewDetails({ date: '', time: '', link: '' });
      }
    } catch (err) {
      console.error('Failed to schedule interview on server:', err);
      alert('Server update failed. Please check backend connection.');
    }
  };

  // View Candidate Details & Preferences Functionality
  const handleViewResume = (app) => {
    const email = app.applicantEmail || app.candidate?.email || app.email;
    const name = app.applicantName || app.candidate?.name || app.name || 'Candidate';

    let profileData = null;
    if (email) {
      profileData = JSON.parse(localStorage.getItem(`candidateProfile_${email}`));
    }

    if (!profileData) {
      profileData = JSON.parse(localStorage.getItem('candidateProfile') || '{}');
    }

    const mergedData = {
      ...profileData,
      preferences: profileData.preferences || app.candidate?.preferences || app.preferences || profileData.resume?.preferences,
      resume: profileData.resume || profileData
    };

    setSelectedCandidateName(name);
    setSelectedResume(mergedData);
  };

  // Filtered Applications Calculation
  const filteredApplications = applications.filter(app => {
    const name = (app.applicantName || app.candidate?.name || app.name || '').toLowerCase();
    const role = (app.job?.title || app.jobTitle || app.title || '').toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || role.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || (app.status || 'Applied') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem', color: '#fff', boxSizing: 'border-box' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 'bold', margin: 0 }}>Employer Dashboard</h1>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
          Post new roles, review candidates, and manage applications.
        </p>
      </div>

      {/* QUICK STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={statCardStyle}>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Active Listings</span>
          <h2 style={{ color: '#38bdf8', margin: '0.3rem 0 0 0', fontSize: '1.8rem' }}>{jobs.length}</h2>
        </div>
        <div style={statCardStyle}>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Applications</span>
          <h2 style={{ color: '#818cf8', margin: '0.3rem 0 0 0', fontSize: '1.8rem' }}>{applications.length}</h2>
        </div>
        <div style={statCardStyle}>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Accepted Candidates</span>
          <h2 style={{ color: '#4ade80', margin: '0.3rem 0 0 0', fontSize: '1.8rem' }}>
            {applications.filter(a => a.status === 'Accepted' || a.status === 'Interview Scheduled').length}
          </h2>
        </div>
        <div style={statCardStyle}>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Pending Review</span>
          <h2 style={{ color: '#facc15', margin: '0.3rem 0 0 0', fontSize: '1.8rem' }}>
            {applications.filter(a => !a.status || a.status === 'Applied' || a.status === 'Pending').length}
          </h2>
        </div>
      </div>

      {/* TOP SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* POST ROLE FORM */}
        <div style={{ backgroundColor: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '1.8rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#38bdf8', marginTop: 0, marginBottom: '1.5rem', fontWeight: 'bold' }}>
            + Post a New Role
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={labelStyle}>Job Title *</label>
              <input required name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Frontend Developer Intern" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Company Name *</label>
              <input required name="company" value={formData.company} onChange={handleChange} placeholder="e.g. TechCorp Solutions" style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Type</label>
                <select name="type" value={formData.type} onChange={handleChange} style={inputStyle}>
                  <option value="Internship">Internship</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Experience Level</label>
                <select name="experience" value={formData.experience} onChange={handleChange} style={inputStyle}>
                  <option value="Fresher">Fresher</option>
                  <option value="1-2 Years">1-2 Years</option>
                  <option value="3+ Years">3+ Years</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Location *</label>
                <input required name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Remote / Bangalore" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Domain / Category</label>
                <input name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Web Development" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Stipend / Salary *</label>
                <input required name="salary" value={formData.salary} onChange={handleChange} placeholder="e.g. ₹15,000 / month" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Duration *</label>
                <input required name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 3 Months / Full-time" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Required Skills (Comma-separated) *</label>
              <input required name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, MongoDB" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Deadline Date</label>
              <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Description *</label>
              <textarea required name="description" rows="3" value={formData.description} onChange={handleChange} placeholder="Role overview & requirements..." style={{ ...inputStyle, resize: 'vertical' }}></textarea>
            </div>

            <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem', fontSize: '1rem' }}>
              Post Role
            </button>
          </form>
        </div>

        {/* ACTIVE LISTINGS */}
        <div>
          <h2 style={{ fontSize: '1.2rem', color: '#fff', marginTop: 0, marginBottom: '1.5rem', fontWeight: 'bold' }}>
            Your Active Listings
          </h2>
          
          {loading ? (
            <p style={{ color: '#94a3b8' }}>Loading active listings...</p>
          ) : jobs.length === 0 ? (
            <div style={{ backgroundColor: '#0b1329', padding: '3rem', borderRadius: '12px', border: '1px solid #1e293b', textAlign: 'center', color: '#94a3b8' }}>
              No active job listings yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '780px', overflowY: 'auto' }}>
              {jobs.map((job, idx) => (
                <div key={job._id || idx} style={{ backgroundColor: '#0b1329', border: '1px solid #1e293b', borderRadius: '10px', padding: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '1.1rem' }}>{job.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ backgroundColor: '#1e3a8a', color: '#93c5fd', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {job.type || 'Internship'}
                      </span>
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        title="Delete Job Post"
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                    🏢 {job.company || 'Company'} | 📍 {job.location || 'Remote'}
                  </p>
                  <p style={{ margin: '0.3rem 0 0 0', color: '#4ade80', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    💰 {job.salary || job.salaryOrStipend || 'Stipend provided'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* CANDIDATE APPLICATIONS RECEIVED */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: '2rem' }}>
        
        {/* SECTION HEADER & SEARCH / FILTER CONTROL */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#38bdf8', margin: 0, fontWeight: 'bold' }}>
            Candidate Applications Received
          </h2>

          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search candidate or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, width: '220px', padding: '8px 12px' }}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ ...inputStyle, width: '130px', padding: '8px 12px' }}
            >
              <option value="All">All Status</option>
              <option value="Applied">Applied</option>
              <option value="Accepted">Accepted</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading applications...</p>
        ) : filteredApplications.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No matching applications found.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.2rem' }}>
            {filteredApplications.map((app, idx) => {
              const pref = app.candidate?.preferences || app.preferences;

              return (
                <div key={app._id || idx} style={{ backgroundColor: '#0b1329', border: '1px solid #1e293b', borderRadius: '10px', padding: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem', fontWeight: 'bold' }}>
                        {app.applicantName || app.candidate?.name || app.name || 'Candidate Name'}
                      </h3>
                      <p style={{ margin: '0.3rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                        Applied for: <strong style={{ color: '#38bdf8' }}>{app.job?.title || app.jobTitle || app.title || 'Position'}</strong>
                      </p>
                      <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                        📧 {app.applicantEmail || app.candidate?.email || app.email || 'N/A'}
                      </p>
                    </div>

                    {/* STATUS BADGE */}
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      backgroundColor: app.status === 'Accepted' || app.status === 'Interview Scheduled' ? '#14532d' : app.status === 'Rejected' ? '#7f1d1d' : '#1e293b',
                      color: app.status === 'Accepted' || app.status === 'Interview Scheduled' ? '#4ade80' : app.status === 'Rejected' ? '#f87171' : '#cbd5e1'
                    }}>
                      {app.status || 'Applied'}
                    </span>
                  </div>

                  {/* DISPLAY INTERVIEW DETAILS IF SCHEDULED */}
                  {app.interviewDate && (
                    <div style={{ marginTop: '0.8rem', padding: '8px 10px', backgroundColor: '#1e1b4b', borderRadius: '6px', border: '1px solid #4338ca', fontSize: '0.8rem', color: '#a5b4fc' }}>
                      <p style={{ margin: '2px 0' }}>📅 <strong>Interview Date:</strong> {app.interviewDate}</p>
                      <p style={{ margin: '2px 0' }}>⏰ <strong>Interview Time:</strong> {app.interviewTime}</p>
                    </div>
                  )}

                  {/* PREFERENCES IN CARD (If Available) */}
                  {pref && (
                    <div style={{ marginTop: '0.8rem', padding: '8px 10px', backgroundColor: '#172138', borderRadius: '6px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                      <p style={{ margin: '2px 0' }}>🎯 <strong>Preferred Role:</strong> {pref.preferredRole || pref.role || 'N/A'}</p>
                      <p style={{ margin: '2px 0' }}>📍 <strong>Preferred Location:</strong> {pref.preferredLocation || pref.location || 'N/A'}</p>
                      <p style={{ margin: '2px 0' }}>💵 <strong>Expected Stipend:</strong> {pref.expectedSalary || pref.stipend || 'N/A'}</p>
                    </div>
                  )}

                  {/* VIEW RESUME & PREFERENCES BUTTON */}
                  <button
                    onClick={() => handleViewResume(app)}
                    style={{
                      width: '100%',
                      marginTop: '1rem',
                      backgroundColor: '#0284c7',
                      color: '#fff',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.85rem'
                    }}
                  >
                    📄 View Resume & Preferences
                  </button>

                  {/* ACCEPT / REJECT BUTTONS */}
                  <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.6rem' }}>
                    <button
                      onClick={() => handleStatusUpdate(app._id, 'Accepted')}
                      style={{
                        flex: 1,
                        padding: '8px',
                        backgroundColor: app.status === 'Accepted' ? '#15803d' : '#16a34a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      ✓ Accept
                    </button>

                    <button
                      onClick={() => handleStatusUpdate(app._id, 'Rejected')}
                      style={{
                        flex: 1,
                        padding: '8px',
                        backgroundColor: app.status === 'Rejected' ? '#b91c1c' : '#dc2626',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      ✕ Reject
                    </button>
                  </div>

                  {/* SCHEDULE INTERVIEW BUTTON FOR ACCEPTED CANDIDATES */}
                  {(app.status === 'Accepted' || app.status === 'Interview Scheduled') && (
                    <button
                      onClick={() => setInterviewApp(app)}
                      style={{
                        width: '100%',
                        marginTop: '0.6rem',
                        backgroundColor: '#8b5cf6',
                        color: '#fff',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.85rem'
                      }}
                    >
                      📅 {app.status === 'Interview Scheduled' ? 'Reschedule Interview' : 'Schedule Interview'}
                    </button>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SCHEDULE INTERVIEW MODAL */}
      {interviewApp && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#38bdf8' }}>Schedule Interview</h3>
              <button onClick={() => setInterviewApp(null)} style={modalStyles.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleScheduleInterviewSubmit} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Interview Date</label>
                <input required type="date" value={interviewDetails.date} onChange={(e) => setInterviewDetails({ ...interviewDetails, date: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Interview Time</label>
                <input required type="time" value={interviewDetails.time} onChange={(e) => setInterviewDetails({ ...interviewDetails, time: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Meeting Link (Google Meet / Zoom)</label>
                <input required type="url" placeholder="https://meet.google.com/..." value={interviewDetails.link} onChange={(e) => setInterviewDetails({ ...interviewDetails, link: e.target.value })} style={inputStyle} />
              </div>
              <button type="submit" style={{ backgroundColor: '#8b5cf6', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Confirm Schedule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RESUME & PREFERENCES MODAL */}
      {selectedResume && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
              <h2 style={{ margin: 0, color: '#38bdf8' }}>{selectedCandidateName}'s Profile</h2>
              <button onClick={() => setSelectedResume(null)} style={modalStyles.closeBtn}>✕ Close</button>
            </div>

            <div style={{ marginTop: '15px' }}>

              {/* CANDIDATE PREFERENCES SECTION */}
              <div style={{ ...modalStyles.section, backgroundColor: '#131e3a', padding: '12px', borderRadius: '8px' }}>
                <h4 style={{ color: '#38bdf8', marginTop: 0, marginBottom: '8px' }}>⚙️ CANDIDATE PREFERENCES</h4>
                {selectedResume.preferences ? (
                  <div style={{ fontSize: '0.9rem', color: '#e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div><strong>Preferred Role:</strong> {selectedResume.preferences.preferredRole || selectedResume.preferences.role || 'N/A'}</div>
                    <div><strong>Job Type:</strong> {selectedResume.preferences.jobType || selectedResume.preferences.type || 'N/A'}</div>
                    <div><strong>Preferred Location:</strong> {selectedResume.preferences.preferredLocation || selectedResume.preferences.location || 'N/A'}</div>
                    <div><strong>Expected Salary/Stipend:</strong> {selectedResume.preferences.expectedSalary || selectedResume.preferences.stipend || 'N/A'}</div>
                    <div><strong>Availability:</strong> {selectedResume.preferences.availability || 'Immediate'}</div>
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>No candidate preferences specified.</p>
                )}
              </div>

              {/* PERSONAL INFO */}
              {selectedResume.resume?.personalInfo && (
                <div style={modalStyles.section}>
                  <p style={{ margin: '4px 0' }}><strong>Email:</strong> {selectedResume.resume.personalInfo.email}</p>
                  <p style={{ margin: '4px 0' }}><strong>Phone:</strong> {selectedResume.resume.personalInfo.phone}</p>
                  <p style={{ margin: '4px 0' }}><strong>City:</strong> {selectedResume.resume.personalInfo.city}</p>
                </div>
              )}

              {/* OBJECTIVE */}
              {selectedResume.resume?.objective && (
                <div style={modalStyles.section}>
                  <h4 style={{ color: '#cbd5e1', marginBottom: '5px' }}>CAREER OBJECTIVE</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>{selectedResume.resume.objective}</p>
                </div>
              )}

              {/* EDUCATION */}
              {selectedResume.resume?.education?.length > 0 && (
                <div style={modalStyles.section}>
                  <h4 style={{ color: '#cbd5e1', marginBottom: '5px' }}>EDUCATION</h4>
                  {selectedResume.resume.education.map((edu, idx) => (
                    <p key={idx} style={{ margin: '4px 0', fontSize: '0.9rem' }}>
                      • <strong>{edu.degree || edu.level}</strong> - {edu.schoolOrCollege} ({edu.years}) {edu.score ? `| ${edu.score}` : ''}
                    </p>
                  ))}
                </div>
              )}

              {/* WORK EXPERIENCE */}
              {selectedResume.resume?.workExperience?.length > 0 && (
                <div style={modalStyles.section}>
                  <h4 style={{ color: '#cbd5e1', marginBottom: '5px' }}>WORK EXPERIENCE</h4>
                  {selectedResume.resume.workExperience.map((exp, idx) => (
                    <div key={idx} style={{ marginBottom: '8px' }}>
                      <p style={{ margin: 0 }}><strong>{exp.role}</strong> at {exp.company} ({exp.duration})</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>{exp.details}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* SKILLS */}
              {selectedResume.resume?.skills?.length > 0 && (
                <div style={modalStyles.section}>
                  <h4 style={{ color: '#cbd5e1', marginBottom: '8px' }}>SKILLS</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedResume.resume.skills.map((s, idx) => (
                      <span key={idx} style={modalStyles.skillTag}>{s.name || s}</span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const labelStyle = {
  fontSize: '0.85rem',
  color: '#cbd5e1',
  marginBottom: '0.3rem',
  display: 'block'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  backgroundColor: '#172138',
  border: '1px solid #283552',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
  outline: 'none'
};

const statCardStyle = {
  backgroundColor: '#0b1329',
  border: '1px solid #1e293b',
  borderRadius: '10px',
  padding: '1.2rem'
};

const modalStyles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#0f172a', color: '#fff', padding: '20px', borderRadius: '10px', width: '550px', maxHeight: '80vh', overflowY: 'auto', border: '1px solid #1e293b' },
  section: { borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px' },
  closeBtn: { background: '#ef4444', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  skillTag: { backgroundColor: '#0284c7', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem' }
};

export default RecruiterDashboard;