import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/AdminUsersPage.css';
import '../styles/AdminReportsPage.css';

import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

import berriesImg from '../assets/berries.jpg';
import adminIcon from '../assets/admin.png';
import user2Img from '../assets/user2.png';

import {
  FiPieChart,
  FiFileText,
  FiUsers,
  FiDownload,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';


// import { fetchAdminReports, processReportAction } from '../services/api';

const AdminReportsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [statusTab, setStatusTab] = useState('Pending');
  const [categoryTab, setCategoryTab] = useState('All');
  
  const [selectedReport, setSelectedReport] = useState(null);
  
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      try {
        
        const dummyDataFromBackend = [
          { id: 1, type: 'post', title: 'Whole Milk', reason: 'Dangerous or unsafe food', author: 'Username', date: 'Mar 28, 2025', imageEmoji: '🥛', postDesc: 'This milk smells very bad...', category: 'Dairy', weight: '1 L', expireDate: '25/03/2025', imgUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=200', status: 'Pending' },
          { id: 2, type: 'post', title: 'Mixed Berries', reason: 'Expired product posted as fresh', author: 'Username', date: 'Mar 28, 2025', imageEmoji: '🫐', postDesc: 'Freshly picked mixed berries...', category: 'Fruit & Vegetables', weight: '2 Kg', expireDate: '04/04/2026', imgUrl: berriesImg, status: 'Pending' },
          { id: 3, type: 'user', title: 'Username_1', reason: 'Fake account', author: 'Username', date: 'Mar 28, 2025', imageEmoji: null, userImg: adminIcon, email: 'username.1@gmail.com', donations: 3, score: 2.1, status: 'Pending' },
          { id: 4, type: 'user', title: 'Username_02', reason: 'Spam', author: 'Username', date: 'Mar 28, 2025', imageEmoji: null, userImg: user2Img, email: 'user02@gmail.com', donations: 0, score: 0.5, status: 'Pending' },
          { id: 5, type: 'post', title: 'Extra Item', reason: 'Test', author: 'User', date: 'Mar 29, 2025', imageEmoji: '🍎', status: 'Treated' }
        ];
        
        // setReports(data);
        setReports(dummyDataFromBackend);
      } catch (error) {
        console.error("Failed to load reports", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, []);

  
  const handleAction = async (actionType) => {
    if (!selectedReport) return;

    const confirmAction = window.confirm(`Are you sure you want to ${actionType.replace('_', ' ')}?`);
    if (!confirmAction) return;

    try {
      // ـPI تاjango:
      // await processReportAction(selectedReport.id, actionType);

      
      setReports((prevReports) => 
        prevReports.map((r) => 
          r.id === selectedReport.id ? { ...r, status: 'Treated' } : r
        )
      );

      
      setSelectedReport(null);
      
      
    } catch (error) {
      console.error(`Error performing action ${actionType}`, error);
      alert("Something went wrong with the backend.");
    }
  };

  
  const filteredReports = reports.filter((report) => {
    const matchesStatus = report.status === statusTab;
    let matchesCategory = true;
    if (categoryTab === 'Posts') matchesCategory = report.type === 'post';
    if (categoryTab === 'Users') matchesCategory = report.type === 'user';
    return matchesStatus && matchesCategory;
  });

  return (
    <div className={`admin-dashboard ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
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
          <div className="menu-item active">
            <span className="admin-icon"><FiFileText /></span>
            {isSidebarOpen && <span className="menu-text">Reports</span>}
          </div>
          <div className="menu-item" onClick={() => navigate('/admin/users')} style={{ cursor: 'pointer' }}>
            <span className="admin-icon"><FiUsers /></span>
            {isSidebarOpen && <span className="menu-text">Users</span>}
          </div>
          <div className="menu-item" onClick={() => navigate('/admin/export')} style={{ cursor: 'pointer' }}>
            <span className="admin-icon"><FiDownload /></span>
            {isSidebarOpen && <span className="menu-text">Export data</span>}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="avatar">👩‍💼</div>
            {isSidebarOpen && <span className="admin-name">Admin Name</span>}
          </div>
          <FiLogOut className="logout-icon" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <SimpleBar className="main-content" style={{ height: '100vh' }}>
        <div className="reports-layout-wrapper">
          
          {/* ===== 1. REPORTS LIST ===== */}
          <div className={`reports-left-column ${!selectedReport ? 'full-width' : ''}`}>
            
            <div className="status-tabs">
              <button 
                className={`pill-btn status-btn ${statusTab === 'Pending' ? 'active-sage' : ''}`} 
                onClick={() => { setStatusTab('Pending'); setSelectedReport(null); }}
              >Pending</button>
              <button 
                className={`pill-btn status-btn ${statusTab === 'Treated' ? 'active-sage' : ''}`} 
                onClick={() => { setStatusTab('Treated'); setSelectedReport(null); }}
              >Treated</button>
            </div>

            <div className="filter-tabs">
              <button className={`pill-btn filter-btn ${categoryTab === 'All' ? 'active-sage' : ''}`} onClick={() => setCategoryTab('All')}>All</button>
              <button className={`pill-btn filter-btn ${categoryTab === 'Posts' ? 'active-sage' : ''}`} onClick={() => setCategoryTab('Posts')}>Posts</button>
              <button className={`pill-btn filter-btn ${categoryTab === 'Users' ? 'active-sage' : ''}`} onClick={() => setCategoryTab('Users')}>Users</button>
            </div>

            <div className="reports-list">
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Loading reports...</div>
              ) : filteredReports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No reports found.</div>
              ) : (
                filteredReports.map((report) => (
                  <div 
                    className={`report-card ${selectedReport?.id === report.id ? 'active-report-card' : ''}`} 
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="report-image-placeholder">
                      {report.type === 'post' && report.imgUrl ? (
                        <img src={report.imgUrl} alt={report.title} className="card-mini-img" />
                      ) : report.type === 'user' && report.userImg ? (
                        <img src={report.userImg} alt={report.title} className="card-mini-img" />
                      ) : (
                        report.imageEmoji
                      )}
                    </div>
                    <div className="report-details-info">
                      <h4 className="report-title">{report.title}</h4>
                      <p className="report-reason">{report.reason}</p>
                      <p className="report-meta">By {report.author} . {report.date}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ===== 2. REPORT DETAILS PANEL ===== */}
          {selectedReport && (
            <div className="reports-right-column">
              <div className="report-details-panel">
                
                <div className="details-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="details-title">Report #{selectedReport.id}</h3>
                    <span onClick={() => setSelectedReport(null)} style={{cursor: 'pointer', color: '#888', fontWeight: 'bold', fontSize: '1.2rem'}}>X</span>
                  </div>
                  <span className="details-meta">By {selectedReport.author} . {selectedReport.date}</span>
                </div>

                <div className="details-section">
                  <h4 className="section-title">Reported {selectedReport.type === 'user' ? 'account' : 'post'}</h4>
                  {selectedReport.type === 'user' ? (
                    <div className="reported-user-card">
                      <div className="user-avatar-large">
                        {selectedReport.userImg ? (
                          <img src={selectedReport.userImg} alt="avatar" style={{width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover'}} />
                        ) : selectedReport.imageEmoji}
                      </div>
                      <div className="user-info">
                        <div className="user-header">
                          <p className="user-name">{selectedReport.title}</p>
                          <p className="user-email">{selectedReport.email}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="reported-post-card">
                      {selectedReport.imgUrl ? (
                        <img src={selectedReport.imgUrl} alt="post" className="post-cover-image" />
                      ) : <div className="post-cover-placeholder">{selectedReport.imageEmoji}</div>}
                      <div className="post-card-body">
                        <div className="post-card-header">
                          <h5>{selectedReport.title}</h5>
                          <span className="post-category">{selectedReport.category}</span>
                        </div>
                        <p className="post-desc">{selectedReport.postDesc}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="details-section">
                  <h4 className="section-title">Reason</h4>
                  <div className="readonly-box">{selectedReport.reason}</div>
                </div>

                {selectedReport.status === 'Pending' && (
                  <div className="details-section actions-section">
                    <h4 className="section-title">Admin actions</h4>
                    <div className="admin-actions-list">
                      
                      {selectedReport.type === 'post' && (
                        <button className="action-btn delete-btn" onClick={() => handleAction('delete_post')}>
                          <div className="action-btn-icon">🗑️</div>
                          <div className="action-btn-text">
                            <span className="action-btn-title">Delete Post</span>
                            <span className="action-btn-desc">delete this donation from the platform</span>
                          </div>
                        </button>
                      )}

                      <button className="action-btn delete-acc-btn" onClick={() => handleAction('delete_account')}>
                        <div className="action-btn-icon">👤</div>
                        <div className="action-btn-text">
                          <span className="action-btn-title">Delete Account</span>
                          <span className="action-btn-desc">permanently delete the poster's account</span>
                        </div>
                      </button>

                      <button className="action-btn warning-btn" onClick={() => handleAction('send_warning')}>
                        <div className="action-btn-icon">⚠️</div>
                        <div className="action-btn-text">
                          <span className="action-btn-title">Send Warning</span>
                          <span className="action-btn-desc">notify the user about the violation</span>
                        </div>
                      </button>

                      <button className="action-btn ignore-btn" onClick={() => handleAction('ignore_report')}>
                        <div className="action-btn-icon">🚫</div>
                        <div className="action-btn-text">
                          <span className="action-btn-title">Ignore Report</span>
                          <span className="action-btn-desc">dismiss - no action needed</span>
                        </div>
                      </button>

                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      </SimpleBar>
    </div>
  );
};

export default AdminReportsPage;