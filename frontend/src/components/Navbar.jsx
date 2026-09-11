import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, isEmployer }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Auth/session keys remove karein
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');

    // 2. Direct hard navigation karein
    window.location.href = '/login';
  };

  return (
    <nav style={styles.nav}>
      <Link to={isEmployer ? "/employer-dashboard" : "/candidate-dashboard"} style={styles.brandLink}>
        <div style={styles.brand}>JobPortal</div>
      </Link>

      <div style={styles.menu}>
        {!isEmployer && (
          <>
            <Link to="/candidate-dashboard" style={styles.link}>Dashboard</Link>
            <Link to="/my-applications" style={styles.link}>My Applications</Link>
          </>
        )}

        {/* PROFILE DROPDOWN TRIGGER */}
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => setShowDropdown(!showDropdown)} 
            style={styles.profileBadge}
          >
            <div style={styles.avatar}>
              {(user?.name || user?.fullName || 'A').charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '12px' }}>▼</span>
          </div>

          {/* DROPDOWN MENU */}
          {showDropdown && (
            <div style={styles.dropdown}>
              <div style={styles.userInfo}>
                <strong style={{ color: '#0f172a', display: 'block' }}>{user?.name || 'Avani Barmecha'}</strong>
                <span style={{ color: '#64748b', fontSize: '13px' }}>{user?.email || 'avani@gmail.com'}</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
              
              {/* Home Link (Dynamic based on role) */}
              <Link 
                to={isEmployer ? "/employer-dashboard" : "/candidate-dashboard"} 
                onClick={() => setShowDropdown(false)} 
                style={styles.dropdownItem}
              >
                Home
              </Link>

              {/* Candidate Only Links */}
              {!isEmployer && (
                <>
                  <Link to="/my-applications" onClick={() => setShowDropdown(false)} style={styles.dropdownItem}>My Applications</Link>
                  <Link to="/edit-resume" onClick={() => setShowDropdown(false)} style={styles.dropdownItem}>Edit Resume</Link>
                  <Link to="/edit-preferences" onClick={() => setShowDropdown(false)} style={styles.dropdownItem}>Edit Preferences</Link>
                </>
              )}
              
              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 40px', backgroundColor: '#0b1329', borderBottom: '1px solid #1e293b' },
  brandLink: { textDecoration: 'none' },
  brand: { fontSize: '22px', fontWeight: 'bold', color: '#3b82f6' },
  menu: { display: 'flex', alignItems: 'center', gap: '20px' },
  link: { color: '#cbd5e1', textDecoration: 'none', fontSize: '15px', fontWeight: '500' },
  profileBadge: { display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#fff' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  dropdown: { position: 'absolute', right: 0, top: '45px', backgroundColor: '#ffffff', borderRadius: '8px', width: '220px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', padding: '12px 0', zIndex: 100 },
  userInfo: { padding: '0 16px' },
  dropdownItem: { display: 'block', padding: '8px 16px', color: '#334155', textDecoration: 'none', fontSize: '14px', transition: 'background 0.2s' },
  logoutBtn: { width: '100%', border: 'none', backgroundColor: 'transparent', color: '#ef4444', textAlign: 'left', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }
};

export default Navbar;