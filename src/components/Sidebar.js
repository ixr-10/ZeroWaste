import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <h1 className="logo-text">ZER0<br/>WASTE</h1>
        <button className="collapse-btn">◀</button>
      </div>

      <ul className="sidebar-nav">
        <li className="nav-item">
          <span className="nav-icon">📊</span>
          Statistics
        </li>
        {/* Raki tkhadmi f Reports, donc hiya li tkon active */}
        <li className="nav-item active">
          <span className="nav-icon">📋</span>
          Reports
        </li>
        <li className="nav-item">
          <span className="nav-icon">👤</span>
          Users
        </li>
        <li className="nav-item">
          <span className="nav-icon">📤</span>
          Export data
        </li>
      </ul>

      <div className="sidebar-footer">
        <div className="admin-profile">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png" 
            alt="Admin" 
            className="admin-avatar" 
          />
          <span className="admin-name">Admin Name</span>
        </div>
        <button className="logout-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D35400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;