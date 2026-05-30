import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminExportPage.css';
import { exportAdminData, logoutUser } from '../services/api';

import {
  FiPieChart, FiFileText, FiUsers, FiDownload,
  FiLogOut, FiChevronLeft, FiChevronRight, FiLayers
} from 'react-icons/fi';
import { FaHandHoldingHeart } from 'react-icons/fa';

const AdminExportPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const user            = JSON.parse(localStorage.getItem('user') || '{}');
  const adminName       = user.username || 'Admin';
  const isLocalAuthority = user.role === 'localauthority';

  const dataOptions = isLocalAuthority
    ? ['Donations', 'Statistics']
    : ['Donations', 'Users', 'Statistics', 'Reports'];

  const [selectedFormat, setSelectedFormat] = useState('.CSV');
  const [selectedDate,   setSelectedDate]   = useState('Last 30 days');
  const [selectedData,   setSelectedData]   = useState('Donations');
  const [isLoading,      setIsLoading]      = useState(false);
  const [error,          setError]          = useState('');
  const [success,        setSuccess]        = useState('');

  useEffect(() => {
    if (isLocalAuthority && ['Users', 'Reports'].includes(selectedData)) {
      setSelectedData('Donations');
    }
  }, []);

  const handleDownload = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await exportAdminData(selectedFormat, selectedDate, selectedData);
      setSuccess(`✅ ${selectedData} exported as ${selectedFormat} successfully!`);
    } catch (err) {
      setError('❌ ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="menu-item" onClick={() => navigate('/admin/statistics')} style={{ cursor: 'pointer' }}>
            <span className="admin-icon"><FiPieChart /></span>
            {isSidebarOpen && <span className="menu-text">Statistics</span>}
          </div>
          {!isLocalAuthority && (
            <>
              <div className="menu-item" onClick={() => navigate('/admin/reports')} style={{ cursor: 'pointer' }}>
                <span className="admin-icon"><FiFileText /></span>
                {isSidebarOpen && <span className="menu-text">Reports</span>}
              </div>
              <div className="menu-item" onClick={() => navigate('/admin/users')} style={{ cursor: 'pointer' }}>
                <span className="admin-icon"><FiUsers /></span>
                {isSidebarOpen && <span className="menu-text">Users</span>}
              </div>
              <div className="menu-item" onClick={() => navigate('/admin/donations')} style={{ cursor: 'pointer' }}>
                <span className="admin-icon"><FaHandHoldingHeart /></span>
                {isSidebarOpen && <span className="menu-text">Donations</span>}
              </div>
            </>
          )}
          <div className="menu-item active" style={{ cursor: 'pointer' }}>
            <span className="admin-icon"><FiDownload /></span>
            {isSidebarOpen && <span className="menu-text">Export data</span>}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="avatar">👩‍💼</div>
            {isSidebarOpen && <span className="admin-name">{adminName}</span>}
          </div>
          <FiLogOut className="logout-icon" style={{ cursor: 'pointer' }} onClick={async () => { await logoutUser(); navigate('/login'); }} />
        </div>
      </aside>

      <main className="main-content export-page-wrapper">
        <div className="export-card">

          <div className="export-header">
            <h2><FiLayers className="title-icon" /> Export data</h2>
            <p>Download platform data for analysis and reporting.</p>
          </div>

          <div className="export-section">
            <h3>File Format</h3>
            <div className="pills-container">
              {['.CSV', '.JSON', '.XLSX'].map(format => (
                <button
                  key={format}
                  className={`export-pill ${selectedFormat === format ? 'active' : ''}`}
                  onClick={() => setSelectedFormat(format)}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          <div className="export-section">
            <h3>Date Range</h3>
            <div className="date-range-container">
              {['Last 7 days', 'Last 30 days', 'Last 3 months', 'This year', 'All time'].map(date => (
                <button
                  key={date}
                  className={`date-row ${selectedDate === date ? 'active' : ''}`}
                  onClick={() => setSelectedDate(date)}
                >
                  {date}
                </button>
              ))}
            </div>
          </div>

          <div className="export-section">
            <h3>Data to Export</h3>
            <div className="pills-container">
              {dataOptions.map(data => (
                <button
                  key={data}
                  className={`export-pill ${selectedData === data ? 'active' : ''}`}
                  onClick={() => setSelectedData(data)}
                >
                  {data}
                </button>
              ))}
            </div>
          </div>

          {error   && <p style={{ color: '#E07A5F', marginBottom: '8px' }}>{error}</p>}
          {success && <p style={{ color: '#588157', marginBottom: '8px' }}>{success}</p>}

          <button
            className="download-btn-large"
            onClick={handleDownload}
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            {isLoading ? 'Exporting...' : 'DOWNLOAD EXPORT'}
          </button>

        </div>
      </main>
    </div>
  );
};

export default AdminExportPage;