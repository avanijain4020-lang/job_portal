import React from 'react';
import './ApplicationTimeline.css';

const ApplicationTimeline = ({ status, interviewDate, interviewTime }) => {
  const steps = [
    { label: 'Applied', key: 'Applied' },
    { label: 'Reviewed', key: 'Reviewed' },
    { label: 'Interview Scheduled', key: 'Interview Scheduled' },
    { label: 'Decision', key: 'Accepted' } // Handles Accepted / Shortlisted / Rejected
  ];

  // Current step index nikalein
  const getStepStatus = (stepKey, index) => {
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
    <div className="timeline-container">
      <div className="timeline-progress-bar">
        {steps.map((step, index) => {
          const stepState = getStepStatus(step.key, index);
          return (
            <div key={index} className={`timeline-step ${stepState}`}>
              <div className="step-node">
                {stepState === 'completed' ? '✓' : stepState === 'rejected' ? '✕' : index + 1}
              </div>
              <span className="step-label">
                {index === 3 && status === 'Rejected' ? 'Rejected' : step.label}
              </span>
              {index < steps.length - 1 && <div className="step-line"></div>}
            </div>
          );
        })}
      </div>

      {/* Interview Details Card agar Schedule ho chuka hai */}
      {status === 'Interview Scheduled' && (interviewDate || interviewTime) && (
        <div className="interview-badge">
          📅 <strong>Interview Scheduled:</strong> {interviewDate || 'TBD'} at {interviewTime || 'TBD'}
        </div>
      )}
    </div>
  );
};

export default ApplicationTimeline;