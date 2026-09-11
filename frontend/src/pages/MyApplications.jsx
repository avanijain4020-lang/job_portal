import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Inline Application Progress Tracker Component
const ApplicationTimeline = ({ status, interviewDate, interviewTime }) => {
  const steps = [
    { label: 'Applied', key: 'Applied' },
    { label: 'Reviewed', key: 'Reviewed' },
    { label: 'Interview', key: 'Interview Scheduled' },
    { label: 'Decision', key: 'Accepted' }
  ];

  const getStepStatus = (index) => {
    if (status === 'Rejected') {
      if (index === 3) return 'rejected';
      return 'completed';
    }

    const statusHierarchy = ['Applied', 'Reviewed', 'Interview Scheduled', 'Accepted', 'Shortlisted'];
    const currentIndex = statusHierarchy.indexOf(status);

    if (currentIndex >= index || (status === 'Shortlisted' && index === 3)) {
      return 'completed';
    }
    return 'pending';
  };

  return (
    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #1e293b' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        {steps.map((step, index) => {
          const stepState = getStepStatus(index);
          const isCompleted = stepState === 'completed';
          const isRejected = stepState === 'rejected';

          return (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
              
              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '14px',
                    left: '50%',
                    width: '100%',
                    height: '3px',
                    backgroundColor: isCompleted ? '#3b82f6' : '#334155',
                    zIndex: 1,
                    transition: 'all 0.3s ease'
                  }}
                />
              )}

              {/* Node Circle */}
              <div 
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: isCompleted ? '#2563eb' : isRejected ? '#ef4444' : '#1e293b',
                  border: `2px solid ${isCompleted ? '#60a5fa' : isRejected ? '#f87171' : '#475569'}`,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  zIndex: 2,
                  transition: 'all 0.3s ease'
                }}
              >
                {isCompleted ? '✓' : isRejected ? '✕' : index + 1}
              </div>

              {/* Step Label */}
              <span 
                style={{
                  marginTop: '6px',
                  fontSize: '0.75rem',
                  color: isCompleted ? '#60a5fa' : isRejected ? '#f87171' : '#94a3b8',
                  fontWeight: isCompleted || isRejected ? '600' : 'normal'
                }}
              >
                {index === 3 && status === 'Rejected' ? 'Rejected' : step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scheduled Interview Banner */}
      {(status === 'Interview Scheduled' || interviewDate) && (
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e3a8a',
          borderLeft: '4px solid #3b82f6',
          borderRadius: '6px',
          padding: '0.8rem 1rem',
          marginTop: '1rem'
        }}>
          <h4 style={{ margin: '0 0 0.3rem 0', color: '#60a5fa', fontSize: '0.9rem' }}>
            📅 Scheduled Interview Details
          </h4>
          <div style={{ display: 'flex', gap: '1.5rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
            <p style={{ margin: 0 }}><strong>Date:</strong> {interviewDate || 'To be updated'}</p>
            <p style={{ margin: 0 }}><strong>Time:</strong> {interviewTime || 'To be updated'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem('token') || localStorage.getItem('jwt');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id || user._id;

        // Candidate Specific URL Attempt
        const targetUrl = userId 
          ? `http://localhost:5000/api/applications/user/${userId}`
          : 'http://localhost:5000/api/applications/my-applications';

        const res = await axios.get(targetUrl, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'user-id': userId || ''
          }
        }).catch(async () => {
          // General Endpoint Fallback
          return await axios.get('http://localhost:5000/api/applications', {
            headers: { Authorization: token ? `Bearer ${token}` : '' }
          });
        });

        console.log('--- DEBUG BACKEND RESPONSE ---', res.data);

        let data = res.data;

        // Unwrapping nested object structures
        if (data && !Array.isArray(data)) {
          data = data.applications || data.data || data.myApplications || [];
        }

        if (Array.isArray(data)) {
          // Filter applications for current candidate if backend returns all
          if (userId && data.length > 0 && (data[0].candidate || data[0].applicant)) {
            const filtered = data.filter(
              item => (item.candidate?._id || item.candidate || item.applicant?._id || item.applicant) === userId
            );
            setApplications(filtered.length > 0 ? filtered : data);
          } else {
            setApplications(data);
          }
        }
      } catch (err) {
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Accepted':
        return { backgroundColor: '#14532d', color: '#4ade80' };
      case 'Rejected':
        return { backgroundColor: '#7f1d1d', color: '#f87171' };
      case 'Interview Scheduled':
        return { backgroundColor: '#1e3a8a', color: '#60a5fa' };
      case 'Reviewed':
        return { backgroundColor: '#1e40af', color: '#93c5fd' };
      default:
        return { backgroundColor: '#854d0e', color: '#fef08a' };
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem', color: '#fff', position: 'relative', minHeight: '80vh' }}>
      
      {/* FLOATING INSTRUCTION BUTTON */}
      <button
        onClick={() => setShowInstructions(true)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          border: '2px solid #60a5fa',
          borderRadius: '50px',
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        💡 How to Use
      </button>

      {/* INSTRUCTION POPUP MODAL */}
      {showInstructions && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            color: '#f8fafc',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ marginTop: 0, color: '#38bdf8' }}>📖 How to Track Applications</h2>
            <ul style={{ lineHeight: '1.8', paddingLeft: '20px', color: '#cbd5e1' }}>
              <li><strong>Applied Roles:</strong> All your submitted job applications will appear here.</li>
              <li><strong>Real-time Status:</strong> Track application stage (<em>Applied, Reviewed, Interview Scheduled, Accepted, Rejected</em>).</li>
              <li><strong>Scheduled Interviews:</strong> View interview dates and times directly on your application card.</li>
            </ul>
            <button
              onClick={() => setShowInstructions(false)}
              style={{
                marginTop: '1.5rem',
                width: '100%',
                padding: '10px',
                backgroundColor: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* PAGE HEADER */}
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>My Applications</h1>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Track all your applied positions and interview schedules here.</p>
      </div>

      {/* APPLICATION LIST */}
      {loading ? (
        <p style={{ color: '#94a3b8' }}>Loading applications...</p>
      ) : applications.length === 0 ? (
        <div style={{ backgroundColor: '#0f172a', padding: '3rem', borderRadius: '12px', border: '1px solid #1e293b', textAlign: 'center', color: '#94a3b8' }}>
          No applications found. Apply to opportunities from your candidate dashboard!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {applications.map((app, index) => {
            return (
              <div 
                key={app._id || index} 
                style={{ 
                  backgroundColor: '#0f172a', 
                  border: '1px solid #1e293b', 
                  borderRadius: '10px', 
                  padding: '1.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.8rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.4rem 0', color: '#38bdf8', fontSize: '1.2rem' }}>
                      {app.job?.title || app.jobTitle || app.title || 'Applied Position'}
                    </h3>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
                      🏢 {app.job?.company || app.companyName || app.company || 'Company Name'}
                    </p>
                  </div>
                  <span style={{ padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', ...getStatusBadge(app.status) }}>
                    {app.status || 'Applied'}
                  </span>
                </div>

                {/* VISUAL TIMELINE TRACKER */}
                <ApplicationTimeline 
                  status={app.status || 'Applied'} 
                  interviewDate={app.interviewDate} 
                  interviewTime={app.interviewTime} 
                />

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplications;