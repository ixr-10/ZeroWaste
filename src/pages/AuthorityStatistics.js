import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminUsersPage.css'; 
import '../styles/AdminStatisticsPage.css'; 

import {
  FiPieChart, FiDownload, FiLogOut, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';

const AuthorityStatistics = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  
  const [stats, setStats] = useState(null);
  const [donationsData, setDonationsData] = useState([]);
  const [foodSavedData, setFoodSavedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const chartMaxValue = 100;

  // 2. API 
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        
        // nst response = await fetch('http://localhost:5000/api/authority/stats');
        // const data = await response.json();
        
        // 
        setTimeout(() => {
          setStats({
            totalDonations: 1248,
            donationsAddedThisMonth: 50,
            totalFoodSaved: 300,
            totalCo2Avoided: 300,
            activeUsers: 50,
            thisMonthDonations: 130,
            thisMonthFoodSaved: 50,
            thisMonthCo2: 20
          });

          setDonationsData([
            { month: 'Sept', value: 20 }, { month: 'Oct', value: 45 },
            { month: 'Nov', value: 25 }, { month: 'Dec', value: 30 },
            { month: 'Jan', value: 60 }, { month: 'Feb', value: 35 },
            { month: 'Mar', value: 70 },
          ]);

          setFoodSavedData([
            { month: 'Sept', value: 65 }, { month: 'Oct', value: 20 },
            { month: 'Nov', value: 70 }, { month: 'Dec', value: 35 },
            { month: 'Jan', value: 40 }, { month: 'Feb', value: 30 },
            { month: 'Mar', value: 80 },
          ]);

          setIsLoading(false);
        }, 1000); 

      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div className="loading-screen">Loading Statistics...</div>;
  }

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
          <div className="menu-item active">
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
            {isSidebarOpen && <span className="admin-name">local_authority</span>}
          </div>
          <FiLogOut className="logout-icon" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
        </div>
      </aside>

      <main className="main-content stat-scroll">
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-title">🎁 Total Donations</div>
                <div className="stat-value">{stats?.totalDonations} <span className="stat-subtitle">+{stats?.donationsAddedThisMonth} this month</span></div>
              </div>
              <div className="stat-card">
                <div className="stat-title">🥗 Food Saved</div>
                <div className="stat-value">≈ {stats?.totalFoodSaved}kg</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">🌿 CO2 avoided</div>
                <div className="stat-value">≈ {stats?.totalCo2Avoided}kg</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">👥 Active users</div>
                <div className="stat-value">{stats?.activeUsers}</div>
              </div>
            </div>

            <div className="month-summary-section">
              <h3 className="section-title">This month — March 2026</h3>
              <div className="month-cards-container">
                <div className="month-card">
                  <span className="month-card-title">Donations</span>
                  <span className="month-card-value green-text">{stats?.thisMonthDonations}</span>
                </div>
                <div className="month-card">
                  <span className="month-card-title">Food Saved</span>
                  <span className="month-card-value orange-text">{stats?.thisMonthFoodSaved}kg</span>
                </div>
                <div className="month-card">
                  <span className="month-card-title">CO2 avoided</span>
                  <span className="month-card-value green-text">{stats?.thisMonthCo2}kg</span>
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
                      <div className={`bar ${data.month === 'Mar' ? 'bar-dark-green' : 'bar-light-green'}`} style={{ height: `${(data.value / chartMaxValue) * 100}%` }}></div>
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
                      <div className={`bar ${data.month === 'Mar' ? 'bar-orange' : 'bar-yellow'}`} style={{ height: `${(data.value / chartMaxValue) * 100}%` }}></div>
                      <span className="bar-label">{data.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
      </main>
    </div>
  );
};

export default AuthorityStatistics;