import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminUsersPage.css';
import '../styles/AdminStatisticsPage.css';
import { fetchAdminStatistics, logoutUser } from '../services/api';
import { FiPieChart, FiDownload, FiLogOut, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const AuthorityStatisticsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const adminName = user.username || 'Admin';

  const [stats, setStats] = useState({
    totalDonations: 0,
    donationsAddedThisMonth: 0,
    totalFoodSaved: 0,
    totalCo2Avoided: 0,
    activeUsers: 0,
    thisMonthDonations: 0,
    thisMonthFoodSaved: 0,
    thisMonthCo2: 0,
  });

  const [donationsData, setDonationsData] = useState([]);
  const [foodSavedData, setFoodSavedData] = useState([]);
  const [co2Data,       setCo2Data]       = useState([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [error,         setError]         = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchAdminStatistics();
        setStats(data.generalStats);
        setDonationsData(data.charts.donations);
        setFoodSavedData(data.charts.foodSaved);
        setCo2Data(data.charts.co2 || []);
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError('Failed to load statistics. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const allValues     = [...donationsData.map(d => d.value), ...foodSavedData.map(d => d.value)];
  const chartMaxValue = Math.max(...allValues, 0) * 1.1 || 100;
  const co2MaxValue   = Math.max(...co2Data.map(d => d.value), 0) * 1.1 || 100;
  const currentMonthLabel = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const carKm       = Math.round(stats.totalCo2Avoided * 6.5);
  const treesNeeded = Math.round(stats.totalCo2Avoided / 21);

  return (
    <div className="admin-dashboard">
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          {isSidebarOpen && <h2 className="logo-text">ZER0<br />WASTE</h2>}
          <button className="toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
          </button>
        </div>

        <nav className="sidebar-menu">
          <div className="menu-item active" style={{ cursor: 'pointer' }}>
            <span className="admin-icon"><FiPieChart /></span>
            {isSidebarOpen && <span className="menu-text">Statistics</span>}
          </div>
          <div className="menu-item" onClick={() => navigate('/authority/export')} style={{ cursor: 'pointer' }}>
            <span className="admin-icon"><FiDownload /></span>
            {isSidebarOpen && <span className="menu-text">Export data</span>}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="avatar">👩‍💼</div>
            {isSidebarOpen && <span className="admin-name">{adminName}</span>}
          </div>
          <FiLogOut className="logout-icon" style={{ cursor: 'pointer' }}
            onClick={async () => { await logoutUser(); navigate('/login'); }} />
        </div>
      </aside>

      <main className="main-content stat-scroll">
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.2rem' }}>Loading data... ⏳</div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'red', fontSize: '1.1rem' }}>{error}</div>
        ) : (
          <>
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-title">🎁 Total Donations</div>
                <div className="stat-value">{stats.totalDonations}{' '}
                  <span className="stat-subtitle">+{stats.donationsAddedThisMonth} this month</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-title">🥗 Food Saved</div>
                <div className="stat-value">≈ {stats.totalFoodSaved} kg</div>
                <div className="stat-subtitle">normalized across all units</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">🌿 CO₂ Avoided</div>
                <div className="stat-value">≈ {stats.totalCo2Avoided} kg</div>
                <div className="stat-subtitle">🚗 {carKm} km of driving · 🌳 {treesNeeded} trees/year</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">👥 Active Users</div>
                <div className="stat-value">{stats.activeUsers}</div>
                <div className="stat-subtitle">last 30 days</div>
              </div>
            </div>

            <div className="month-summary-section">
              <h3 className="section-title">This month — {currentMonthLabel}</h3>
              <div className="month-cards-container">
                <div className="month-card">
                  <span className="month-card-title">Donations</span>
                  <span className="month-card-value green-text">{stats.thisMonthDonations}</span>
                </div>
                <div className="month-card">
                  <span className="month-card-title">Food Saved</span>
                  <span className="month-card-value orange-text">{stats.thisMonthFoodSaved} kg</span>
                </div>
                <div className="month-card">
                  <span className="month-card-title">CO₂ Avoided</span>
                  <span className="month-card-value green-text">{stats.thisMonthCo2} kg</span>
                </div>
              </div>
            </div>

            <div className="charts-section">
              <div className="chart-box">
                <h3 className="section-title">Monthly Donations</h3>
                <div className="bars-container">
                  {donationsData.map((data, index) => (
                    <div className="bar-wrapper" key={index}>
                      <span className="bar-value">{data.value}</span>
                      <div className={`bar ${index === donationsData.length - 1 ? 'bar-dark-green' : 'bar-light-green'}`}
                        style={{ height: `${(data.value / chartMaxValue) * 100}%` }} />
                      <span className="bar-label">{data.month}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="chart-box">
                <h3 className="section-title">Food Saved (kg)</h3>
                <div className="bars-container">
                  {foodSavedData.map((data, index) => (
                    <div className="bar-wrapper" key={index}>
                      <span className="bar-value">{data.value}</span>
                      <div className={`bar ${index === foodSavedData.length - 1 ? 'bar-orange' : 'bar-yellow'}`}
                        style={{ height: `${(data.value / chartMaxValue) * 100}%` }} />
                      <span className="bar-label">{data.month}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="chart-box">
                <h3 className="section-title">CO₂ Avoided (kg)</h3>
                <div className="bars-container">
                  {co2Data.map((data, index) => (
                    <div className="bar-wrapper" key={index}>
                      <span className="bar-value">{data.value}</span>
                      <div className={`bar ${index === co2Data.length - 1 ? 'bar-dark-green' : 'bar-light-green'}`}
                        style={{ height: `${(data.value / co2MaxValue) * 100}%` }} />
                      <span className="bar-label">{data.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AuthorityStatisticsPage;