import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiLogOut, 
  FiPieChart, 
  FiFileText, 
  FiUsers, 
  FiDownload 
} from 'react-icons/fi';
import { FaHandHoldingHeart } from 'react-icons/fa';
import '../styles/PromotionCriteria.css';


// import { fetchPromotionCriteria, updatePromotionCriteria } from '../services/api';

const PromotionCriteria = () => {
  const [score, setScore] = useState(100);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  //   LocalStorage 
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const adminName = user.username || 'Admin Name';

  // ====================================================
  // ====================================================
  useEffect(() => {
    const getCriteria = async () => {
      try {
        // const data = await fetchPromotionCriteria();
        // setScore(data.min_score);
      } catch (err) {
        console.error("Failed to fetch criteria:", err);
      }
    };
    getCriteria();
  }, []);

  const handleIncrement = () => setScore(prev => prev + 10);
  const handleDecrement = () => setScore(prev => (prev > 0 ? prev - 10 : 0));

  // ====================================================
  // ====================================================
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // await updatePromotionCriteria({ min_score: score });
      
      alert(`✅ Minimum score updated to ${score} successfully!`);
      navigate('/admin/users');
    } catch (err) {
      console.error("Error saving criteria:", err);
      alert('❌ Failed to save criteria: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className={`admin-dashboard ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      
      {/* ================= SIDEBAR  ================= */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          {isSidebarOpen && <h2 className="logo-text">ZER0<br />WASTE</h2>}
          <button className="toggle-btn" onClick={toggleSidebar}>
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
          
          <div className="menu-item" onClick={() => navigate('/admin/donations')} style={{ cursor: 'pointer' }}>
            <FaHandHoldingHeart className="admin-icon" />
            {isSidebarOpen && <span className="menu-text">Donations</span>}
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
          <FiLogOut className="logout-icon" onClick={() => navigate('/login')} style={{ cursor: 'pointer' }} />
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="main-content promotion-criteria-content">
        
        {/* Header & Back Button */}
        <div className="header-section">
          <button className="back-button" onClick={() => navigate(-1)}>
            &lt;
          </button>
          <h2>Set FoodSaver promotion criteria</h2>
        </div>

        {/* Center Card */}
        <div className="criteria-card-container">
          <div className="criteria-card">
            <h3>Enter the minimum score required for the user to become a foodsaver:</h3>
            <p>Users who reach this score will automatically become FoodSavers</p>
            
            <div className="counter-container">
              <button className="counter-btn minus" onClick={handleDecrement}>-</button>
              <span className="score-display">{score}</span>
              <button className="counter-btn plus" onClick={handleIncrement}>+</button>
            </div>
          </div>
        </div>

        {/* Action Buttons (Save / Cancel) */}
        <div className="action-buttons">
          <button className="save-btn" onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
        </div>

      </div>
    </div>
  );
};

export default PromotionCriteria;