import React, { useState } from 'react';
import ApplyModal from './ApplyModal';

const JobCard = ({ job }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="job-card">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
          <div>
            <h3 className="job-title">{job.title}</h3>
            <span className="company-name">{job.companyName}</span>
          </div>
          <span className={`badge ${job.type === 'Internship' ? 'badge-internship' : 'badge-job'}`}>
            {job.type}
          </span>
        </div>

        <div className="job-meta">
          <span className="meta-item">📍 {job.location}</span>
          <span className="meta-item">💼 {job.experience}</span>
        </div>

        <div className="skills-container">
          {job.skills?.map((skill, index) => (
            <span key={index} className="skill-badge">{skill}</span>
          ))}
        </div>
      </div>

      <button className="btn-apply" onClick={() => setShowModal(true)}>Apply Now</button>

      {showModal && <ApplyModal job={job} onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default JobCard;