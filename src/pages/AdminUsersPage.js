import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminListUsers, promoteToFoodSaver, removeTokens, adminCreateUser } from '../services/api';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [message, setMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', phone: '', address: '', role: 'admin' });
  const [createMessage, setCreateMessage] = useState('');
  const [createError, setCreateError] = useState('');
  const navigate = useNavigate();

  // Lock back/forward navigation while logged in
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, '', '/admin/users');
    };
    return () => {
      window.onpopstate = null;
    };
  }, []);

  const fetchUsers = async () => {
    const data = await adminListUsers(filter);
    setUsers(data.users || []);
  };

  useEffect(() => { fetchUsers(); }, [filter]);

  const handleLogout = () => {
    window.onpopstate = null; // remove lock before navigating
    removeTokens();
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const handlePromote = async (userId, username) => {
    const data = await promoteToFoodSaver(userId);
    if (data.message) {
      setMessage(data.message);
      fetchUsers();
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateMessage('');
    const data = await adminCreateUser(newUser);
    if (data.message) {
      setCreateMessage(data.message);
      setNewUser({ username: '', email: '', phone: '', address: '', role: 'admin' });
      fetchUsers();
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateMessage('');
      }, 2000);
    } else {
      setCreateError(data.error || Object.values(data).flat().join(' '));
    }
  };

  return (
    <div style={{ padding: '2rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Admin — User Management</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: '#27ae60', color: 'white', border: 'none',
              padding: '0.5rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
            }}
          >
            + Create User
          </button>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#e74c3c', color: 'white', border: 'none',
              padding: '0.5rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {message && <p style={{ color: 'green' }}>{message}</p>}

      {/* Filter */}
      <div style={{ marginBottom: '1rem' }}>
        <label>Filter by role: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="user">User</option>
          <option value="food_saver">Food Saver</option>
          <option value="collectivite">Collectivite</option>
        </select>
      </div>

      {/* Table */}
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Verified</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.is_verified ? '✅' : '❌'}</td>
              <td>
                {user.role !== 'food_saver' && user.role !== 'admin' && (
                  <button onClick={() => handlePromote(user.id, user.username)}>
                    Promote to Food Saver
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create User Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white', padding: '2rem', borderRadius: '10px',
            width: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}>
            <h2 style={{ marginBottom: '1rem' }}>Create New User</h2>

            {createMessage && <p style={{ color: 'green', marginBottom: '1rem' }}>{createMessage}</p>}
            {createError && <p style={{ color: 'red', marginBottom: '1rem' }}>{createError}</p>}

            <form onSubmit={handleCreateUser}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem' }}>Username</label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem' }}>Email</label>
                <input
                  type="email"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem' }}>Phone</label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem' }}>Address</label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  value={newUser.address}
                  onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem' }}>Role</label>
                <select
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="admin">Admin</option>
                  <option value="food_saver">Food Saver</option>
                  <option value="collectivite">Collectivite</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1, backgroundColor: '#27ae60', color: 'white', border: 'none',
                    padding: '0.6rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
                  }}
                >
                  Create & Send Email
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setCreateError(''); setCreateMessage(''); }}
                  style={{
                    flex: 1, backgroundColor: '#e74c3c', color: 'white', border: 'none',
                    padding: '0.6rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminUsersPage;