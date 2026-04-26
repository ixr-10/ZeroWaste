const BASE_URL = 'http://192.168.73.147:8000/api';

// ── Token helpers ──
export const saveTokens = (access, refresh) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

export const getToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');
export const removeTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// ── Authenticated request helper ──
export const authFetch = async (url, options = {}) => {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};

// ── Auth ──
export const loginUser = async (username, password) => {
  const response = await fetch(`${BASE_URL}/users/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Login failed.');
  return data;
};

export const setPassword = async (username, code, new_password, confirm_password) => {
  const res = await fetch(`${BASE_URL}/users/set-password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, code, new_password, confirm_password }),
  });
  return res.json();
};

export const login = async (username, password) => {
  const res = await fetch(`${BASE_URL}/users/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
};

export const getProfile = async (accessToken) => {
  const response = await fetch(`${BASE_URL}/users/profile/`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to get profile.');
  return data;
};

export const forgotPassword = async (email) => {
  const res = await fetch(`${BASE_URL}/users/forgot-password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
};

export const resetPassword = async (email, code, new_password) => {
  const res = await fetch(`${BASE_URL}/users/reset-password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, new_password }),
  });
  return res.json();
};

// ── Admin ──
export const adminListUsers = async (role = '') => {
  const url = role
    ? `${BASE_URL}/users/admin/users/?role=${role}`
    : `${BASE_URL}/users/admin/users/`;
  const res = await authFetch(url);
  return res.json();
};

export const promoteToFoodSaver = async (userId) => {
  const res = await authFetch(`${BASE_URL}/users/promote/${userId}/`, {
    method: 'POST',
  });
  return res.json();
};
// fIXME: temporary workaround - the backend currently requires 'phone' and 'address' 
// fields to be mandatory, but they are not yet included in the frontend design. 
// These hardcoded values should be removed once the backend API is updated.

export const adminCreateUser = async (userData) => {
  const completeUserData = {
    ...userData,
    phone: "0555000000",
    address: "Not provided"
  };

  const res = await authFetch(`${BASE_URL}/users/admin/create-user/`, {
    method: 'POST',
    body: JSON.stringify(completeUserData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data)); 
  return data;
};

export const adminDeleteUser = async (userId) => {
  const res = await authFetch(`${BASE_URL}/users/admin/users/${userId}/delete/`, {
    method: 'DELETE',
  });
  if (res.status === 204) return { success: true };
  return res.json();
};

export const demoteFromFoodSaver = async (userId) => {
  const res = await authFetch(`${BASE_URL}/users/demote/${userId}/`, {
    method: 'POST',
  });
  return res.json();
};

export const logoutUser = async () => {
  const refresh = getRefreshToken();
  try {
    await authFetch(`${BASE_URL}/users/logout/`, {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    });
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    removeTokens();
    localStorage.removeItem('user');
  }
};

// ── Admin Reports (Moderation) ──

export const fetchAdminReports = async () => {
  const res = await authFetch(`${BASE_URL}/moderation/reports/`); 
  const data = await res.json();
  
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch reports.');
  
  return data.reports ? data.reports : data; 
};

export const processReportAction = async (reportId, actionType) => {
  let backendAction = actionType;
  if (actionType === 'delete_account') backendAction = 'deactivate_account';
  if (actionType === 'ignore_report') backendAction = 'ignore';

  const res = await authFetch(`${BASE_URL}/moderation/reports/${reportId}/action/`, {
    method: 'POST',
    body: JSON.stringify({ action: backendAction }),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || 'Failed to process action.');
  return data;
};
export const toggleUserActive = async (userId) => {
  const res = await authFetch(`${BASE_URL}/moderation/users/${userId}/toggle-active/`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
};