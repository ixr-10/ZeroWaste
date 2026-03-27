import React, { useState, useEffect } from 'react';
import '../styles/AdminUsersPage.css';

import {
  FiPieChart,
  FiFileText,
  FiUsers,
  FiDownload,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiSearch
} from 'react-icons/fi';

import { FaTrashAlt, FaStar, FaRegStar } from 'react-icons/fa';

const AdminUsersPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch mock data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      setTimeout(() => {
        const mockData = [
          { id: 1, rank: '🥇', username: 'User_1', email: 'User_1@gmail.com', donations: 59, score: 4.9, status: 'Active', isFoodSaver: true },
          { id: 2, rank: '🥈', username: 'User_2', email: 'User_2@gmail.com', donations: 50, score: 4.7, status: 'Active', isFoodSaver: false },
          { id: 3, rank: '🥉', username: 'User_3', email: 'User_3@gmail.com', donations: 45, score: 4.5, status: 'Active', isFoodSaver: true },
          { id: 4, rank: '#4', username: 'User_4', email: 'User_4@gmail.com', donations: 40, score: 4.3, status: 'Inactive', isFoodSaver: false },
          { id: 5, rank: '#5', username: 'User_5', email: 'User_5@gmail.com', donations: 35, score: 4.0, status: 'Active', isFoodSaver: false },
          { id: 6, rank: '#6', username: 'User_6', email: 'User_6@gmail.com', donations: 32, score: 3.8, status: 'Inactive', isFoodSaver: false },
          { id: 7, rank: '#7', username: 'User_7', email: 'User_7@gmail.com', donations: 30, score: 3.5, status: 'Active', isFoodSaver: false }
        ];

        setUsers(mockData);
        setIsLoading(false);
      }, 1500);
    };

    fetchData();
  }, []);

  const toggleStar = (userId) => {
    setUsers(
      users.map(user =>
        user.id === userId
          ? { ...user, isFoodSaver: !user.isFoodSaver }
          : user
      )
    );
  };

  const deleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      setUsers(users.filter(user => user.id !== userId));
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
          <div className="menu-item">
            <span className="admin-icon"><FiPieChart /></span>
            {isSidebarOpen && <span className="menu-text">Statistics</span>}
          </div>

          <div className="menu-item">
            <span className="admin-icon"><FiFileText /></span>
            {isSidebarOpen && <span className="menu-text">Reports</span>}
          </div>

          <div className="menu-item active">
            <span className="admin-icon"><FiUsers /></span>
            {isSidebarOpen && <span className="menu-text">Users</span>}
          </div>

          <div className="menu-item">
            <span className="admin-icon"><FiDownload /></span>
            {isSidebarOpen && <span className="menu-text">Export data</span>}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="avatar">👩‍💼</div>
            {isSidebarOpen && <span className="admin-name">Admin Name</span>}
          </div>
          <FiLogOut className="logout-icon" />
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

        {/* TABLE */}
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
      </main>
    </div>
  );
};

export default AdminUsersPage;