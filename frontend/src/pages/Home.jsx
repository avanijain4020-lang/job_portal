import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Application Modal States
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [applyMsg, setApplyMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form Fields State
  const [applicantData, setApplicantData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    resumeLink: '',
    coverLetter: ''
  });

  // Guard: Recruiter Redirect & Auto-fill User Data
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'recruiter') {
      navigate('/recruiter-dashboard', { replace: true });
    } else if (user.name) {
      setApplicantData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [navigate]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/jobs');
        if (Array.isArray(res.data)) {
          setOpportunities(res.data);
        } else if (res.data.jobs && Array.isArray(res.data.jobs)) {
          setOpportunities(res.data.jobs);
        } else {
          setOpportunities([]);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setOpportunities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleApplyClick = (job) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setSelectedJob(job);
    setApplyMsg('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setApplyMsg('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const candidateId = user.id || user._id;

    if (!candidateId) {
      setApplyMsg('User session not found. Please log in again.');
      setSubmitting(false);
      return;
    }

    try {
      // Corrected Payload: Match Backend Expectations
      await axios.post('http://localhost:5000/api/applications', {
        jobId: selectedJob._id || selectedJob.id,
        candidateId: candidateId,
        applicantName: applicantData.name,
        applicantEmail: applicantData.email,
        phone: applicantData.phone,
        linkedin: applicantData.linkedin,
        github: applicantData.github,
        resumeLink: applicantData.resumeLink,
        coverLetter: applicantData.coverLetter
      });

      setApplyMsg('Application submitted successfully!');
      setTimeout(() => {
        setShowModal(false);
        setApplicantData((prev) => ({
          ...prev,
          phone: '',
          linkedin: '',
          github: '',
          resumeLink: '',
          coverLetter: ''
        }));
      }, 1500);
    } catch (err) {
      console.error('Application Submission Error:', err.response?.data || err.message);
      setApplyMsg(err.response?.data?.message || 'Failed to submit application. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredJobs = opportunities.filter((job) =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.domain?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b1329', color: '#f8fafc', paddingBottom: '4rem' }}>
      
      {/* Banner Section */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)',
        padding: '4rem 1.5rem',
        textAlign: 'center',
        borderBottom: '1px solid #1e293b'
      }}>
        <h1 style={{ fontSize: '2.8rem', fontWeight: '800', margin: '0 0 0.8rem 0', color: '#ffffff' }}>
          Find Your Dream Role Today
        </h1>
        <p style={{ color: '#bfdbfe', fontSize: '1.1rem', margin: '0 0 2rem 0' }}>
          Explore thousands of internships & tech jobs from top startups.
        </p>

        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <input
            type="text"
            placeholder="Search by role, company, or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem 1.2rem',
              borderRadius: '12px',
              border: '1px solid #3b82f6',
              fontSize: '1rem',
              outline: 'none',
              boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
              backgroundColor: '#ffffff',
              color: '#0f172a'
            }}
          />
        </div>
      </div>

      {/* Jobs Listing */}
      <div style={{ maxWidth: '1100px', margin: '3rem auto 0 auto', padding: '0 1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '1.5rem', color: '#ffffff' }}>
          Available Opportunities
        </h2>

        {loading ? (
          <p style={{ color: '#94a3b8', textAlign: 'center' }}>Loading opportunities...</p>
        ) : filteredJobs.length === 0 ? (
          <div style={{ backgroundColor: '#0f172a', padding: '3rem', borderRadius: '16px', border: '1px solid #1e293b', textAlign: 'center', color: '#94a3b8' }}>
            No opportunities found.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {filteredJobs.map((job) => (
              <div key={job._id || job.id} style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>{job.title}</h3>
                    <span style={{
                      backgroundColor: '#1e3a8a',
                      color: '#93c5fd',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px'
                    }}>
                      {job.type}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.95rem', color: '#60a5fa', fontWeight: '600', margin: '0 0 1rem 0' }}>{job.company}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1.2rem' }}>
                    <span>📍 {job.location}</span>
                    <span>💼 Experience: {job.experienceLevel || job.experience || 'Fresher'}</span>
                    <span>💰 {job.salaryOrStipend}</span>
                  </div>

                  {job.skillsRequired && job.skillsRequired.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                      {job.skillsRequired.map((skill, idx) => (
                        <span key={idx} style={{ backgroundColor: '#1e293b', color: '#94a3b8', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleApplyClick(job)}
                  style={{
                    width: '100%',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.7rem',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Application Form Pop-up Modal */}
      {showModal && selectedJob && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            color: '#fff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Apply for {selectedJob.title}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            {applyMsg && (
              <p style={{ padding: '0.8rem', borderRadius: '8px', backgroundColor: applyMsg.includes('successfully') ? '#166534' : '#991b1b', color: '#fff', textAlign: 'center', fontSize: '0.9rem' }}>
                {applyMsg}
              </p>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={applicantData.name}
                  onChange={(e) => setApplicantData({ ...applicantData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', marginTop: '0.3rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Email *</label>
                <input
                  type="email"
                  required
                  value={applicantData.email}
                  onChange={(e) => setApplicantData({ ...applicantData, email: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', marginTop: '0.3rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  value={applicantData.phone}
                  onChange={(e) => setApplicantData({ ...applicantData, phone: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', marginTop: '0.3rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>LinkedIn Profile URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={applicantData.linkedin}
                  onChange={(e) => setApplicantData({ ...applicantData, linkedin: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', marginTop: '0.3rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>GitHub Profile / Portfolio URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/yourusername"
                  value={applicantData.github}
                  onChange={(e) => setApplicantData({ ...applicantData, github: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', marginTop: '0.3rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Resume Link (Google Drive URL) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/your-resume"
                  value={applicantData.resumeLink}
                  onChange={(e) => setApplicantData({ ...applicantData, resumeLink: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', marginTop: '0.3rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Cover Letter / Why should we hire you?</label>
                <textarea
                  rows="3"
                  placeholder="Briefly describe your skills and experience..."
                  value={applicantData.coverLetter}
                  onChange={(e) => setApplicantData({ ...applicantData, coverLetter: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', marginTop: '0.3rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: 'transparent', color: '#cbd5e1', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 1, padding: '0.7rem', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;