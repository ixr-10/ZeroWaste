import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

import LandingPage         from './pages/LandingPage';
import LoginPage           from './pages/LoginPage';
import AdminUsersPage      from './pages/AdminUsersPage';
import AdminStatisticsPage from './pages/AdminStatisticsPage';
import ResetPasswordPage   from './pages/ResetPasswordPage';
import SetPasswordPage     from './pages/SetPasswordPage';
import AdminExportPage     from './pages/AdminExportPage';
import AdminReportsPage    from './pages/AdminReportsPage';
import AdminDonationsPage  from './pages/AdminDonationsPage';
import PromotionCriteria   from './pages/PromotionCriteria';
import CreateAccountPage   from './pages/CreateAccountPage';
import AuthorityStatistics from './pages/AuthorityStatistics';
import AuthorityExport     from './pages/AuthorityExport';

import ProtectedRoute from './components/ProtectedRoute';

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Public */}
      <Route path="/"               element={<LandingPage onNavigate={() => navigate('/login', { replace: true })} />} />
      <Route path="/login"          element={<LoginPage onNavigateToReset={() => navigate('/reset-password')} />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/set-password"   element={<SetPasswordPage />} />

      {/* Admin only */}
      <Route path="/admin/statistics" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminStatisticsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminUsersPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/export" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminExportPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminReportsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/donations" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDonationsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/promotion-criteria" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <PromotionCriteria />
        </ProtectedRoute>
      } />
      <Route path="/admin/users/create" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <CreateAccountPage />
        </ProtectedRoute>
      } />

      {/* Local Authority only */}
      <Route path="/authority/statistics" element={
        <ProtectedRoute allowedRoles={['localauthority']}>
          <AuthorityStatistics />
        </ProtectedRoute>
      } />
      <Route path="/authority/export" element={
        <ProtectedRoute allowedRoles={['localauthority']}>
          <AuthorityExport />
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