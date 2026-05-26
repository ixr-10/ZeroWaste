import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDonationsPage.css';
import { 
  FiPieChart, FiFileText, FiUsers, FiDownload, 
  FiLogOut, FiChevronLeft, FiChevronRight, FiSearch, FiTrash2 
} from 'react-icons/fi';
import { BiTargetLock } from 'react-icons/bi';
import { FaMapMarkerAlt, FaHandHoldingHeart } from 'react-icons/fa';
import { fetchAdminDonations, deleteDonation, logoutUser } from '../services/api';


const AdminDonationPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [coordinates, setCoordinates] = useState('35.9311, 0.0892'); 
  
  const [filterMenuState, setFilterMenuState] = useState('closed'); 
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const adminName = user.username || 'Admin Name';

  // Map backend status values to display labels used in tabs
  const STATUS_MAP = {
    available: 'Active',
    reserved: 'Active',
    completed: 'Donated',
    expired: 'Expired',
     deleted: 'Deleted',
  };

  // Map backend urgency values to color strings used in filter
  const URGENCY_COLOR_MAP = {
    green: 'green',
    orange: 'orange',
    red: 'red',
  };

  const loadDonations = async () => {
    setLoading(true);
    setError('');
    try {
      
      const data = await fetchAdminDonations();
      // Normalize backend fields to what the table expects
      const normalized = data.map(d => ({
        id: d.id,
        prod: d.title,
        user: d.donor_username,
        date: new Date(d.created_at).toLocaleDateString('fr-FR'),
        qty: `${d.available_quantity} ${d.unit}`,
        status: STATUS_MAP[d.status] || d.status,
        coords: `${d.latitude}, ${d.longitude}`,
        category: d.category,
        color: d.urgency,
        image: d.image || null,
      }));
      console.log(data);
      setDonations(normalized);
    } catch (err) {
      setError('Failed to load donations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  // Close filter dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFilterMenuState('closed');
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle filter menu visibility
  const handleFilterBtnClick = () => {
    if (filterMenuState === 'closed') {
      setFilterMenuState('main');
    } else {
      setFilterMenuState('closed');
    }
  };

  // Set the chosen filter value and reset menu state
  const handleSelectFilter = (type, value) => {
    if (type === 'category') {
      setSelectedCategory(value);
      setSelectedColor(''); 
    } else if (type === 'color') {
      setSelectedColor(value);
      setSelectedCategory(''); 
    }
    setFilterMenuState('closed');
  };

  // Reset all active filters
  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedColor('');
    setFilterMenuState('closed');
  };

  // Dynamically update the filter button label based on selection
  const getButtonText = () => {
    if (selectedCategory) return `Category: ${selectedCategory}`;
    if (selectedColor) return `Color: ${selectedColor}`;
    if (filterMenuState === 'category') return 'Category';
    if (filterMenuState === 'emergency') return 'Emergency Color'; 
    return 'Filter By';
  };

  // Handle donation post deletion
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this donation?")) {
      try {
        await deleteDonation(id);
        setDonations(donations.filter(item => item.id !== id));
        alert("✅ Donation deleted successfully");
      } catch (err) {
        alert("❌ Failed to delete donation: " + err.message);
      }
    }
  };
const getEmergencyColor = (color) => {
  if (color === 'green') return '#588157';
  if (color === 'orange') return '#F3A738';
  if (color === 'red') return '#E07A5F';

  return '#000000';
};
  // Update map center coordinates when clicking target icon
  const handleViewLocation = (coords) => { 
    setCoordinates(coords); 
  };



  // Client-side filtering logic for Tabs, Search Query, Category, and Emergency Color
  const filteredDonations = donations.filter(item => {
    const matchesTab = activeTab === 'All' || item.status === activeTab;
    const searchLower = searchQuery.toLowerCase();
   const matchesSearch =
  (item.prod || '').toLowerCase().includes(searchLower) ||
  (item.user || '').toLowerCase().includes(searchLower);
    
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    const matchesColor = selectedColor ? item.color === selectedColor : true;

    return matchesTab && matchesSearch && matchesCategory && matchesColor;
  });

  return (
    <div className="admin-layout-container">
      
      {/* ================= SIDEBAR COMPONENT ================= */}
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
          <div className="menu-item" onClick={() => navigate('/admin/users')} style={{ cursor: 'pointer' }}>
            <span className="admin-icon"><FiUsers /></span>
            {isSidebarOpen && <span className="menu-text">Users</span>}
          </div>
          <div className="menu-item active" style={{ cursor: 'pointer' }}>
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
          <FiLogOut className="logout-icon" onClick={async () => {
              await logoutUser();
              navigate('/login');
            }} 
            />
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="main-content-area">
        
        {/* Status Pills Tabs */}
        <div className="status-tabs">
          {['All', 'Active', 'Donated', 'Expired'].map(tab => (
            <button 
              key={tab} 
              className={`status-pill ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Data Table Container */}
        <div className="table-outer-box">
          <div className="filter-bar">
            <div className="search-input-box">
              <FiSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by username or product name...." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Interactive Filter Dropdown */}
            <div className="filter-wrapper-exact" ref={dropdownRef}>
              <button className="btn-filter-exact" onClick={handleFilterBtnClick}>
                {getButtonText()} <span style={{fontSize: '0.65rem', marginTop: '2px'}}>{filterMenuState !== 'closed' ? '▲' : '▼'}</span>
              </button>

              {filterMenuState !== 'closed' && (
                <div className={`dropdown-panel-exact panel-${filterMenuState}`}>
                  
                  {/* Step 1: Main Filter Choices */}
                  {filterMenuState === 'main' && (
                    <>
                      <div className="main-menu-row" onClick={() => setFilterMenuState('category')}>Category</div>
                      <div className="main-menu-row" onClick={() => setFilterMenuState('emergency')}>Emergency Color</div>
                      {(selectedCategory || selectedColor) && (
                        <div className="main-menu-row" style={{ color: '#E07A5F', fontWeight: 'bold' }} onClick={clearFilters}>
                          Clear Filters ✕
                        </div>
                      )}
                    </>
                  )}

                  {/* Step 2a: Category Options Grid */}
                  {filterMenuState === 'category' && (
                    <div className="cat-grid-exact">
                      <div className="cat-cell-exact" onClick={() => handleSelectFilter('category', 'Fruit')}>Fruit & Vegetables</div>
                      <div className="cat-cell-exact" onClick={() => handleSelectFilter('category', 'Pastries')}>Pastries</div>
                      <div className="cat-cell-exact" onClick={() => handleSelectFilter('category', 'Milk')}>Milk Products</div>
                      <div className="cat-cell-exact" onClick={() => handleSelectFilter('category', 'Meat')}>Meat & Fish</div>
                      <div className="cat-cell-exact" onClick={() => handleSelectFilter('category', 'Preserved')}>Preserved Food</div>
                      <div className="cat-cell-exact" onClick={() => handleSelectFilter('category', 'Cooked')}>Cooked Meals</div>
                      <div className="cat-cell-exact" onClick={() => handleSelectFilter('category', 'Drinks')}>Drinks</div>
                      <div className="cat-cell-exact" onClick={() => handleSelectFilter('category', 'Other')}>Other</div>
                    </div>
                  )}

                  {/* Step 2b: Emergency Pin Color Options */}
                  {filterMenuState === 'emergency' && (
                    <>
                      <div className="emergency-row-exact" onClick={() => handleSelectFilter('color', 'green')}>
                        <FaMapMarkerAlt className="exact-pin-icon" style={{ color: '#588157' }} />
                      </div>
                      <div className="emergency-row-exact" onClick={() => handleSelectFilter('color', 'red')}>
                        <FaMapMarkerAlt className="exact-pin-icon" style={{ color: '#E07A5F' }} />
                      </div>
                      <div className="emergency-row-exact" onClick={() => handleSelectFilter('color', 'orange')}>
                        <FaMapMarkerAlt className="exact-pin-icon" style={{ color: '#F3A738' }} />
                      </div>
                    </>
                  )}

                </div>
              )}
            </div>
          </div>

          {/* Donations Table View */}
          <div className="table-wrapper">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Loading donations...</div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#E07A5F' }}>{error}</div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Picture</th>
                    <th>Product</th>
                    <th>Username</th>
                    <th>Date</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.length > 0 ? (
                    filteredDonations.map(item => (
                      <tr key={item.id}>
                        <td>
                          <img 
                            src={item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'}
                            alt={item.prod} 
                            className="table-prod-img"
                          />
                        </td>
                        <td style={{ fontWeight: '500' }}>{item.prod}</td>
                        <td>{item.user}</td>
                        <td>{item.date}</td>
                        <td style={{ fontWeight: '500' }}>{item.qty}</td>

                        <td
                          style={{
                            fontWeight: '600',
                            color: getEmergencyColor(item.color),
                          }}
                        >
                          {item.status}
                        </td>

                        <td>
                          <div className="action-icons-wrapper">
                            <button 
                              className="action-btn-item target-location-btn" 
                              onClick={() => handleViewLocation(item.coords)}
                              data-tooltip="View Location"
                            >
                              <BiTargetLock size={18} />
                            </button>
                            
                            <button 
                              className="action-btn-item delete-item-btn" 
                              onClick={() => handleDelete(item.id)}
                              data-tooltip="Delete Post"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                        No results found for these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Embedded Google Maps View (Updates based on coordinates state) */}
        <div className="map-wrapper">
          <input 
            type="text"
            className="map-badge-input"
            value={coordinates}
            onChange={(e) => setCoordinates(e.target.value)}
            placeholder="Selected post coordinates..." 
            autoComplete="off"
          />
          <iframe 
            title="clean-google-map"
            src={`https://maps.google.com/maps?q=${coordinates || '35.9311,0.0892'}&z=14&output=embed`}
            width="100%" 
            height="100%" 
            allowFullScreen="" 
            loading="lazy"
            style={{ border: 0 }}
          ></iframe>
        </div>

      </main>
    </div>
  );
};

export default AdminDonationPage;
