import React, { useState } from 'react';
import '../styles/AdminUsersPage.css';

import {
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiPieChart,
  FiFileText,
  FiUsers,
  FiDownload,
  FiPlus,
  FiRefreshCw,
  FiSearch
} from 'react-icons/fi';

import { 
  FaHandHoldingHeart, 
  FaStar, 
  FaRegStar, 
  FaUser, 
  FaCheck,
  FaTimes
} from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';

const AdminUsersPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tooltip 
  const [tooltip, setTooltip] = useState({ text: '', x: 0, y: 0, visible: false });

  const handleMouseEnter = (e, text) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      text: text,
      x: rect.left + rect.width / 2,
      y: rect.bottom + window.scrollY + 8,
      visible: true
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };
  
  // Fake Data ghi bech nchof ida design rah msgm  mb3d nsupimi jdha
  const [users, setUsers] = useState([
    { id: 1, rank: '🥇', username: 'User_1', email: 'User_1@gmail.com', donations: 59, score: '4.9', status: 'Active', isFoodSaver: true, isVerified: true },
    { id: 2, rank: '🥈', username: 'User_2', email: 'User_2@gmail.com', donations: 50, score: '4.7', status: 'Active', isFoodSaver: false, isVerified: false },
    { id: 3, rank: '🥉', username: 'User_3', email: 'User_3@gmail.com', donations: 45, status: 'Active', isFoodSaver: true, isVerified: true },
    { id: 4, rank: '#4', username: 'User_4', email: 'User_4@gmail.com', donations: 40, score: '4.3', status: 'Inactive', isFoodSaver: false, isVerified: true },
    { id: 5, rank: '#5', username: 'User_5', email: 'User_5@gmail.com', donations: 35, score: '4.0', status: 'Active', isFoodSaver: false, isVerified: false },
    { id: 6, rank: '#6', username: 'User_6', email: 'User_6@gmail.com', donations: 32, score: '3.8', status: 'Inactive', isFoodSaver: false, isVerified: true },
    { id: 7, rank: '#7', username: 'User_7', email: 'User_7@gmail.com', donations: 30, score: '3.5', status: 'Active', isFoodSaver: false, isVerified: false }
  ]);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const adminName = user.username || 'Admin Name';
  
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const handleLogout = async () => { navigate('/login'); };

  const toggleStar = async (userId) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isFoodSaver: !u.isFoodSaver } : u));
  };

  const toggleUserStatus = async (userId) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
  };

  const toggleVerification = async (userId) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: !u.isVerified } : u));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalUsersCount = users.length;
  const activeUsersCount = users.filter(user => user.status === 'Active').length;
  const inactiveUsersCount = users.filter(user => user.status === 'Inactive').length;
  const foodSaversCount = users.filter(user => user.isFoodSaver).length;

  return (
    <div className="admin-dashboard">
      {/* ===== SIDEBAR ===== */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          {isSidebarOpen && <h2 className="logo-text">ZER0<br />WASTE</h2>}
          <button className="toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
          </button>
        </div>

        <nav className="sidebar-menu">
          <div className="menu-item" onClick={() => navigate('/admin/statistics')}>
            <span className="admin-icon"><FiPieChart /></span>
            {isSidebarOpen && <span className="menu-text">Statistics</span>}
          </div>
          <div className="menu-item" onClick={() => navigate('/admin/reports')}>
            <span className="admin-icon"><FiFileText /></span>
            {isSidebarOpen && <span className="menu-text">Reports</span>}
          </div>
          <div className="menu-item active">
            <span className="admin-icon"><FiUsers /></span>
            {isSidebarOpen && <span className="menu-text">Users</span>}
          </div>
          <div className="menu-item" onClick={() => navigate('/admin/donations')}>
            <span className="admin-icon"><FaHandHoldingHeart /></span>
            {isSidebarOpen && <span className="menu-text">Donations</span>}
          </div>
          <div className="menu-item" onClick={() => navigate('/admin/export')}>
            <span className="admin-icon"><FiDownload /></span>
            {isSidebarOpen && <span className="menu-text">Export data</span>}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="avatar">👩‍💼</div>
            {isSidebarOpen && <span className="admin-name">{adminName}</span>}
          </div>
          <FiLogOut className="logout-icon" onClick={handleLogout} />
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="main-content admin-users-page">
        
        {/* STATS CARDS */}
        <div className="stats-container">
          <div className={`stat-card ${statusFilter === 'all' ? 'stat-card-active' : ''}`} onClick={() => setStatusFilter('all')}>
            <div className="stat-title">👥 Total Users</div>
            <div className="stat-content">
              <div className="stat-value">{isLoading ? "..." : totalUsersCount}</div>
              <button 
                className="stat-action-btn" 
                onMouseEnter={(e) => handleMouseEnter(e, "Create a new account")}
                onMouseLeave={handleMouseLeave}
                onClick={(e) => { e.stopPropagation(); navigate('/admin/users/create'); }}
              >
                <FiPlus />
              </button>
            </div>
          </div>
          <div className={`stat-card ${statusFilter === 'Active' ? 'stat-card-active' : ''}`} onClick={() => setStatusFilter('Active')}>
            <div className="stat-title">👤 Active</div>
            <div className="stat-content">
              <div className="stat-value">{isLoading ? "..." : activeUsersCount}</div>
            </div>
          </div>
          <div className={`stat-card ${statusFilter === 'Inactive' ? 'stat-card-active' : ''}`} onClick={() => setStatusFilter('Inactive')}>
            <div className="stat-title">⏸️ Inactive</div>
            <div className="stat-content">
              <div className="stat-value">{isLoading ? "..." : inactiveUsersCount}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">👑 Food Savers</div>
            <div className="stat-content">
              <div className="stat-value">{isLoading ? "..." : foodSaversCount}</div>
              <button 
                className="stat-action-btn" 
                onMouseEnter={(e) => handleMouseEnter(e, "Set FoodSaver promotion criteria")}
                onMouseLeave={handleMouseLeave}
                onClick={(e) => { e.stopPropagation(); navigate('/admin/promotion-criteria'); }}
              >
                <FiRefreshCw />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION TA3 L-TABLE W L-RECHERCHE */}
        <div className="table-section">
          
          {/* SEARCH BAR */}
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name or email...." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* TABLE CONTAINER */}
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th className="th-rank">Rank</th>
                  <th className="th-username">Username</th>
                  <th className="th-email">Email</th>
                  <th className="th-donations">Donations</th>
                  <th className="th-score">Score</th>
                  <th className="th-status">Status</th>
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                      <div className="loader">Loading users data...</div>
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="rank-cell">
                        <div className={`badge-rank ${user.rank === '🥇' ? 'rank-1' : user.rank === '🥈' ? 'rank-2' : user.rank === '🥉' ? 'rank-3' : 'rank-normal'}`}>
                          {user.rank}
                        </div>
                      </td>
                      <td className="fw-500">{user.username}</td>
                      <td className="email-cell" title={user.email}>{user.email}</td>
                      <td className="text-center">{user.donations}</td>
                      <td className="text-center fw-500">{user.score}</td>
                      <td className={`text-center ${user.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                        {user.status}
                      </td>
                      <td className="actions-cell">
                        <button
                          className="action-btn"
                          onMouseEnter={(e) => handleMouseEnter(e, user.isVerified ? "Remove verification" : "Verify user")}
                          onMouseLeave={handleMouseLeave}
                          onClick={() => { toggleVerification(user.id); handleMouseLeave(); }}
                        >
                          {user.isVerified ? (
                            <FaCheck color="#27ae60" style={{ width: '18px', height: '18px', minWidth: '18px' }} />
                          ) : (
                            <FaTimes color="#e74c3c" style={{ width: '20px', height: '20px', minWidth: '20px' }} />
                          )}
                        </button>

                        <button
                          className="action-btn"
                          onMouseEnter={(e) => handleMouseEnter(e, user.isFoodSaver ? "Remove FoodSaver status" : "Set this user as a FoodSaver")}
                          onMouseLeave={handleMouseLeave}
                          onClick={() => { toggleStar(user.id); handleMouseLeave(); }}
                        >
                          {user.isFoodSaver ? (
                            <FaStar color="#f1c40f" style={{ width: '20px', height: '20px', minWidth: '20px' }} />
                          ) : (
                            <FaRegStar color="#bdc3c7" style={{ width: '20px', height: '20px', minWidth: '20px' }} />
                          )}
                        </button>

                        <button
                          className="action-btn"
                          onMouseEnter={(e) => handleMouseEnter(e, user.status === 'Active' ? "Deactivate this account" : "Activate this account")}
                          onMouseLeave={handleMouseLeave}
                          onClick={() => { toggleUserStatus(user.id); handleMouseLeave(); }}
                        >
                          <FaUser color={user.status === 'Active' ? "#2ecc71" : "#f39c12"} style={{ width: '18px', height: '18px', minWidth: '18px' }} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Tooltip */}
      {tooltip.visible && (
        <div 
          className="global-portal-tooltip"
          style={{ top: tooltip.y, left: tooltip.x }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;