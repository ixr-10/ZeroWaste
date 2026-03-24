import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css'; 

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminUsersPage from './pages/AdminUsersPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SetPasswordPage from './pages/SetPasswordPage'; 

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<LandingPage onNavigate={() => navigate('/login')} />} />
      <Route path="/login" element={<LoginPage onNavigateToReset={() => navigate('/reset-password')} />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/set-password" element={<SetPasswordPage />} />
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