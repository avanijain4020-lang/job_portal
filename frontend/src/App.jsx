import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import CandidateDashboard from './pages/Home';
import EmployerDashboard from './pages/RecruiterDashboard';
import MyApplications from './pages/MyApplications';
import EditResume from './pages/EditResume';
import EditPreferences from './pages/EditPreferences';

function App() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const isEmployer = 
    user?.role?.toLowerCase() === 'employer' || 
    user?.role?.toLowerCase() === 'recruiter' ||
    user?.userType?.toLowerCase() === 'employer';

  return (
    <Router>
      <div style={{ backgroundColor: '#090d16', minHeight: '100vh', color: '#fff' }}>
        {token && <Navbar user={user} isEmployer={isEmployer} />}

        <Routes>
          <Route 
            path="/" 
            element={
              !token ? (
                <Navigate to="/login" replace />
              ) : isEmployer ? (
                <Navigate to="/employer-dashboard" replace />
              ) : (
                <Navigate to="/candidate-dashboard" replace />
              )
            } 
          />

          <Route 
            path="/login" 
            element={
              !token ? (
                <Auth />
              ) : isEmployer ? (
                <Navigate to="/employer-dashboard" replace />
              ) : (
                <Navigate to="/candidate-dashboard" replace />
              )
            } 
          />

          {/* Candidate Routes */}
          <Route 
            path="/candidate-dashboard" 
            element={token && !isEmployer ? <CandidateDashboard /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/my-applications" 
            element={token && !isEmployer ? <MyApplications /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/edit-resume" 
            element={token && !isEmployer ? <EditResume /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/edit-preferences" 
            element={token && !isEmployer ? <EditPreferences /> : <Navigate to="/login" replace />} 
          />

          {/* Employer Route */}
          <Route 
            path="/employer-dashboard" 
            element={token && isEmployer ? <EmployerDashboard /> : <Navigate to="/login" replace />} 
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;