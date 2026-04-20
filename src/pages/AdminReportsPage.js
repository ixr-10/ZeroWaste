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

// 
import { fetchAdminReports, processReportAction } from '../services/api';

const AdminReportsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [statusTab, setStatusTab] = useState('Pending');
  const [categoryTab, setCategoryTab] = useState('All');
  
  const [selectedReport, setSelectedReport] = useState(null);
  
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const getBadgeStyle = (actionType) => {
    if (!actionType) return { backgroundColor: '#f2f4f4', color: '#bdc3c7' };
    const lowerAction = actionType.toLowerCase();
    
    if (lowerAction.includes('delete') || lowerAction.includes('deactivate')) {
      return { backgroundColor: '#fadbd8', color: '#e74c3c' }; 
    } else if (lowerAction.includes('warning')) {
      return { backgroundColor: '#fdebd0', color: '#e67e22' }; 
    } else if (lowerAction.includes('ignore') || lowerAction.includes('dismiss')) {
      return { backgroundColor: '#e5e7e9', color: '#7f8c8d' }; 
    }
    return { backgroundColor: '#f2f4f4', color: '#bdc3c7' };
  };

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      try {
        // 2. to get the data from the dserver 
        const backendData = await fetchAdminReports(); 
        
        // 3. tr
        const formattedReports = backendData.map(r => {
          const isPost = r.reported_donation !== null;
          return {
            id: r.id,
            type: isPost ? 'post' : 'user',
            title: isPost ? r.donation_title : r.reported_username,
            reason: r.reason,
            postDesc: r.description,
            author: r.reporter_username,
            date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            imgUrl: isPost ? r.donation_image : null,
            userImg: !isPost ? r.reported_user_avatar : null,
            imageEmoji: isPost ? '📦' : '👤',
            status: r.status === 'pending' ? 'Pending' : 'Treated',
            action: r.action_taken_display || r.action_taken,
            actionDate: r.treated_at ? new Date(r.treated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null
          };
        });

        setReports(formattedReports);
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
      // 4. send actions to the server 
      await processReportAction(selectedReport.id, actionType);

      const todayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      let formattedAction = '';
      switch(actionType) {
        case 'delete_post': formattedAction = 'Post deleted'; break;
        case 'delete_account': formattedAction = 'Account deactivated'; break;
        case 'send_warning': formattedAction = 'Warning sent'; break;
        case 'ignore_report': formattedAction = 'Ignored'; break;
        default: formattedAction = actionType;
      }

      setReports((prevReports) => 
        prevReports.map((r) => 
          r.id === selectedReport.id ? { ...r, status: 'Treated', action: formattedAction, actionDate: todayDate } : r
        )
      );

      setSelectedReport(null);
      
    } catch (error) {
      console.error(`Error performing action ${actionType}`, error);
      alert("Something went wrong with the backend. Make sure you are an Admin.");
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
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <div className="report-image-placeholder">
                        {report.type === 'post' && report.imgUrl ? (
                          <img src={`http://192.168.1.34:8000${report.imgUrl}`} alt={report.title} className="card-mini-img" />
                        ) : report.type === 'user' && report.userImg ? (
                          <img src={`http://192.168.1.34:8000${report.userImg}`} alt={report.title} className="card-mini-img" />
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

                    {report.status === 'Treated' && report.action && (
                      <div className="report-action-badge" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px', paddingRight: '15px' }}>
                        <span style={{
                          ...getBadgeStyle(report.action),
                          padding: '5px 15px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {report.action}
                        </span>
                        <span style={{ fontSize: '10px', color: '#999' }}>
                          on {report.actionDate}
                        </span>
                      </div>
                    )}
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
                          <img src={`http://192.168.1.34:8000${selectedReport.userImg}`} alt="avatar" style={{width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover'}} />
                        ) : selectedReport.imageEmoji}
                      </div>
                      <div className="user-info">
                        <div className="user-header">
                          <p className="user-name">{selectedReport.title}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="reported-post-card">
                      {selectedReport.imgUrl ? (
                        <img src={`http://192.168.1.34:8000${selectedReport.imgUrl}`} alt="post" className="post-cover-image" />
                      ) : <div className="post-cover-placeholder">{selectedReport.imageEmoji}</div>}
                      <div className="post-card-body">
                        <div className="post-card-header">
                          <h5>{selectedReport.title}</h5>
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
                          <span className="action-btn-title">Deactivate Account</span>
                          <span className="action-btn-desc">deactivate the poster's account</span>
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