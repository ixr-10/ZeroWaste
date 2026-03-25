import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css'; 

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminUsersPage from './pages/AdminUsersPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SetPasswordPage from './pages/SetPasswordPage'; 
import ProtectedRoute from './components/ProtectedRoute';


function clearExpiredToken() {
  const token = localStorage.getItem('access_token');
  if (!token) return;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    if (isExpired) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  } catch {
    // token is malformed, clear it
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
}

function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    clearExpiredToken();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage onNavigate={() => navigate('/login', { replace: true })} />} />
      <Route path="/login" element={<LoginPage onNavigateToReset={() => navigate('/reset-password')} />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/set-password" element={<SetPasswordPage />} />
      <Route path="/admin/users" element={
        <ProtectedRoute>
          <AdminUsersPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;