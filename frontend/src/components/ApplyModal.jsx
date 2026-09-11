import React, { useState } from 'react';
import axios from 'axios';

const ApplyModal = ({ job, onClose }) => {
  const [resumeLink, setResumeLink] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [message, setMessage] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/applications/apply', {
        jobId: job._id,
        applicantId: user.id || user._id,
        resumeLink,
        coverLetter
      });
      setMessage('Application submitted successfully!');
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to submit application');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '450px', maxWidth: '90%' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Apply for {job.title}</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.2rem' }}>{job.companyName}</p>

        {message && <p style={{ fontSize: '0.85rem', color: message.includes('success') ? 'green' : 'red', marginBottom: '1rem' }}>{message}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Resume Drive / Portfolio Link</label>
            <input
              type="url"
              required
              placeholder="https://drive.google.com/..."
              className="form-input"
              value={resumeLink}
              onChange={(e) => setResumeLink(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Cover Letter (Optional)</label>
            <textarea
              className="form-input"
              rows="3"
              placeholder="Why are you a good fit?"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'none' }}>Cancel</button>
            <button type="submit" className="btn-apply" style={{ flex: 1, backgroundColor: '#2563eb' }}>Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyModal;