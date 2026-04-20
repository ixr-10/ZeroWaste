import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiLogOut, 
  FiMail, 
  FiUser,
  FiPieChart,
  FiFileText,
  FiUsers,
  FiDownload
} from 'react-icons/fi';
import '../styles/AdminUsersPage.css'; 
import '../styles/CreateAccountPage.css';


import { adminCreateUser } from '../services/api'; 

const CreateAccountPage = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // States
  const [role, setRole] = useState('admin'); 
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const adminName = user.username || 'Admin Name';

  const handleLogout = () => {
    navigate('/login');
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // 

    try {
      
      const newUserData = { 
        role: role, 
        email: email, 
        username: username 
      };
      
      await adminCreateUser(newUserData);
      
      // إذا جاز كلش نورمال، نخرجو ميساج و نرجعو لباجة المستخدمين
      alert('✅ Account created successfully!');
      navigate('/admin/users');

    } catch (err) {
      
      console.error("Error creating account:", err);
      alert('❌ Failed to create account: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="menu-item" onClick={() => navigate('/admin/statistics')} style={{ cursor: 'pointer' }}>
            <FiPieChart className="admin-icon" />
            {isSidebarOpen && <span className="menu-text">Statistics</span>}
          </div>
          <div className="menu-item" onClick={() => navigate('/admin/reports')} style={{ cursor: 'pointer' }}>
            <FiFileText className="admin-icon" />
            {isSidebarOpen && <span className="menu-text">Reports</span>}
          </div>
          <div className="menu-item active" onClick={() => navigate('/admin/users')} style={{ cursor: 'pointer' }}>
            <FiUsers className="admin-icon" />
            {isSidebarOpen && <span className="menu-text">Users</span>}
          </div>
          <div className="menu-item" onClick={() => navigate('/admin/export')} style={{ cursor: 'pointer' }}>
            <FiDownload className="admin-icon" />
            {isSidebarOpen && <span className="menu-text">Export data</span>}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="avatar">👩‍💼</div>
            {isSidebarOpen && <span className="admin-name">{adminName}</span>}
          </div>
          <FiLogOut className="logout-icon" onClick={handleLogout} style={{ cursor: 'pointer' }} />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content form-page-layout">
        
        <button type="button" className="back-button absolute-back" onClick={() => navigate(-1)}>
          &lt;
        </button>

        <div className="form-page-container">
          
          {/* Header */}
          <div className="header-section">
            <h2>Create a new account</h2>
          </div>

          <form onSubmit={handleSubmit} className="form-wrapper">
            
            {/* FORM CARD*/}
            <div className="create-card">
              
              {/* SPECIFY ROLE */}
              <div className="input-group">
                <label className="section-label">Specify the role:</label>
                <div className="role-pills">
                  <button 
                    type="button"
                    className={`pill-btn ${role === 'admin' ? 'active' : ''}`}
                    onClick={() => setRole('admin')}
                  >
                    Admin
                  </button>
                  <button 
                    type="button"
                    className={`pill-btn ${role === 'localauthority' ? 'active' : ''}`}
                    onClick={() => setRole('localauthority')}
                  >
                    Local authority
                  </button>
                </div>
              </div>

              {/* EMAIL */}
              <div className="input-group">
                <label>Email</label>
                <div className="input-box">
                  <FiMail className="input-icon" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* USERNAME */}
              <div className="input-group">
                <label>Username</label>
                <div className="input-box">
                  <FiUser className="input-icon" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="action-buttons-stacked">
             
              <button type="submit" className="btn-create-full" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create'}
              </button>
              <button type="button" className="btn-cancel-full" onClick={() => navigate(-1)}>
                Cancel
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateAccountPage;