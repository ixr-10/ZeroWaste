import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css'; 

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminStatisticsPage from './pages/AdminStatisticsPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SetPasswordPage from './pages/SetPasswordPage'; 
import AdminExportPage from './pages/AdminExportPage'; 
import AdminReportsPage from './pages/AdminReportsPage'; 

import PromotionCriteria from './pages/PromotionCriteria'; 
import CreateAccountPage from './pages/CreateAccountPage'; 

import ProtectedRoute from './components/ProtectedRoute';


import AuthorityStatistics from './pages/AuthorityStatistics';
import AuthorityExport from './pages/AuthorityExport';

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<LandingPage onNavigate={() => navigate('/login', { replace: true })} />} />
      <Route path="/login" element={<LoginPage onNavigateToReset={() => navigate('/reset-password')} />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/set-password" element={<SetPasswordPage />} />
      
      {/* Protected Admin Routes */} 
      <Route path="/admin/users" element={<ProtectedRoute><AdminUsersPage /></ProtectedRoute>} />
      <Route path="/admin/statistics" element={<ProtectedRoute><AdminStatisticsPage /></ProtectedRoute>} />
      <Route path="/admin/export" element={<ProtectedRoute><AdminExportPage /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute><AdminReportsPage /></ProtectedRoute>} />
      <Route path="/admin/promotion-criteria" element={<ProtectedRoute><PromotionCriteria /></ProtectedRoute>} />
      <Route path="/admin/users/create" element={<ProtectedRoute><CreateAccountPage /></ProtectedRoute>} />
      
     
      <Route path="/authority/statistics" element={<AuthorityStatistics />} />
      <Route path="/authority/export" element={<AuthorityExport />} />
      
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