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

// 👇 1. Zedt l'importation ta3 la page jdida ta3 Reports hna
import AdminReportsPage from './pages/AdminReportsPage'; 

// راني درت كومونتير للـ ProtectedRoute باش ما تخدمش درك
 import ProtectedRoute from './components/ProtectedRoute';

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<LandingPage onNavigate={() => navigate('/login', { replace: true })} />} />
      <Route path="/login" element={<LoginPage onNavigateToReset={() => navigate('/reset-password')} />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/set-password" element={<SetPasswordPage />} />
     
      {/* 👇 نحينا الحماية مؤقتا باش يفتحولك ديريكت بلا مشاكل */}
       {/* 👇 2. Zedt la route jdida ta3 Reports */}
         {/*
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/statistics" element={<AdminStatisticsPage />} />
          <Route path="/admin/export" element={<AdminExportPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
      */ } 
     
    <Route path="/admin/users" element={<ProtectedRoute><AdminUsersPage /></ProtectedRoute>} />
    <Route path="/admin/statistics" element={<ProtectedRoute><AdminStatisticsPage /></ProtectedRoute>} />
    <Route path="/admin/export" element={<ProtectedRoute><AdminExportPage /></ProtectedRoute>} />
    <Route path="/admin/reports" element={<ProtectedRoute><AdminReportsPage /></ProtectedRoute>} />
      
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