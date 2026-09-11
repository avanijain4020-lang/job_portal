import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EmployerCandidateView = ({ applicationId }) => {
  const [candidate, setCandidate] = useState(null);
  const [candidateStatus, setCandidateStatus] = useState('Pending');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // LocalStorage Fallback Support
    const data = JSON.parse(localStorage.getItem('candidateProfile') || '{}');
    setCandidate(data);
  }, []);

  const handleStatusChange = async (newStatus) => {
    setCandidateStatus(newStatus);
    if (applicationId) {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('jwt');
        await axios.put(
          `http://localhost:5000/api/applications/${applicationId}`,
          { status: newStatus },
          { headers: { Authorization: token ? `Bearer ${token}` : '' } }
        );
      } catch (err) {
        console.error('Failed to update status on server:', err);
      }
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!interviewDate || !interviewTime) {
      alert('Please select both Date and Time');
      return;
    }

    if (!applicationId) {
      alert('Application ID is missing! Cannot schedule on server.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('jwt');

      const res = await axios.put(
        `http://localhost:5000/api/applications/${applicationId}/schedule`,
        { interviewDate, interviewTime },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : ''
          }
        }
      );

      if (res.data?.success || res.status === 200) {
        alert('Interview Scheduled Successfully!');
        setCandidateStatus('Interview Scheduled');
        setShowScheduleModal(false);
      }
    } catch (error) {
      console.error('Schedule Error:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Server update failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  if (!candidate || (!candidate.resume && !candidate.preferences)) {
    return (
      <div style={styles.emptyContainer}>
        <h3>No candidate profile found</h3>
        <p>Please fill out the Resume and Preferences sections on the candidate side first.</p>
      </div>
    );
  }

  const { resume = {}, preferences = {} } = candidate;
  const {
    personalInfo = {},
    objective = '',
    education = [],
    workExperience = [],
    skills = [],
    projects = [],
    trainings = [],
    portfolio = [],
    accomplishments = [],
    extraCurricular = []
  } = resume;

  return (
    <div style={styles.container}>
      {/* HEADER WITH ACTION BUTTONS */}
      <div style={styles.topHeader}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a' }}>Employer View: Candidate Profile</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
            Status: <span style={styles.statusBadge(candidateStatus)}>{candidateStatus}</span>
          </p>
        </div>
        <div style={styles.actionBtnGroup}>
          <button style={styles.scheduleBtn} onClick={() => setShowScheduleModal(true)}>
            📅 Schedule Interview
          </button>
          <button style={styles.shortlistBtn} onClick={() => handleStatusChange('Shortlisted')}>
            ✓ Shortlist
          </button>
          <button style={styles.rejectBtn} onClick={() => handleStatusChange('Rejected')}>
            ✕ Reject
          </button>
          <button style={styles.printBtn} onClick={() => window.print()}>
            🖨️ Print / Download
          </button>
        </div>
      </div>

      {/* SCHEDULE INTERVIEW MODAL */}
      {showScheduleModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginTop: 0, color: '#0f172a' }}>Schedule Interview</h3>
            <form onSubmit={handleScheduleSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: '#334155' }}>
                  Interview Date:
                </label>
                <input
                  type="date"
                  style={styles.inputStyle}
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: '#334155' }}>
                  Interview Time:
                </label>
                <input
                  type="time"
                  style={styles.inputStyle}
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={styles.submitModalBtn}>
                  {loading ? 'Saving...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. PERSONAL DETAILS */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>👤 Personal Details</h3>
        <h2 style={{ margin: '0 0 8px 0', color: '#0284c7' }}>{personalInfo.name || 'Candidate Name'}</h2>
        <div style={styles.grid2Col}>
          <p style={styles.infoText}><b>Email:</b> {personalInfo.email || 'N/A'}</p>
          <p style={styles.infoText}><b>Phone:</b> {personalInfo.phone || 'N/A'}</p>
          <p style={styles.infoText}><b>Location:</b> {personalInfo.city || 'N/A'}</p>
        </div>
      </div>

      {/* 2. CAREER OBJECTIVE */}
      {objective && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🎯 Career Objective</h3>
          <p style={{ margin: 0, color: '#334155', fontSize: '14px', lineHeight: '1.5' }}>{objective}</p>
        </div>
      )}

      {/* 3. CANDIDATE PREFERENCES */}
      <div style={{ ...styles.card, backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}>
        <h3 style={{ ...styles.cardTitle, color: '#0369a1' }}>⚙️ Candidate Preferences & Goals</h3>

        <div style={styles.prefGrid}>
          <div>
            <strong>Looking For:</strong>
            <div style={styles.chipRow}>
              {preferences.lookingFor?.length > 0 ? (
                preferences.lookingFor.map((item, i) => <span key={i} style={styles.prefChip}>{item}</span>)
              ) : (
                <span style={styles.noDataText}>Not specified</span>
              )}
            </div>
          </div>

          <div>
            <strong>Preferred Work Mode:</strong>
            <div style={styles.chipRow}>
              {preferences.workMode?.length > 0 ? (
                preferences.workMode.map((item, i) => <span key={i} style={styles.prefChip}>{item}</span>)
              ) : (
                <span style={styles.noDataText}>Not specified</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <strong>Areas of Interest:</strong>
          <div style={styles.chipRow}>
            {preferences.selectedInterests?.length > 0 ? (
              preferences.selectedInterests.map((item, i) => <span key={i} style={styles.interestChip}>{item}</span>)
            ) : (
              <span style={styles.noDataText}>Not specified</span>
            )}
          </div>
        </div>

        {preferences.careerGoals && (
          <div style={{ marginTop: '12px' }}>
            <strong>Career Goals:</strong>
            <ul style={{ margin: '6px 0 0 18px', padding: 0, color: '#0369a1', fontSize: '13px' }}>
              {preferences.careerGoals.firstJob && <li>Seeking first job/internship (Fresher)</li>}
              {preferences.careerGoals.betterJob && <li>Looking for a better full-time role</li>}
              {preferences.careerGoals.internshipExperience && <li>Seeking internship experience</li>}
              {preferences.careerGoals.careerSwitch && <li>Planning a domain/career transition</li>}
            </ul>
          </div>
        )}
      </div>

      {/* 4. KEY SKILLS */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>💡 Key Skills</h3>
        <div style={styles.chipRow}>
          {skills.length > 0 ? (
            skills.map((s, i) => <span key={i} style={styles.skillChip}>{s.name}</span>)
          ) : (
            <span style={styles.noDataText}>No skills added</span>
          )}
        </div>
      </div>

      {/* 5. WORK EXPERIENCE / INTERNSHIPS */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>💼 Work Experience & Internships</h3>
        {workExperience.length > 0 ? (
          workExperience.map((exp, i) => (
            <div key={i} style={styles.listItem}>
              <strong style={{ color: '#0f172a' }}>{exp.role} - {exp.company} <span style={styles.typeBadge}>{exp.type}</span></strong>
              <p style={{ margin: '4px 0', color: '#475569', fontSize: '14px' }}>{exp.details}</p>
              <small style={{ color: '#64748b' }}>📅 {exp.duration}</small>
            </div>
          ))
        ) : (
          <p style={styles.noDataText}>No work experience added</p>
        )}
      </div>

      {/* 6. EDUCATION HISTORY */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>🎓 Education</h3>
        {education.length > 0 ? (
          education.map((edu, i) => (
            <div key={i} style={styles.listItem}>
              <strong>
                {edu.level === '10th'
                  ? '10th Secondary School'
                  : edu.level === '12th'
                  ? '12th Senior Secondary'
                  : edu.degree || 'Graduation'}
              </strong>
              <p style={{ margin: '2px 0', color: '#475569', fontSize: '14px' }}>
                {edu.schoolOrCollege} {edu.board ? `(${edu.board})` : ''}
              </p>
              <small style={{ color: '#64748b' }}>
                {edu.years} {edu.score ? ` | Score: ${edu.score}` : ''}
              </small>
            </div>
          ))
        ) : (
          <p style={styles.noDataText}>No education details added</p>
        )}
      </div>

      {/* 7. PROJECTS */}
      {projects.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🛠 Projects</h3>
          {projects.map((p, i) => (
            <div key={i} style={styles.listItem}>
              <strong style={{ color: '#0f172a' }}>{p.title}</strong>
              <p style={{ margin: '4px 0', color: '#475569', fontSize: '14px' }}>{p.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* 8. TRAININGS / COURSES */}
      {trainings.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📜 Trainings & Courses</h3>
          {trainings.map((t, i) => (
            <div key={i} style={styles.listItem}>
              <strong>{t.courseName}</strong>
              <p style={{ margin: '2px 0', color: '#475569', fontSize: '14px' }}>{t.organization}</p>
            </div>
          ))}
        </div>
      )}

      {/* 9. PORTFOLIO & LINKS */}
      {portfolio.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🔗 Portfolio & Work Samples</h3>
          {portfolio.map((p, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <a href={p.link} target="_blank" rel="noreferrer" style={{ color: '#0284c7', fontWeight: 'bold', fontSize: '14px' }}>
                🔗 {p.title || p.link}
              </a>
            </div>
          ))}
        </div>
      )}

      {/* 10. ACCOMPLISHMENTS & EXTRA CURRICULAR */}
      {(accomplishments.length > 0 || extraCurricular.length > 0) && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🏆 Accomplishments & Extra Curricular</h3>
          {accomplishments.map((acc, i) => (
            <p key={`acc-${i}`} style={{ margin: '4px 0', color: '#334155', fontSize: '14px' }}>• {acc.title}</p>
          ))}
          {extraCurricular.map((ex, i) => (
            <p key={`ex-${i}`} style={{ margin: '4px 0', color: '#334155', fontSize: '14px' }}>• {ex.title}</p>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '850px', margin: '2rem auto', fontFamily: 'sans-serif', padding: '0 1rem' },
  emptyContainer: { textAlign: 'center', marginTop: '4rem', color: '#64748b', fontFamily: 'sans-serif' },
  topHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' },
  actionBtnGroup: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  scheduleBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
  shortlistBtn: { backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
  rejectBtn: { backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
  printBtn: { backgroundColor: '#e2e8f0', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
  statusBadge: (status) => ({
    backgroundColor: status === 'Shortlisted' ? '#dcfce7' : status === 'Rejected' ? '#fee2e2' : status === 'Interview Scheduled' ? '#dbeafe' : '#f1f5f9',
    color: status === 'Shortlisted' ? '#15803d' : status === 'Rejected' ? '#b91c1c' : status === 'Interview Scheduled' ? '#1d4ed8' : '#475569',
    padding: '2px 8px',
    borderRadius: '10px',
    fontWeight: 'bold'
  }),
  card: { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.03)' },
  cardTitle: { margin: '0 0 15px 0', fontSize: '1.05rem', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' },
  grid2Col: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' },
  infoText: { margin: '2px 0', color: '#334155', fontSize: '14px' },
  prefGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' },
  prefChip: { backgroundColor: '#0284c7', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  interestChip: { backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' },
  skillChip: { backgroundColor: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', border: '1px solid #cbd5e1', fontWeight: '500' },
  listItem: { borderBottom: '1px dashed #e2e8f0', paddingBottom: '10px', marginBottom: '10px' },
  typeBadge: { backgroundColor: '#f1f5f9', color: '#475569', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' },
  noDataText: { color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '320px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
  inputStyle: { width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '14px', marginTop: '4px', boxSizing: 'border-box' },
  cancelBtn: { backgroundColor: '#94a3b8', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' },
  submitModalBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }
};

export default EmployerCandidateView;