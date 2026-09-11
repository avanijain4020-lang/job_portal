import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (token && user.role) {
      const userRole = user.role.toLowerCase();
      if (userRole === 'recruiter' || userRole === 'employer') {
        navigate('/employer-dashboard', { replace: true });
      } else {
        navigate('/candidate-dashboard', { replace: true });
      }
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'candidate',
    companyName: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    // FIX 1: Direct Express API Endpoints Match
    const endpoint = isSignUp ? '/register' : '/login';

    try {
      const res = await API.post(endpoint, formData);
      
      localStorage.setItem('token', res.data.token || 'valid-token');
      localStorage.setItem('user', JSON.stringify(res.data.user || { role: formData.role }));

      // FIX 2: Correct Dashboard Redirects
      const userRole = (res.data.user?.role || formData.role).toLowerCase();
      if (userRole === 'recruiter' || userRole === 'employer') {
        navigate('/employer-dashboard', { replace: true });
      } else {
        navigate('/candidate-dashboard', { replace: true });
      }
      
      window.location.reload();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        
        {/* Form Panel */}
        <div style={{ ...formSectionStyle, order: isSignUp ? 2 : 1 }}>
          <div style={{ width: '100%', maxWidth: '380px' }}>
            <div style={{ marginBottom: '1.8rem' }}>
              <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                {isSignUp ? 'Create an Account' : 'Welcome Back'}
              </h2>
              <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0 }}>
                {isSignUp ? 'Join our platform to discover career opportunities' : 'Please enter your credentials to sign in'}
              </p>
            </div>

            {errorMsg && (
              <div style={errorBannerStyle}>
                <span>⚠️ {errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {isSignUp && (
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
              )}

              <div>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ ...inputStyle, paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={eyeButtonStyle}
                  >
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <>
                  <div>
                    <label style={labelStyle}>I am joining as</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.3rem' }}>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'candidate' })}
                        style={{
                          ...roleCardStyle,
                          borderColor: formData.role === 'candidate' ? '#1e3a8a' : '#cbd5e1',
                          backgroundColor: formData.role === 'candidate' ? '#eff6ff' : '#f8fafc',
                          color: formData.role === 'candidate' ? '#1e3a8a' : '#475569'
                        }}
                      >
                        🧑‍🎓 Candidate
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'recruiter' })}
                        style={{
                          ...roleCardStyle,
                          borderColor: formData.role === 'recruiter' ? '#1e3a8a' : '#cbd5e1',
                          backgroundColor: formData.role === 'recruiter' ? '#eff6ff' : '#f8fafc',
                          color: formData.role === 'recruiter' ? '#1e3a8a' : '#475569'
                        }}
                      >
                        💼 Employer
                      </button>
                    </div>
                  </div>

                  {formData.role === 'recruiter' && (
                    <div>
                      <label style={labelStyle}>Company Name</label>
                      <input
                        type="text"
                        name="companyName"
                        required
                        placeholder="e.g. TechCorp Solutions"
                        value={formData.companyName}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    </div>
                  )}
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...primaryBtnStyle,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>

        {/* Dynamic Side Decorative Panel */}
        <div style={{ ...sidePanelStyle, order: isSignUp ? 1 : 2 }}>
          <div style={{ maxWidth: '320px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.85rem', fontWeight: '800', marginBottom: '0.8rem', lineHeight: '1.3', color: '#ffffff' }}>
              {isSignUp ? 'Already Registered?' : 'New to JobPortal?'}
            </h3>
            <p style={{ color: '#93c5fd', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '2.2rem' }}>
              {isSignUp
                ? 'Log in to your account to track job applications and manage your profile.'
                : 'Sign up today to explore top internships, tech roles, and hire top talent.'}
            </p>

            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg('');
              }}
              style={outlineBtnStyle}
            >
              {isSignUp ? 'Sign In Instead' : 'Create an Account'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

const containerStyle = { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0b1329', padding: '1.5rem' };
const cardStyle = { width: '100%', maxWidth: '920px', minHeight: '560px', backgroundColor: '#ffffff', borderRadius: '20px', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4)', display: 'flex', overflow: 'hidden' };
const formSectionStyle = { flex: 1, padding: '3rem 2.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const sidePanelStyle = { flex: '0.9', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)', color: '#ffffff', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' };
const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.35rem' };
const inputStyle = { width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#0f172a' };
const eyeButtonStyle = { position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.7 };
const roleCardStyle = { padding: '0.65rem 0.5rem', borderRadius: '8px', border: '1.5px solid', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', textAlign: 'center' };
const primaryBtnStyle = { width: '100%', padding: '0.85rem', borderRadius: '10px', border: 'none', backgroundColor: '#1e3a8a', color: '#ffffff', fontWeight: '700', fontSize: '0.95rem', marginTop: '0.5rem', boxShadow: '0 4px 14px rgba(30, 58, 138, 0.3)' };
const outlineBtnStyle = { padding: '0.75rem 2rem', borderRadius: '30px', border: '2px solid rgba(255, 255, 255, 0.8)', backgroundColor: 'transparent', color: '#ffffff', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' };
const errorBannerStyle = { backgroundColor: '#fef2f2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '500', marginBottom: '1.2rem', border: '1px solid #fecaca' };

export default Auth;