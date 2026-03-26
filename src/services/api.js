const BASE_URL = 'http://localhost:8000/api';

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

export const adminCreateUser = async (userData) => {
  const res = await authFetch(`${BASE_URL}/users/admin/create-user/`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  return res.json();
};