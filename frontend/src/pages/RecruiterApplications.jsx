import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RecruiterApplication = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // MODAL & SELECTED CANDIDATE RESUME STATE
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedCandidateName, setSelectedCandidateName] = useState('');

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/applications/recruiter');
        setApplications(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  // LOCAL STORAGE SE RESUME DATA FETCH KARNE KA FUNCTION
  const handleViewResume = (app) => {
    // Applicant ki email nikaalna (Backend schema ke according app.applicantEmail ya app.email)
    const email = app.applicantEmail || app.email || app.applicantName;
    
    // 1. Specific Email Key check karein
    const userSpecificKey = `candidateProfile_${email}`;
    let profileData = JSON.parse(localStorage.getItem(userSpecificKey));

    // 2. Agar Specific key nahi milti toh fallback candidateProfile key padhein
    if (!profileData) {
      profileData = JSON.parse(localStorage.getItem('candidateProfile') || '{}');
    }

    setSelectedCandidateName(app.applicantName);
    setSelectedResume(profileData.resume || profileData);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1.5rem', color: '#fff' }}>
      <h1>Candidate Applications</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        applications.map((app) => (
          <div
            key={app._id}
            style={{
              backgroundColor: '#0f172a',
              padding: '1.2rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid #334155'
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 5px 0' }}>{app.applicantName}</h3>
              <p style={{ margin: 0, color: '#94a3b8' }}>
                Applied for: <strong style={{ color: '#38bdf8' }}>{app.job?.title || 'Position'}</strong>
              </p>
            </div>
            
            {/* VIEW RESUME BUTTON */}
            <button
              onClick={() => handleViewResume(app)}
              style={{
                backgroundColor: '#0284c7',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              View Resume
            </button>
          </div>
        ))
      )}

      {/* RESUME DISPLAY MODAL */}
      {selectedResume && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
              <h2>{selectedCandidateName}'s Resume</h2>
              <button onClick={() => setSelectedResume(null)} style={styles.closeBtn}>✕ Close</button>
            </div>

            <div style={{ marginTop: '15px' }}>
              {/* Personal Info */}
              {selectedResume.personalInfo && (
                <div style={styles.section}>
                  <p><strong>Email:</strong> {selectedResume.personalInfo.email}</p>
                  <p><strong>Phone:</strong> {selectedResume.personalInfo.phone}</p>
                  <p><strong>City:</strong> {selectedResume.personalInfo.city}</p>
                </div>
              )}

              {/* Career Objective */}
              {selectedResume.objective && (
                <div style={styles.section}>
                  <h4>CAREER OBJECTIVE</h4>
                  <p>{selectedResume.objective}</p>
                </div>
              )}

              {/* Education */}
              {selectedResume.education && selectedResume.education.length > 0 && (
                <div style={styles.section}>
                  <h4>EDUCATION</h4>
                  {selectedResume.education.map((edu, idx) => (
                    <p key={idx}>
                      • <strong>{edu.degree || edu.level}</strong> - {edu.schoolOrCollege} ({edu.years}) {edu.score ? `| ${edu.score}` : ''}
                    </p>
                  ))}
                </div>
              )}

              {/* Work Experience */}
              {selectedResume.workExperience && selectedResume.workExperience.length > 0 && (
                <div style={styles.section}>
                  <h4>WORK EXPERIENCE</h4>
                  {selectedResume.workExperience.map((exp, idx) => (
                    <div key={idx} style={{ marginBottom: '8px' }}>
                      <p style={{ margin: 0 }}><strong>{exp.role}</strong> at {exp.company} ({exp.duration})</p>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1' }}>{exp.details}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {selectedResume.skills && selectedResume.skills.length > 0 && (
                <div style={styles.section}>
                  <h4>SKILLS</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedResume.skills.map((s, idx) => (
                      <span key={idx} style={styles.skillTag}>{s.name}</span>
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

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#1e293b', color: '#fff', padding: '20px', borderRadius: '8px', width: '600px', maxHeight: '80vh', overflowY: 'auto' },
  section: { borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px' },
  closeBtn: { background: '#ef4444', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  skillTag: { backgroundColor: '#0284c7', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.85rem' }
};

export default RecruiterApplication;