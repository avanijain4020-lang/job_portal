import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CandidateApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/applications/my-applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data?.applications || res.data || [];
      setApplications(data);
    } catch (err) {
      console.error("Error loading applications:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading applications...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>My Applications</h2>
      {applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        applications.map((app) => {
          const jobDetails = app.job || app.jobId || {};
          const isScheduled = app.status === 'Interview Scheduled' || app.interviewDate;

          return (
            <div 
              key={app._id} 
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
                backgroundColor: '#fff'
              }}
            >
              <h3>{jobDetails.title || jobDetails.role || 'Applied Job'}</h3>
              <p><strong>Company:</strong> {jobDetails.company || 'N/A'}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span style={{ 
                  fontWeight: 'bold', 
                  color: app.status === 'Interview Scheduled' ? '#2563eb' : '#333' 
                }}>
                  {app.status}
                </span>
              </p>

              {/* SCHEDULED INTERVIEW BLOCK */}
              {isScheduled && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#eff6ff',
                  borderLeft: '4px solid #2563eb',
                  borderRadius: '4px'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#1e40af' }}>📅 Scheduled Interview Details</h4>
                  <p style={{ margin: '4px 0' }}><strong>Date:</strong> {app.interviewDate || 'N/A'}</p>
                  <p style={{ margin: '4px 0' }}><strong>Time:</strong> {app.interviewTime || 'N/A'}</p>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default CandidateApplications;