import React, { useState, useEffect, useCallback } from 'react';
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
  FiSearch,
  FiAlertCircle,
} from 'react-icons/fi';

import {
  FaHandHoldingHeart,
  FaStar,
  FaRegStar,
  FaUser,
  FaCheck,
  FaTimes,
} from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';

import {
  adminListUsers,
  adminGetUserStats,
  adminToggleActive,
  adminToggleVerify,
  adminPromoteOrDemoteFoodSaver,
  logoutUser,
} from '../services/api';

// ─── helpers ────────────────────────────────────────────────────────────────

const getRank = (index) => {
  if (index === 0) return '🥇';
  if (index === 1) return '🥈';
  if (index === 2) return '🥉';
  return `#${index + 1}`;
};

const getRankClass = (index) => {
  if (index === 0) return 'rank-1';
  if (index === 1) return 'rank-2';
  if (index === 2) return 'rank-3';
  return 'rank-normal';
};

// ─── component ───────────────────────────────────────────────────────────────

const AdminUsersPage = () => {
  const navigate = useNavigate();

  // ── sidebar ──
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ── data ──
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, food_savers: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── filters ──
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // ── tooltip ──
  const [tooltip, setTooltip] = useState({ text: '', x: 0, y: 0, visible: false });

  // ── action loading state (per user) ──
  const [pendingActions, setPendingActions] = useState({});

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const adminName = user.username || 'Admin';

  // ── fetch ────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersRes, statsRes] = await Promise.all([
        adminListUsers(),
        adminGetUserStats(),
      ]);
      // backend returns { count, users: [...] }, sorted by -reputation_score
      setUsers(usersRes.users || []);
      setStats(statsRes);
    } catch (err) {
      setError('Failed to load users. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── actions ──────────────────────────────────────────────────────────────

  const setPending = (userId, key, value) =>
    setPendingActions((prev) => ({ ...prev, [`${userId}_${key}`]: value }));

  const isPending = (userId, key) => !!pendingActions[`${userId}_${key}`];

  const toggleStar = async (userId, currentIsFoodSaver) => {
    if (isPending(userId, 'star')) return;
    setPending(userId, 'star', true);
    try {
      await adminPromoteOrDemoteFoodSaver(userId, currentIsFoodSaver);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: currentIsFoodSaver ? 'user' : 'food_saver' } : u
        )
      );
      const statsRes = await adminGetUserStats();
      setStats(statsRes);
    } catch {
      setError('Failed to update Food Saver status.');
    } finally {
      setPending(userId, 'star', false);
    }
  };

  const toggleUserStatus = async (userId) => {
    if (isPending(userId, 'status')) return;
    setPending(userId, 'status', true);
    try {
      const res = await adminToggleActive(userId);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: res.is_active } : u))
      );
      const statsRes = await adminGetUserStats();
      setStats(statsRes);
    } catch {
      setError('Failed to update account status.');
    } finally {
      setPending(userId, 'status', false);
    }
  };

  const toggleVerification = async (userId) => {
    if (isPending(userId, 'verify')) return;
    setPending(userId, 'verify', true);
    try {
      const res = await adminToggleVerify(userId);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_verified: res.is_verified } : u))
      );
    } catch {
      setError('Failed to update verification status.');
    } finally {
      setPending(userId, 'verify', false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  // ── tooltip ──────────────────────────────────────────────────────────────

  const handleMouseEnter = (e, text) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      text,
      x: rect.left + rect.width / 2,
      y: rect.bottom + window.scrollY + 8,
      visible: true,
    });
  };

  const handleMouseLeave = () => setTooltip((prev) => ({ ...prev, visible: false }));

  // ── filtering ────────────────────────────────────────────────────────────

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'Active' && u.is_active) ||
      (statusFilter === 'Inactive' && !u.is_active);
    const matchesRole =
      roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // ── render ───────────────────────────────────────────────────────────────

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
          <div className="menu-item" onClick={() => navigate('/admin/statistics')} style={{ cursor: 'pointer' }}>
            <span className="admin-icon"><FiPieChart /></span>
            {isSidebarOpen && <span className="menu-text">Statistics</span>}
          </div>
          <div className="menu-item" onClick={() => navigate('/admin/reports')} style={{ cursor: 'pointer' }}>
            <span className="admin-icon"><FiFileText /></span>
            {isSidebarOpen && <span className="menu-text">Reports</span>}
          </div>
          <div className="menu-item active" style={{ cursor: 'pointer' }}>
            <span className="admin-icon"><FiUsers /></span>
            {isSidebarOpen && <span className="menu-text">Users</span>}
          </div>
          <div className="menu-item" onClick={() => navigate('/admin/donations')} style={{ cursor: 'pointer' }}>
            <span className="admin-icon"><FaHandHoldingHeart /></span>
            {isSidebarOpen && <span className="menu-text">Donations</span>}
          </div>
          <div className="menu-item" onClick={() => navigate('/admin/export')} style={{ cursor: 'pointer' }}>
            <span className="admin-icon"><FiDownload /></span>
            {isSidebarOpen && <span className="menu-text">Export data</span>}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="avatar">👩‍💼</div>
            {isSidebarOpen && <span className="admin-name">{adminName}</span>}
          </div>
          <FiLogOut className="logout-icon" style={{ cursor: 'pointer' }} onClick={handleLogout} />
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="main-content admin-users-page">

        {/* ERROR BANNER */}
        {error && (
          <div className="error-banner">
            <FiAlertCircle />
            <span>{error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* STATS CARDS */}
        <div className="stats-container">
          <div
            className={`stat-card ${statusFilter === 'all' && roleFilter === 'all' ? 'stat-card-active' : ''}`}
            onClick={() => { setStatusFilter('all'); setRoleFilter('all'); }}
          >
            <div className="stat-title">👥 Total Users</div>
            <div className="stat-content">
              <div className="stat-value">{isLoading ? '...' : stats.total}</div>
              <button
                className="stat-action-btn"
                onMouseEnter={(e) => handleMouseEnter(e, 'Create a new account')}
                onMouseLeave={handleMouseLeave}
                onClick={(e) => { e.stopPropagation(); navigate('/admin/users/create'); }}
              >
                <FiPlus />
              </button>
            </div>
          </div>

          <div
            className={`stat-card ${statusFilter === 'Active' ? 'stat-card-active' : ''}`}
            onClick={() => { setStatusFilter('Active'); setRoleFilter('all'); }}
          >
            <div className="stat-title">👤 Active</div>
            <div className="stat-content">
              <div className="stat-value">{isLoading ? '...' : stats.active}</div>
            </div>
          </div>

          <div
            className={`stat-card ${statusFilter === 'Inactive' ? 'stat-card-active' : ''}`}
            onClick={() => { setStatusFilter('Inactive'); setRoleFilter('all'); }}
          >
            <div className="stat-title">⏸️ Inactive</div>
            <div className="stat-content">
              <div className="stat-value">{isLoading ? '...' : stats.inactive}</div>
            </div>
          </div>

          <div
            className={`stat-card ${roleFilter === 'food_saver' ? 'stat-card-active' : ''}`}
            onClick={() => { setRoleFilter(prev => prev === 'food_saver' ? 'all' : 'food_saver'); setStatusFilter('all'); }}
          >
            <div className="stat-title">👑 Food Savers</div>
            <div className="stat-content">
              <div className="stat-value">{isLoading ? '...' : stats.food_savers}</div>
              <button
                className="stat-action-btn"
                onMouseEnter={(e) => handleMouseEnter(e, 'Set FoodSaver promotion criteria')}
                onMouseLeave={handleMouseLeave}
                onClick={(e) => { e.stopPropagation(); navigate('/admin/promotion-criteria'); }}
              >
                <FiRefreshCw />
              </button>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="table-section">

          {/* SEARCH + REFRESH */}
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className="refresh-btn"
              onClick={fetchData}
              title="Refresh"
              disabled={isLoading}
            >
              <FiRefreshCw className={isLoading ? 'spinning' : ''} />
            </button>
          </div>

          {/* TABLE */}
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
                  filteredUsers.map((u, index) => {
                    const isFoodSaver = u.role === 'food_saver';
                    const rank = getRank(index);
                    const rankClass = getRankClass(index);

                    return (
                      <tr key={u.id}>
                        <td className="rank-cell">
                          <div className={`badge-rank ${rankClass}`}>{rank}</div>
                        </td>

                        <td className="fw-500">{u.username}</td>

                        <td className="email-cell" title={u.email}>{u.email}</td>

                        <td className="text-center">{u.donation_count ?? 0}</td>

                        <td className="text-center fw-500">{u.reputation_score}</td>

                        <td className={`text-center ${u.is_active ? 'status-active' : 'status-inactive'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </td>

                        <td className="actions-cell">
                          {/* ── Verify / Unverify ── */}
                          <button
                            className={`action-btn ${isPending(u.id, 'verify') ? 'btn-pending' : ''}`}
                            onMouseEnter={(e) => handleMouseEnter(e, u.is_verified ? 'Remove verification' : 'Verify user')}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => { toggleVerification(u.id); handleMouseLeave(); }}
                            disabled={isPending(u.id, 'verify')}
                          >
                            {u.is_verified ? (
                              <FaCheck color="#27ae60" style={{ width: 18, height: 18, minWidth: 18 }} />
                            ) : (
                              <FaTimes color="#e74c3c" style={{ width: 20, height: 20, minWidth: 20 }} />
                            )}
                          </button>

                          {/* ── Food Saver star ── */}
                          <button
                            className={`action-btn ${isPending(u.id, 'star') ? 'btn-pending' : ''}`}
                            onMouseEnter={(e) => handleMouseEnter(e, isFoodSaver ? 'Remove FoodSaver status' : 'Set as FoodSaver')}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => { toggleStar(u.id, isFoodSaver); handleMouseLeave(); }}
                            disabled={isPending(u.id, 'star')}
                          >
                            {isFoodSaver ? (
                              <FaStar color="#f1c40f" style={{ width: 20, height: 20, minWidth: 20 }} />
                            ) : (
                              <FaRegStar color="#bdc3c7" style={{ width: 20, height: 20, minWidth: 20 }} />
                            )}
                          </button>

                          {/* ── Activate / Deactivate ── */}
                          <button
                            className={`action-btn ${isPending(u.id, 'status') ? 'btn-pending' : ''}`}
                            onMouseEnter={(e) => handleMouseEnter(e, u.is_active ? 'Deactivate account' : 'Activate account')}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => { toggleUserStatus(u.id); handleMouseLeave(); }}
                            disabled={isPending(u.id, 'status')}
                          >
                            <FaUser
                              color={u.is_active ? '#2ecc71' : '#f39c12'}
                              style={{ width: 18, height: 18, minWidth: 18 }}
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  })
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