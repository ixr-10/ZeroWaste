import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PromotionCriteria.css';

const PromotionCriteria = () => {
  const [score, setScore] = useState(100);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  
  const handleIncrement = () => setScore(prev => prev + 10);
  const handleDecrement = () => setScore(prev => (prev > 0 ? prev - 10 : 0));

  const handleSave = () => {
    alert(`Score ${score} saved successfully!`);
    navigate('/admin/users');
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="admin-dashboard">
      
      {/* ================= SIDEBAR ================= */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          {isSidebarOpen && (
            <div className="logo-text">
              ZERO<br />WASTE
            </div>
          )}
          <button className="toggle-btn" onClick={toggleSidebar}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
            </svg>
          </button>
        </div>

        <div className="sidebar-menu">
          
          <div className="menu-item" onClick={() => navigate('/admin/statistics')}>
            <span className="admin-icon">
              {/* Statistics Icon (Pie Chart) */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
              </svg>
            </span>
            {isSidebarOpen && <span>Statistics</span>}
          </div>

          <div className="menu-item" onClick={() => navigate('/admin/reports')}>
            <span className="admin-icon">
              {/* Reports Icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </span>
            {isSidebarOpen && <span>Reports</span>}
          </div>

          <div className="menu-item active" onClick={() => navigate('/admin/users')}>
            <span className="admin-icon">
              {/* Users Icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </span>
            {isSidebarOpen && <span>Users</span>}
          </div>

          <div className="menu-item" onClick={() => navigate('/admin/export')}>
            <span className="admin-icon">
              {/* Export Data Icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </span>
            {isSidebarOpen && <span>Export data</span>}
          </div>

        </div>

        <div className="sidebar-footer">
          {isSidebarOpen ? (
            <div className="admin-profile">
              <span className="avatar">👩‍💼</span>
              <span className="admin-name">Admin Name</span>
              {/* Logout Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ca5130" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logout-icon" onClick={() => navigate('/login')} style={{cursor: 'pointer'}}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </div>
          ) : (
             <div className="admin-profile" style={{ justifyContent: 'center' }}>
               <span className="avatar">👩‍💼</span>
             </div>
          )}
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="main-content promotion-criteria-content">
        
        {/* Header & Back Button */}
        <div className="header-section">
          <button className="back-button" onClick={() => navigate(-1)}>
            &lt;
          </button>
          <h2>Set FoodSaver promotion criteria</h2>
        </div>

        {/* Center Card */}
        <div className="criteria-card-container">
          <div className="criteria-card">
            <h3>Enter the minimum score required for the user to become a foodsaver:</h3>
            <p>Users who reach this score will automatically become FoodSavers</p>
            
            <div className="counter-container">
              <button className="counter-btn minus" onClick={handleDecrement}>-</button>
              <span className="score-display">{score}</span>
              <button className="counter-btn plus" onClick={handleIncrement}>+</button>
            </div>
          </div>
        </div>

        {/* Action Buttons (Save / Cancel) */}
        <div className="action-buttons">
          <button className="save-btn" onClick={handleSave}>Save</button>
          <button className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
        </div>

      </div>
    </div>
  );
};

export default PromotionCriteria;