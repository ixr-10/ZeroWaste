import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/AdminUsersPage.css';
import '../styles/AdminReportsPage.css';

import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

import {
  FiPieChart,
  FiFileText,
  FiUsers,
  FiDownload,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { FaHandHoldingHeart } from 'react-icons/fa';

import { fetchAdminReports, logoutUser, processReportAction } from '../services/api';

const AdminReportsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [statusTab, setStatusTab] = useState('Pending');
  const [categoryTab, setCategoryTab] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const adminName = user.username || 'Admin';

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
        const backendData = await fetchAdminReports();
        const formattedReports = backendData.map(r => {
          const isPost = r.reported_donation !== null;
          return {
            id: r.id,
            type: isPost ? 'post' : 'user',
            title: isPost ? r.donation_title : r.reported_username,
            email: !isPost ? r.reported_email : null,
            donationsCount: !isPost ? r.reported_donations_count : 0,
            userScore: !isPost ? r.reported_user_score : '0.0',
            reason: r.reason,
            postDesc: r.description,
            additionalDetails: r.additional_details || r.details,
            screenshotFile: r.screenshot,
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
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load reports from backend", error);
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
      await processReportAction(selectedReport.id, actionType);
      const todayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      let formattedAction = '';
      switch (actionType) {
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
          <div className="menu-item active" style={{ cursor: 'pointer' }}>
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
          <FiLogOut className="logout-icon" style={{ cursor: 'pointer' }} onClick={async () => { await logoutUser(); navigate('/login'); }} />
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <SimpleBar className="main-content" style={{ height: '100vh' }}>
        <div className="reports-layout-wrapper">

          {/* ===== REPORTS LIST ===== */}
          <div className={`reports-left-column ${!selectedReport ? 'full-width' : ''}`}>
            <div className="status-tabs">
              <button className={`pill-btn status-btn ${statusTab === 'Pending' ? 'active-sage' : ''}`} onClick={() => { setStatusTab('Pending'); setSelectedReport(null); }}>Pending</button>
              <button className={`pill-btn status-btn ${statusTab === 'Treated' ? 'active-sage' : ''}`} onClick={() => { setStatusTab('Treated'); setSelectedReport(null); }}>Treated</button>
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
                        {report.type === 'user' && report.userImg ? (
                          <img src={report.userImg} alt={report.title} className="card-mini-img" />
                        ) : (
                          report.imageEmoji
                        )}
                      </div>
                      <div className="report-details-info">
                        <h4 className="report-title">{report.title}</h4>
                        <p className="report-reason">{report.reason}</p>
                        <p className="report-meta">By {report.author} · {report.date}</p>
                      </div>
                    </div>
                    {report.status === 'Treated' && report.action && (
                      <div className="report-action-badge" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px', paddingRight: '15px' }}>
                        <span style={{ ...getBadgeStyle(report.action), padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{report.action}</span>
                        <span style={{ fontSize: '10px', color: '#999' }}>on {report.actionDate}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ===== REPORT DETAILS PANEL ===== */}
          {selectedReport && (
            <div className="reports-right-column">
              <div className="report-details-panel">

                <div className="details-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="details-title">Report #{selectedReport.id}</h3>
                    <span onClick={() => setSelectedReport(null)} style={{ cursor: 'pointer', color: '#888', fontWeight: 'bold', fontSize: '1.2rem' }}>X</span>
                  </div>
                  <span className="details-meta">By {selectedReport.author} · {selectedReport.date}</span>
                </div>

                <div className="details-section">
                  <h4 className="section-title">{selectedReport.type === 'user' ? 'Reported account' : 'Reported post'}</h4>

                  {selectedReport.type === 'user' ? (
                    <div className="reported-user-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="user-avatar-large">
                          {selectedReport.userImg ? (
                            <img src={selectedReport.userImg} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }} />
                          ) : '👤'}
                        </div>
                        <div className="user-header">
                          <p className="user-name" style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{selectedReport.title}</p>
                          <p className="user-email" style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#666' }}>{selectedReport.email || 'No email available'}</p>
                        </div>
                      </div>
                      <div className="user-stats" style={{ display: 'flex', gap: '40px', marginTop: '4px' }}>
                        <div className="stat-item" style={{ textAlign: 'center' }}>
                          <strong style={{ display: 'block', fontSize: '1.2rem', color: '#111' }}>{selectedReport.donationsCount}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#888' }}>Donations</span>
                        </div>
                        <div className="stat-item" style={{ textAlign: 'center' }}>
                          <strong style={{ display: 'block', fontSize: '1.2rem', color: '#111' }}>{selectedReport.userScore}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#888' }}>Score</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="reported-post-card">
                      <div className="post-cover-placeholder">📦</div>
                      <div className="post-card-body">
                        <div className="post-card-header">
                          <h5 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{selectedReport.title}</h5>
                        </div>
                        <p className="post-desc" style={{ marginTop: '8px', fontSize: '0.9rem', color: '#444' }}>{selectedReport.postDesc}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="details-section">
                  <h4 className="section-title">Reason</h4>
                  <div className="readonly-box">{selectedReport.reason}</div>
                </div>

                <div className="details-section">
                  <h4 className="section-title">Additional Details</h4>
                  <div className="readonly-box large-box">
                    {selectedReport.additionalDetails || 'No additional details provided.'}
                  </div>
                </div>

                <div className="details-section">
                  <h4 className="section-title">Attached screenshot</h4>
                  {selectedReport.screenshotFile ? (
                    <div className="screenshot-container" style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e0e0e0', maxWidth: '100%' }}>
                      <img
                        src={selectedReport.screenshotFile}
                        alt="Evidence screenshot"
                        style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '350px', objectFit: 'contain', backgroundColor: '#f9f9f9' }}
                      />
                    </div>
                  ) : (
                    <div className="readonly-box screenshot-box" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🖼️</span>
                      <span style={{ color: '#888' }}>No screenshot attached</span>
                    </div>
                  )}
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