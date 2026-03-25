import React, { useEffect, useState } from 'react';
import { adminListUsers, promoteToFoodSaver } from '../services/api';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    const data = await adminListUsers(filter);
    setUsers(data.users || []);
  };

  useEffect(() => { fetchUsers(); }, [filter]);

  const handlePromote = async (userId, username) => {
    const data = await promoteToFoodSaver(userId);
    if (data.message) {
      setMessage(data.message);
      fetchUsers(); // refresh list
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin — User Management</h1>

      {message && <p style={{ color: 'green' }}>{message}</p>}

      <div style={{ marginBottom: '1rem' }}>
        <label>Filter by role: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="user">User</option>
          <option value="food_saver">Food Saver</option>
          <option value="collectivite">Collectivite</option>
        </select>
      </div>

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
    </div>
  );
}

export default AdminUsersPage;