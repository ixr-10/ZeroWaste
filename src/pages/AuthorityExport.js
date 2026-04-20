import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminExportPage.css'; 
import { FiPieChart, FiDownload, FiLogOut, FiChevronLeft, FiChevronRight, FiLayers } from 'react-icons/fi';

const AuthorityExport = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  
  const [selectedFormat, setSelectedFormat] = useState('.CSV');
  const [selectedDate, setSelectedDate] = useState('Last 30 days');
  const [selectedData, setSelectedData] = useState('Donations');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      console.log(`Requesting export: ${selectedData} in ${selectedFormat} for ${selectedDate}`);
      
      // await axios.post('/api/export', { format: selectedFormat, range: selectedDate, type: selectedData });
      
      setTimeout(() => {
        alert("Export successful! Your download will start shortly.");
        setIsExporting(false);
      }, 1500);
    } catch (error) {
      alert("Export failed. Please try again.");
      setIsExporting(false);
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
          <div className="menu-item" onClick={() => navigate('/authority/statistics')} style={{ cursor: 'pointer' }}>
            <span className="admin-icon"><FiPieChart /></span>
            {isSidebarOpen && <span className="menu-text">Statistics</span>}
          </div>
          <div className="menu-item active">
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
                <button key={format} className={`export-pill ${selectedFormat === format ? 'active' : ''}`} onClick={() => setSelectedFormat(format)}>{format}</button>
              ))}
            </div>
          </div>

          <div className="export-section">
            <h3>Date Range</h3>
            <div className="date-range-container">
              {['Last 7 days', 'Last 30 days', 'Last 3 months', 'This year', 'All time'].map(date => (
                <button key={date} className={`date-row ${selectedDate === date ? 'active' : ''}`} onClick={() => setSelectedDate(date)}>{date}</button>
              ))}
            </div>
          </div>

          <div className="export-section">
            <h3>Data to Export</h3>
            <div className="pills-container">
              {['Donations', 'Statistics'].map(data => (
                <button key={data} className={`export-pill ${selectedData === data ? 'active' : ''}`} onClick={() => setSelectedData(data)}>{data}</button>
              ))}
            </div>
          </div>

          <button 
            className="download-btn-large" 
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? "PROCESSING..." : "DOWNLOAD EXPORT"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default AuthorityExport;