import React, { useState, useEffect } from 'react';
import '../styles/AdminUsersPage.css';

// نحينا لي زيكون تاع الموني القدام، وخلينا غير لي نحتاجوهم للبحث والأسهم
import {
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiSearch
} from 'react-icons/fi';

import { FaTrashAlt, FaStar, FaRegStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/api';
import { adminListUsers, promoteToFoodSaver,demoteFromFoodSaver,  adminDeleteUser } from '../services/api';
const AdminUsersPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const adminName = user.username || 'Admin';
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = async () => {
  await logoutUser();
  navigate('/login');
};
 useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await adminListUsers();
      const mapped = data.users.map((user, index) => ({
        id: user.id,
        rank: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`,
        username: user.username,
        email: user.email,
        donations: user.reputation_score ?? 0,
        score: ((user.reputation_score ?? 0) / 10).toFixed(1),
        status: user.is_verified ? 'Active' : 'Inactive',
        isFoodSaver: user.role === 'food_saver',
      }));
      setUsers(mapped);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setIsLoading(false);
    }
  };
  fetchData();
}, []);

const toggleStar = async (userId) => {
  const user = users.find(u => u.id === userId);
  try {
    if (user.isFoodSaver) {
      await demoteFromFoodSaver(userId);
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, isFoodSaver: false } : u
      ));
    } else {
      await promoteToFoodSaver(userId);
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, isFoodSaver: true } : u
      ));
    }
  } catch (err) {
    console.error('Failed to update Food Saver status:', err);
  }
};
const deleteUser = async (userId) => {
  if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
    try {
      await adminDeleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  }
};


  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUsersCount = users.length;
  const activeUsersCount = users.filter(user => user.status === 'Active').length;
  const inactiveUsersCount = users.filter(user => user.status === 'Inactive').length;
  const foodSaversCount = users.filter(user => user.isFoodSaver).length;

  return (
    <div className="admin-dashboard">

      {/* SIDEBAR */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          {isSidebarOpen && <h2 className="logo-text">ZER0<br />WASTE</h2>}
          <button
            className="toggle-btn"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
          </button>
        </div>

        <nav className="sidebar-menu">
          
          {/* 🔴 أيقونة Statistics (Pie Chart) */}
          <div className="menu-item" onClick={() => navigate('/admin/statistics')} style={{ cursor: 'pointer' }}>
            <span className="admin-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path d="M21 11H13V3C17.418 3 21 6.582 21 11ZM11 13V3.061C6.382 3.553 3 7.568 3 12.5C3 17.747 7.253 22 12.5 22C17.432 22 21.447 18.618 21.939 14H11V13Z" />
              </svg>
            </span>
            {isSidebarOpen && <span className="menu-text">Statistics</span>}
          </div>

          {/* 🔴 أيقونة Reports (Document) */}
          <div className="menu-item" onClick={() => navigate('/admin/reports')} style={{ cursor: 'pointer' }}>
            <span className="admin-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path d="M20 22H4C2.897 22 2 21.103 2 20V4C2 2.897 2.897 2 4 2H13.586C14.116 2 14.625 2.211 15 2.586L21.414 9C21.789 9.375 22 9.884 22 10.414V20C22 21.103 21.103 22 20 22ZM13 4V10H19.586L13 3.414V4ZM4 4V20H20V11H12C11.448 11 11 10.552 11 10V4H4Z" />
                <path d="M7 13H17V15H7V13ZM7 17H13V19H7V17Z" />
              </svg>
            </span>
            {isSidebarOpen && <span className="menu-text">Reports</span>}
          </div>

          {/* 🔴 أيقونة Users (Team/Group) - درتها Active */}
          <div className="menu-item active" style={{ cursor: 'pointer' }}>
            <span className="admin-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path d="M12 2C9.243 2 7 4.243 7 7C7 9.757 9.243 12 12 12C14.757 12 17 9.757 17 7C17 4.243 14.757 2 12 2ZM12 10C10.346 10 9 8.654 9 7C9 5.346 10.346 4 12 4C13.654 4 15 5.346 15 7C15 8.654 13.654 10 12 10ZM21 21H3C3 17.134 6.134 14 10 14H14C17.866 14 21 17.134 21 21ZM5.05 19H18.95C18.455 16.726 16.44 15 14 15H10C7.56 15 5.545 16.726 5.05 19Z" />
              </svg>
            </span>
            {isSidebarOpen && <span className="menu-text">Users</span>}
          </div>

          {/* 🔴 أيقونة Export (Download) */}
          <div className="menu-item" onClick={() => navigate('/admin/export')} style={{ cursor: 'pointer' }}>
            <span className="admin-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path d="M19 14V19H5V14H3V20C3 20.552 3.448 21 4 21H20C20.552 21 21 20.552 21 20V14H19ZM11 15.586L6.707 11.293L8.121 9.879L11 12.758V3H13V12.758L15.879 9.879L17.293 11.293L13 15.586C12.448 16.138 11.552 16.138 11 15.586Z" />
              </svg>
            </span>
            {isSidebarOpen && <span className="menu-text">Export data</span>}
          </div>

        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="avatar">👩‍💼</div>
            {isSidebarOpen && <span className="admin-name">{adminName}</span>}
          </div>
          <FiLogOut className="logout-icon"  onClick={handleLogout} style={{ cursor: 'pointer' }}  />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* STATS */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-title">👥 Total Users</div>
            <div className="stat-value">{isLoading ? "..." : totalUsersCount}</div>
          </div>

          <div className="stat-card">
            <div className="stat-title">👤 Active</div>
            <div className="stat-value">{isLoading ? "..." : activeUsersCount}</div>
          </div>

          <div className="stat-card">
            <div className="stat-title">⏸️ Inactive</div>
            <div className="stat-value">{isLoading ? "..." : inactiveUsersCount}</div>
          </div>

          <div className="stat-card">
            <div className="stat-title">👑 Food Savers</div>
            <div className="stat-value">{isLoading ? "..." : foodSaversCount}</div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="table-section">

          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or email ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Donations</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Actions</th>
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
                      <td className="rank-cell">{user.rank}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.donations}</td>
                      <td>{user.score}</td>

                      <td className={user.status === 'Active' ? 'status-active' : 'status-inactive'}>
                        {user.status}
                      </td>

                      <td className="actions-cell">
                        <button
                          className="action-btn star-btn"
                          data-tooltip={user.isFoodSaver ? "Remove FoodSaver status" : "Set as FoodSaver"}
                          onClick={() => toggleStar(user.id)}
                        >
                          {user.isFoodSaver ? <FaStar color="#ffc107" /> : <FaRegStar color="#666" />}
                        </button>

                        <button
                          className="action-btn delete-btn"
                          data-tooltip="Delete account"
                          onClick={() => deleteUser(user.id)}
                        >
                          <FaTrashAlt color="#dc3545" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      No users found matching "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminUsersPage;