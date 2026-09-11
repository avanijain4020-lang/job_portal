import React, { useState, useEffect } from 'react';

const popularInterests = [
  'Sales', 'Data Entry', 'Digital Marketing', 'Web Development',
  'Graphic Design', 'Marketing', 'Human Resources (HR)', 'General Management',
  'Social Media Marketing', 'Finance', 'Software Development', 'Telecalling',
  'Market/Business Research', 'Content Writing', 'Accounts', 'Project Management',
  'Operations', 'Client Servicing', 'Programming', 'Teaching',
  'Data Science', 'Video Making/Editing', 'Interior Design',
  'Python/Django Development', 'UI/UX Design', 'Software Testing'
];

const YourPreferences = () => {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [lookingFor, setLookingFor] = useState([]);
  const [workMode, setWorkMode] = useState([]);
  
  const [careerGoals, setCareerGoals] = useState({
    firstJob: false,
    betterJob: false,
    internshipExperience: false,
    careerSwitch: false
  });

  const [errors, setErrors] = useState({
    lookingFor: false,
    workMode: false
  });

  useEffect(() => {
    const candidateData = JSON.parse(localStorage.getItem('candidateProfile') || '{}');
    if (candidateData.preferences) {
      const p = candidateData.preferences;
      if (p.selectedInterests) setSelectedInterests(p.selectedInterests);
      if (p.lookingFor) setLookingFor(p.lookingFor);
      if (p.workMode) setWorkMode(p.workMode);
      if (p.careerGoals) setCareerGoals(p.careerGoals);
    }
  }, []);

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const toggleLookingFor = (type) => {
    let updated = lookingFor.includes(type)
      ? lookingFor.filter(item => item !== type)
      : [...lookingFor, type];
    
    setLookingFor(updated);
    if (updated.length > 0) setErrors(prev => ({ ...prev, lookingFor: false }));
  };

  const toggleWorkMode = (mode) => {
    let updated = workMode.includes(mode)
      ? workMode.filter(item => item !== mode)
      : [...workMode, mode];

    setWorkMode(updated);
    if (updated.length > 0) setErrors(prev => ({ ...prev, workMode: false }));
  };

  const handleGoalChange = (key) => {
    setCareerGoals({ ...careerGoals, [key]: !careerGoals[key] });
  };

  const filteredInterests = popularInterests.filter(item =>
    item.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleSave = () => {
    const newErrors = {
      lookingFor: lookingFor.length === 0,
      workMode: workMode.length === 0
    };

    setErrors(newErrors);
    if (newErrors.lookingFor || newErrors.workMode) return;

    const preferencesData = {
      selectedInterests,
      lookingFor,
      workMode,
      careerGoals
    };

    const candidateData = JSON.parse(localStorage.getItem('candidateProfile') || '{}');
    candidateData.preferences = preferencesData;
    
    localStorage.setItem('candidateProfile', JSON.stringify(candidateData));
    alert('Preferences saved successfully!');
  };

  return (
    <div style={styles.outerContainer}>
      <h2 style={styles.mainHeading}>Your preferences</h2>

      <div style={styles.card}>
        {/* Area(s) of interest */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Area(s) of interest</label>
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Areas you want to work in or learn about"
              style={styles.searchInput}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        {/* Selected Interests Tags */}
        {selectedInterests.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
            {selectedInterests.map((interest, idx) => (
              <span key={idx} style={styles.selectedChip} onClick={() => toggleInterest(interest)}>
                {interest} ✕
              </span>
            ))}
          </div>
        )}

        {/* Popular career interests */}
        <div style={styles.fieldGroup}>
          <p style={styles.subHeading}>Popular career interests</p>
          <div style={styles.chipsContainer}>
            {filteredInterests.map((item, index) => {
              const isSelected = selectedInterests.includes(item);
              return (
                <button
                  key={index}
                  type="button"
                  style={isSelected ? styles.chipSelected : styles.chip}
                  onClick={() => toggleInterest(item)}
                >
                  {item} {isSelected ? '✓' : '+'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Currently looking for */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Currently looking for{' '}
            {errors.lookingFor && <span style={styles.requiredText}>⊗ Required</span>}
          </label>
          <div style={styles.chipsContainer}>
            {['Jobs', 'Internships'].map((item) => {
              const isSelected = lookingFor.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  style={isSelected ? styles.chipSelected : styles.chip}
                  onClick={() => toggleLookingFor(item)}
                >
                  {item} {isSelected ? '✓' : '+'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Work mode */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Work mode{' '}
            {errors.workMode && <span style={styles.requiredText}>⊗ Required</span>}
          </label>
          <div style={styles.chipsContainer}>
            {['In-office', 'Work from home'].map((item) => {
              const isSelected = workMode.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  style={isSelected ? styles.chipSelected : styles.chip}
                  onClick={() => toggleWorkMode(item)}
                >
                  {item} {isSelected ? '✓' : '+'}
                </button>
              );
            })}
          </div>
        </div>

        {/* CAREER GOALS */}
        <div style={styles.fieldGroup}>
          <p style={styles.checkboxTitle}>What is your current career goal?</p>
          <div style={styles.checkboxList}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={careerGoals.firstJob}
                onChange={() => handleGoalChange('firstJob')}
              />
              Get my first job / internship (Fresher)
            </label>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={careerGoals.betterJob}
                onChange={() => handleGoalChange('betterJob')}
              />
              Switch to a better full-time job role
            </label>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={careerGoals.internshipExperience}
                onChange={() => handleGoalChange('internshipExperience')}
              />
              Gain practical experience through internships
            </label>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={careerGoals.careerSwitch}
                onChange={() => handleGoalChange('careerSwitch')}
              />
              Transition into a new domain or field
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button type="button" style={styles.saveBtn} onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
};

const styles = {
  outerContainer: { maxWidth: '520px', margin: '2rem auto', fontFamily: 'sans-serif' },
  mainHeading: { textAlign: 'center', color: '#0f172a', fontSize: '24px', fontWeight: '700', marginBottom: '20px' },
  card: { backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
  fieldGroup: { marginBottom: '22px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '8px' },
  requiredText: { color: '#e53935', fontSize: '11px', fontWeight: '600', marginLeft: '6px' },
  searchWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: '12px', color: '#888', fontSize: '14px' },
  searchInput: { width: '100%', padding: '10px 10px 10px 36px', border: '1px solid #008bdc', borderRadius: '4px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
  subHeading: { fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '10px' },
  chipsContainer: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  chip: { backgroundColor: '#ffffff', border: '1px solid #d0d0d0', borderRadius: '16px', padding: '6px 14px', fontSize: '12px', color: '#555', cursor: 'pointer', outline: 'none' },
  chipSelected: { backgroundColor: '#e3f2fd', border: '1px solid #008bdc', borderRadius: '16px', padding: '6px 14px', fontSize: '12px', color: '#008bdc', fontWeight: '600', cursor: 'pointer', outline: 'none' },
  selectedChip: { backgroundColor: '#008bdc', color: '#ffffff', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' },
  checkboxTitle: { fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '10px' },
  checkboxList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  checkboxLabel: { fontSize: '13px', color: '#555', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  saveBtn: { backgroundColor: '#008bdc', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '4px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }
};

export default YourPreferences;