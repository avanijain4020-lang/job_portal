import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApplicantsModal = ({ jobId, jobTitle, onClose }) => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/applications/job/${jobId}`);
        setApplicants(res.data);
      } catch (err) {
        console.error('Error fetching applicants:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplicants();
  }, [jobId]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '16px', width: '600px',
        maxWidth: '90%', maxHeight: '80vh', overflowY: 'auto', padding: '2rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Applicants</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>For: {jobTitle}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>

        {loading ? (
          <p style={{ color: '#64748b' }}>Loading applicants...</p>
        ) : applicants.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>No applications received yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {applicants.map((app) => (
              <div key={app._id} style={{
                padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '10px',
                backgroundColor: '#f8fafc'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1rem' }}>{app.applicant?.name || 'Candidate'}</h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.applicant?.email}</span>
                </div>
                {app.coverLetter && (
                  <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0.5rem 0', fontStyle: 'italic' }}>
                    "{app.coverLetter}"
                  </p>
                )}
                <div style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <a
                    href={app.resumeLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}
                  >
                    📄 View Resume / Portfolio ↗
                  </a>
                  <span style={{
                    fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px',
                    backgroundColor: '#e2e8f0', color: '#334155', fontWeight: '600'
                  }}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantsModal;