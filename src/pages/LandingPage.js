import React, { useEffect } from 'react';
import '../styles/LandingPage.css'; 
import logo from '../assets/Logo.png'; 


function LandingPage({ onNavigate }) {
   useEffect(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }, []);
  return (
    
    <div className="landing-page" onClick={onNavigate} style={{ cursor: 'pointer' }}>
      <div className="logo-group">
        <img src={logo} alt="Logo" className="main-logo" />
        <h2 className="zero-waste-text">ZER0 WASTE</h2>
      </div>
      <h1 className="admin-dashboard-text">ADMIN DASHBOARD</h1>
    </div>
  );
}

export default LandingPage;