import React, { useState, useEffect } from 'react';

const EditResume = () => {
  const initialUser = JSON.parse(localStorage.getItem('user') || '{}');

  // PERSONAL DETAILS STATE
  const [personalInfo, setPersonalInfo] = useState({
    name: initialUser.name || initialUser.fullName || 'Avani Barmecha',
    email: initialUser.email || 'avanijain4020@gmail.com',
    phone: initialUser.phone || '+91 9685106123',
    city: initialUser.city || 'Indore'
  });

  // RESUME SECTIONS STATES
  const [objective, setObjective] = useState('');
  const [education, setEducation] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);
  const [extraCurricular, setExtraCurricular] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [accomplishments, setAccomplishments] = useState([]);

  // MODAL & EDIT STATES
  const [activeModal, setActiveModal] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState({});
  const [saveStatus, setSaveStatus] = useState('');

  // 🔹 CHANGE 1: DYNAMIC STORAGE KEY GETTER (EMAIL WISE)
  const getStorageKey = () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const email = currentUser.email || personalInfo.email || 'default';
    return `candidateProfile_${email}`;
  };

  // INITIAL LOAD FROM LOCALSTORAGE
  useEffect(() => {
    // Check both user-specific key and fallback key
    const userKey = getStorageKey();
    const candidateData = JSON.parse(
      localStorage.getItem(userKey) || localStorage.getItem('candidateProfile') || '{}'
    );
    
    if (candidateData.resume) {
      const res = candidateData.resume;
      if (res.personalInfo) setPersonalInfo(res.personalInfo);
      if (res.objective) setObjective(res.objective);
      if (res.education) setEducation(res.education);
      if (res.workExperience) setWorkExperience(res.workExperience);
      if (res.extraCurricular) setExtraCurricular(res.extraCurricular);
      if (res.trainings) setTrainings(res.trainings);
      if (res.projects) setProjects(res.projects);
      if (res.skills) setSkills(res.skills);
      if (res.portfolio) setPortfolio(res.portfolio);
      if (res.accomplishments) setAccomplishments(res.accomplishments);
    }
  }, []);

  // 🔹 CHANGE 2: SAVE TO DYNAMIC KEY & GENERAL KEY
  const syncResumeToLocalStorage = (updatedResume) => {
    const userKey = getStorageKey();

    // 1. User specific profile update
    const candidateData = JSON.parse(localStorage.getItem(userKey) || '{}');
    candidateData.resume = updatedResume;
    candidateData.email = personalInfo.email;
    localStorage.setItem(userKey, JSON.stringify(candidateData));

    // 2. Global fallback key update
    localStorage.setItem('candidateProfile', JSON.stringify(candidateData));
  };

  // FULL MANUAL GLOBAL SAVE
  const handleGlobalSave = () => {
    const fullResumeObj = {
      personalInfo,
      objective,
      education,
      workExperience,
      extraCurricular,
      trainings,
      projects,
      skills,
      portfolio,
      accomplishments
    };
    syncResumeToLocalStorage(fullResumeObj);
    setSaveStatus('Resume saved successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  // 🔹 CHANGE 3: UPDATE & SYNC WITH FALLBACK DATA
  const updateAndSync = (setter, newValue, fullResumeObjKey, valueForResume) => {
    setter(newValue);
    const userKey = getStorageKey();
    const candidateData = JSON.parse(
      localStorage.getItem(userKey) || localStorage.getItem('candidateProfile') || '{}'
    );

    const currentResume = candidateData.resume || {
      personalInfo,
      objective,
      education,
      workExperience,
      extraCurricular,
      trainings,
      projects,
      skills,
      portfolio,
      accomplishments
    };

    currentResume[fullResumeObjKey] = valueForResume;
    syncResumeToLocalStorage(currentResume);
  };

  const openModal = (modalType, index = null, data = {}) => {
    setActiveModal(modalType);
    setEditIndex(index);
    setFormData(data);
  };

  const getUpdatedList = (list) => {
    if (editIndex !== null) {
      const updated = [...list];
      updated[editIndex] = formData;
      return updated;
    }
    return [...list, formData];
  };

  const handleSave = () => {
    if (activeModal === 'personal') {
      updateAndSync(setPersonalInfo, formData, 'personalInfo', formData);
    } else if (activeModal === 'objective') {
      const text = formData.text || '';
      updateAndSync(setObjective, text, 'objective', text);
    } else if (activeModal === 'education') {
      const updated = getUpdatedList(education);
      updateAndSync(setEducation, updated, 'education', updated);
    } else if (activeModal === 'work') {
      const updated = getUpdatedList(workExperience);
      updateAndSync(setWorkExperience, updated, 'workExperience', updated);
    } else if (activeModal === 'extra') {
      const updated = getUpdatedList(extraCurricular);
      updateAndSync(setExtraCurricular, updated, 'extraCurricular', updated);
    } else if (activeModal === 'training') {
      const updated = getUpdatedList(trainings);
      updateAndSync(setTrainings, updated, 'trainings', updated);
    } else if (activeModal === 'project') {
      const updated = getUpdatedList(projects);
      updateAndSync(setProjects, updated, 'projects', updated);
    } else if (activeModal === 'skill') {
      const updated = getUpdatedList(skills);
      updateAndSync(setSkills, updated, 'skills', updated);
    } else if (activeModal === 'portfolio') {
      const updated = getUpdatedList(portfolio);
      updateAndSync(setPortfolio, updated, 'portfolio', updated);
    } else if (activeModal === 'accomplishment') {
      const updated = getUpdatedList(accomplishments);
      updateAndSync(setAccomplishments, updated, 'accomplishments', updated);
    }

    setActiveModal(null);
    setFormData({});
    setEditIndex(null);
  };

  const handleDelete = (list, setList, index, resumeKey) => {
    const updated = list.filter((_, i) => i !== index);
    updateAndSync(setList, updated, resumeKey, updated);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.pageHeading}>Your resume</h2>
      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', margin: '0 0 20px 0' }}>
        This is the resume companies will see when you apply
      </p>

      {/* 1. PERSONAL DETAILS HEADER */}
      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a' }}>{personalInfo.name}</h1>
            <button style={styles.iconBtn} onClick={() => openModal('personal', null, personalInfo)}>✏️</button>
          </div>
          <p style={{ margin: '4px 0 2px 0', color: '#64748b' }}>{personalInfo.email}</p>
          <p style={{ margin: '0', color: '#64748b' }}>{personalInfo.phone} | {personalInfo.city}</p>
        </div>
        <button style={styles.downloadBtn} onClick={() => window.print()}>↓ Download</button>
      </div>

      {/* 2. CAREER OBJECTIVE */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>CAREER OBJECTIVE</h4>
        {objective ? (
          <div style={styles.itemBox}>
            <p style={{ margin: 0, color: '#334155' }}>{objective}</p>
            <div style={styles.actionRow}>
              <button style={styles.editBtn} onClick={() => openModal('objective', null, { text: objective })}>Edit</button>
              <button style={styles.deleteBtn} onClick={() => updateAndSync(setObjective, '', 'objective', '')}>Delete</button>
            </div>
          </div>
        ) : (
          <button style={styles.addBtn} onClick={() => openModal('objective')}>+ Add your career objective</button>
        )}
      </div>

      {/* 3. EDUCATION */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>EDUCATION</h4>
        {education.map((edu, i) => (
          <div key={i} style={styles.itemBox}>
            <strong>
              {edu.level === '10th'
                ? '10th Secondary School Examination'
                : edu.level === '12th'
                ? '12th Senior Secondary Examination'
                : edu.degree || 'College / Degree'}
            </strong>
            <p style={styles.subText}>{edu.schoolOrCollege} {edu.board ? `(${edu.board})` : ''}</p>
            <span style={styles.yearsText}>{edu.years} {edu.score ? `| Score: ${edu.score}` : ''}</span>
            <div style={styles.actionRow}>
              <button style={styles.editBtn} onClick={() => openModal('education', i, edu)}>Edit</button>
              <button style={styles.deleteBtn} onClick={() => handleDelete(education, setEducation, i, 'education')}>Delete</button>
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '8px' }}>
          <button style={styles.addBtn} onClick={() => openModal('education', null, { level: 'Graduation' })}>+ Add Graduation / College</button>
          <button style={styles.addBtn} onClick={() => openModal('education', null, { level: '12th' })}>+ Add 12th Senior Secondary</button>
          <button style={styles.addBtn} onClick={() => openModal('education', null, { level: '10th' })}>+ Add 10th Secondary</button>
        </div>
      </div>

      {/* 4. WORK EXPERIENCE */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>WORK EXPERIENCE</h4>
        {workExperience.map((exp, i) => (
          <div key={i} style={styles.itemBox}>
            <strong>{exp.role} - {exp.company} ({exp.type})</strong>
            <p style={styles.subText}>{exp.details}</p>
            <span style={styles.yearsText}>{exp.duration}</span>
            <div style={styles.actionRow}>
              <button style={styles.editBtn} onClick={() => openModal('work', i, exp)}>Edit</button>
              <button style={styles.deleteBtn} onClick={() => handleDelete(workExperience, setWorkExperience, i, 'workExperience')}>Delete</button>
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '15px' }}>
          <button style={styles.addBtn} onClick={() => openModal('work', null, { type: 'Job' })}>+ Add job</button>
          <button style={styles.addBtn} onClick={() => openModal('work', null, { type: 'Internship' })}>+ Add internship</button>
        </div>
      </div>

      {/* 5. EXTRA CURRICULAR */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>EXTRA CURRICULAR ACTIVITIES</h4>
        {extraCurricular.map((item, i) => (
          <div key={i} style={styles.itemBox}>
            <p style={{ margin: 0 }}>{item.title}</p>
            <div style={styles.actionRow}>
              <button style={styles.editBtn} onClick={() => openModal('extra', i, item)}>Edit</button>
              <button style={styles.deleteBtn} onClick={() => handleDelete(extraCurricular, setExtraCurricular, i, 'extraCurricular')}>Delete</button>
            </div>
          </div>
        ))}
        <button style={styles.addBtn} onClick={() => openModal('extra')}>+ Add extra curricular activities</button>
      </div>

      {/* 6. TRAININGS / COURSES */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>TRAININGS/ COURSES</h4>
        {trainings.map((t, i) => (
          <div key={i} style={styles.itemBox}>
            <strong>{t.courseName}</strong>
            <p style={styles.subText}>{t.organization}</p>
            <div style={styles.actionRow}>
              <button style={styles.editBtn} onClick={() => openModal('training', i, t)}>Edit</button>
              <button style={styles.deleteBtn} onClick={() => handleDelete(trainings, setTrainings, i, 'trainings')}>Delete</button>
            </div>
          </div>
        ))}
        <button style={styles.addBtn} onClick={() => openModal('training')}>+ Add training/ course</button>
      </div>

      {/* 7. PROJECTS */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>ACADEMICS/ PERSONAL PROJECTS</h4>
        {projects.map((p, i) => (
          <div key={i} style={styles.itemBox}>
            <strong>{p.title}</strong>
            <p style={styles.subText}>{p.description}</p>
            <div style={styles.actionRow}>
              <button style={styles.editBtn} onClick={() => openModal('project', i, p)}>Edit</button>
              <button style={styles.deleteBtn} onClick={() => handleDelete(projects, setProjects, i, 'projects')}>Delete</button>
            </div>
          </div>
        ))}
        <button style={styles.addBtn} onClick={() => openModal('project')}>+ Add academic/ personal project</button>
      </div>

      {/* 8. SKILLS */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>SKILLS</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {skills.map((s, i) => (
            <span key={i} style={styles.skillTag}>
              {s.name} <b style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => handleDelete(skills, setSkills, i, 'skills')}>×</b>
            </span>
          ))}
        </div>
        <button style={styles.addBtn} onClick={() => openModal('skill')}>+ Add skill</button>
      </div>

      {/* 9. PORTFOLIO */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>PORTFOLIO/ WORK SAMPLES</h4>
        {portfolio.map((p, i) => (
          <div key={i} style={styles.itemBox}>
            <a href={p.link} target="_blank" rel="noreferrer" style={{ color: '#0284c7' }}>{p.title || p.link}</a>
            <div style={styles.actionRow}>
              <button style={styles.deleteBtn} onClick={() => handleDelete(portfolio, setPortfolio, i, 'portfolio')}>Delete</button>
            </div>
          </div>
        ))}
        <button style={styles.addBtn} onClick={() => openModal('portfolio')}>+ Add portfolio/ work sample</button>
      </div>

      {/* 10. ACCOMPLISHMENTS */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>ACCOMPLISHMENTS/ ADDITIONAL DETAILS</h4>
        {accomplishments.map((acc, i) => (
          <div key={i} style={styles.itemBox}>
            <p style={{ margin: 0 }}>{acc.title}</p>
            <div style={styles.actionRow}>
              <button style={styles.deleteBtn} onClick={() => handleDelete(accomplishments, setAccomplishments, i, 'accomplishments')}>Delete</button>
            </div>
          </div>
        ))}
        <button style={styles.addBtn} onClick={() => openModal('accomplishment')}>+ Add accomplishment/ additional detail</button>
      </div>

      {/* 11. MAIN BOTTOM SAVE SECTION */}
      <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
        <button style={styles.mainSaveBtn} onClick={handleGlobalSave}>
          Save Resume Data
        </button>
        {saveStatus && <p style={{ color: '#16a34a', marginTop: '10px', fontWeight: 'bold' }}>{saveStatus}</p>}
      </div>

      {/* MODAL POPUP */}
      {activeModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ marginTop: 0, color: '#0f172a' }}>Update Information</h3>

            {activeModal === 'personal' && (
              <>
                <input style={styles.input} placeholder="Full Name" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <input style={styles.input} placeholder="Email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                <input style={styles.input} placeholder="Phone Number" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                <input style={styles.input} placeholder="City" value={formData.city || ''} onChange={e => setFormData({ ...formData, city: e.target.value })} />
              </>
            )}

            {activeModal === 'objective' && (
              <textarea rows="4" style={styles.input} placeholder="Write career objective..." value={formData.text || ''} onChange={e => setFormData({ text: e.target.value })} />
            )}

            {activeModal === 'education' && (
              <>
                <select style={styles.input} value={formData.level || 'Graduation'} onChange={e => setFormData({ ...formData, level: e.target.value })}>
                  <option value="Graduation">Graduation / Post Graduation</option>
                  <option value="12th">XII (12th Senior Secondary)</option>
                  <option value="10th">X (10th Secondary)</option>
                </select>
                {formData.level === 'Graduation' ? (
                  <>
                    <input style={styles.input} placeholder="Degree (e.g. B.Tech CS)" value={formData.degree || ''} onChange={e => setFormData({ ...formData, degree: e.target.value })} />
                    <input style={styles.input} placeholder="College / University Name" value={formData.schoolOrCollege || ''} onChange={e => setFormData({ ...formData, schoolOrCollege: e.target.value })} />
                  </>
                ) : (
                  <>
                    <input style={styles.input} placeholder="School Name" value={formData.schoolOrCollege || ''} onChange={e => setFormData({ ...formData, schoolOrCollege: e.target.value })} />
                    <input style={styles.input} placeholder="Board (e.g. CBSE, MP Board, ICSE)" value={formData.board || ''} onChange={e => setFormData({ ...formData, board: e.target.value })} />
                    <input style={styles.input} placeholder="Score / Percentage / CGPA (e.g. 85%)" value={formData.score || ''} onChange={e => setFormData({ ...formData, score: e.target.value })} />
                  </>
                )}
                <input style={styles.input} placeholder="Year of Completion / Duration (e.g. 2022 - 2024)" value={formData.years || ''} onChange={e => setFormData({ ...formData, years: e.target.value })} />
              </>
            )}

            {activeModal === 'work' && (
              <>
                <input style={styles.input} placeholder="Profile / Role" value={formData.role || ''} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                <input style={styles.input} placeholder="Organization / Company" value={formData.company || ''} onChange={e => setFormData({ ...formData, company: e.target.value })} />
                <input style={styles.input} placeholder="Duration (e.g. 6 Months)" value={formData.duration || ''} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
                <textarea rows="3" style={styles.input} placeholder="Description" value={formData.details || ''} onChange={e => setFormData({ ...formData, details: e.target.value })} />
              </>
            )}

            {activeModal === 'training' && (
              <>
                <input style={styles.input} placeholder="Training Program / Course" value={formData.courseName || ''} onChange={e => setFormData({ ...formData, courseName: e.target.value })} />
                <input style={styles.input} placeholder="Organization" value={formData.organization || ''} onChange={e => setFormData({ ...formData, organization: e.target.value })} />
              </>
            )}

            {activeModal === 'project' && (
              <>
                <input style={styles.input} placeholder="Project Title" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                <textarea rows="3" style={styles.input} placeholder="Project Description" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </>
            )}

            {activeModal === 'skill' && (
              <input style={styles.input} placeholder="Skill Name (e.g. React.js)" value={formData.name || ''} onChange={e => setFormData({ name: e.target.value })} />
            )}

            {activeModal === 'portfolio' && (
              <>
                <input style={styles.input} placeholder="Title (e.g. GitHub / Behance)" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                <input style={styles.input} placeholder="URL Link" value={formData.link || ''} onChange={e => setFormData({ ...formData, link: e.target.value })} />
              </>
            )}

            {(activeModal === 'extra' || activeModal === 'accomplishment') && (
              <textarea rows="3" style={styles.input} placeholder="Details..." value={formData.title || ''} onChange={e => setFormData({ title: e.target.value })} />
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
              <button style={styles.cancelBtn} onClick={() => setActiveModal(null)}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '850px', margin: '2rem auto', padding: '2rem', backgroundColor: '#fff', color: '#1e293b', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  pageHeading: { textAlign: 'center', fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' },
  downloadBtn: { border: '1px solid #0284c7', color: '#0284c7', background: 'transparent', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  section: { borderBottom: '1px solid #e2e8f0', padding: '1.2rem 0' },
  sectionTitle: { color: '#64748b', fontSize: '0.75rem', letterSpacing: '0.5px', marginBottom: '0.8rem' },
  itemBox: { border: '1px solid #e2e8f0', padding: '0.8rem 1rem', borderRadius: '6px', background: '#f8fafc', marginBottom: '0.8rem', position: 'relative' },
  subText: { margin: '0.2rem 0', color: '#64748b', fontSize: '0.9rem' },
  yearsText: { color: '#94a3b8', fontSize: '0.85rem' },
  addBtn: { color: '#0284c7', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem', padding: 0 },
  actionRow: { display: 'flex', gap: '10px', marginTop: '8px' },
  editBtn: { background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', padding: 0 },
  deleteBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', padding: 0 },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' },
  skillTag: { backgroundColor: '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: '15px', fontSize: '0.85rem' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '420px', display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' },
  saveBtn: { backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  cancelBtn: { backgroundColor: '#e2e8f0', color: '#334155', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' },
  mainSaveBtn: { backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '12px 36px', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)' }
};

export default EditResume;