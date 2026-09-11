import React, { useState } from 'react';
import axios from 'axios';

const PostJobForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    type: 'Internship',
    experienceLevel: 'Fresher',
    location: '',
    domain: '',
    salaryOrStipend: '',
    duration: '',
    skillsRequired: '',
    deadline: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Formatting skills from comma separated string to array
    const payload = {
      ...formData,
      skillsRequired: formData.skillsRequired.split(',').map((skill) => skill.trim())
    };

    try {
      await axios.post('http://localhost:5000/api/jobs', payload);
      setMessage({ type: 'success', text: 'Opportunity published successfully!' });
      setFormData({
        title: '',
        company: '',
        type: 'Internship',
        experienceLevel: 'Fresher',
        location: '',
        domain: '',
        salaryOrStipend: '',
        duration: '',
        skillsRequired: '',
        deadline: '',
        description: ''
      });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to post opportunity' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>
        <span style={{ color: '#818cf8', marginRight: '8px' }}>+</span> Post a New Role
      </h2>

      {message.text && (
        <div style={message.type === 'error' ? errorBoxStyle : successBoxStyle}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={formStyle}>
        <div>
          <label style={labelStyle}>Job Title *</label>
          <input
            type="text"
            name="title"
            required
            placeholder="e.g. Frontend Developer Intern"
            value={formData.title}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Company Name *</label>
          <input
            type="text"
            name="company"
            required
            placeholder="e.g. TechCorp Solutions"
            value={formData.company}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={rowStyle}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Type</label>
            <select name="type" value={formData.type} onChange={handleChange} style={selectStyle}>
              <option value="Internship">Internship</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Experience Level</label>
            <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} style={selectStyle}>
              <option value="Fresher">Fresher</option>
              <option value="0-1 Years">0-1 Years</option>
              <option value="1-3 Years">1-3 Years</option>
              <option value="3+ Years">3+ Years</option>
            </select>
          </div>
        </div>

        <div style={rowStyle}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Location *</label>
            <input
              type="text"
              name="location"
              required
              placeholder="e.g. Remote / Bangalore"
              value={formData.location}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Domain / Category</label>
            <input
              type="text"
              name="domain"
              placeholder="e.g. Web Development"
              value={formData.domain}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Added Stipend & Duration Row */}
        <div style={rowStyle}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Stipend / Salary *</label>
            <input
              type="text"
              name="salaryOrStipend"
              required
              placeholder="e.g. ₹15,000 / month"
              value={formData.salaryOrStipend}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Duration *</label>
            <input
              type="text"
              name="duration"
              required
              placeholder="e.g. 3 Months / Full-time"
              value={formData.duration}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Required Skills (Comma-separated) *</label>
          <input
            type="text"
            name="skillsRequired"
            required
            placeholder="React, Node.js, MongoDB"
            value={formData.skillsRequired}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Deadline Date</label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Description *</label>
          <textarea
            name="description"
            required
            rows="4"
            placeholder="Role overview & requirements..."
            value={formData.description}
            onChange={handleChange}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Publishing...' : 'Publish Opportunity'}
        </button>
      </form>
    </div>
  );
};

// UI Matching Styles
const containerStyle = { backgroundColor: '#0f172a', padding: '2rem', borderRadius: '12px', color: '#fff', maxWidth: '480px', margin: 'auto' };
const headingStyle = { fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '1rem' };
const rowStyle = { display: 'flex', gap: '1rem' };
const labelStyle = { display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: '500' };
const inputStyle = { width: '100%', padding: '0.65rem 0.85rem', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };
const selectStyle = { ...inputStyle, cursor: 'pointer' };
const buttonStyle = { padding: '0.75rem', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', marginTop: '0.5rem' };
const errorBoxStyle = { backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' };
const successBoxStyle = { backgroundColor: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', color: '#86efac', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' };

export default PostJobForm;