import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css'; 

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminUsersPage from './pages/AdminUsersPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SetPasswordPage from './pages/SetPasswordPage'; 
import ProtectedRoute from './components/ProtectedRoute';
// 1. Import your new Admin page here
import AdminUsersPage from './pages/AdminUsersPage'; 

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<LandingPage onNavigate={() => navigate('/login', { replace: true })} />} />
      <Route path="/login" element={<LoginPage onNavigateToReset={() => navigate('/reset-password')} />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/set-password" element={<SetPasswordPage />} />
      <Route path="/admin/users" element={<ProtectedRoute>
 <AdminUsersPage />
  </ProtectedRoute>
} />
      
      {/* 2. Add the route for your Admin page here */}
      <Route path="/admin-users" element={<AdminUsersPage />} />
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