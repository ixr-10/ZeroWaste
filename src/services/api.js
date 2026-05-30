
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
  const res = await authFetch(`${BASE_URL}/users/admin/users/${userId}/toggle-active/`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
};

export const adminGetUserStats = async () => {
  const res = await authFetch(`${BASE_URL}/users/admin/users/stats/`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch stats.');
  return data;
};

export const adminToggleActive = async (userId) => {
  const res = await authFetch(`${BASE_URL}/users/admin/users/${userId}/toggle-active/`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
};

export const adminToggleVerify = async (userId) => {
  const res = await authFetch(`${BASE_URL}/users/admin/users/${userId}/toggle-verify/`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
};

export const adminPromoteOrDemoteFoodSaver = async (userId, isFoodSaver) => {
  const endpoint = isFoodSaver
    ? `${BASE_URL}/users/demote/${userId}/`
    : `${BASE_URL}/users/promote/${userId}/`;
  const res = await authFetch(endpoint, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
};

// ── Donations (Admin) ──
export const fetchAdminDonations = async ({ status, category, urgency } = {}) => {
  const params = new URLSearchParams();
  if (status && status !== 'All') {
    if (status === 'Active')  params.append('status', 'active');
    if (status === 'Donated') params.append('status', 'donated');
    if (status === 'Expired') params.append('status', 'expired');
    if (status === 'Deleted') params.append('status', 'deleted');
  }
  if (category) params.append('category', category);
  if (urgency) params.append('urgency', urgency);

  const res = await authFetch(`${BASE_URL}/donations/admin/all/?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch donations.');

  if (data.active !== undefined) {
    return [...(data.active || []), ...(data.expired || []), ...(data.donated || [])];
  }
  return data;
};

export const deleteDonation = async (donationId) => {
  const res = await authFetch(`${BASE_URL}/donations/${donationId}/delete/`, {
    method: 'DELETE',
  });
  if (res.status === 204) return { success: true };
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete donation.');
  return data;
};

// ── Admin Statistics ──
export const fetchAdminStatistics = async () => {
  const res = await authFetch(`${BASE_URL}/donations/admin/statistics/`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch statistics.');
  return data;
};

// ── Promotion Criteria (FoodSaver Threshold) ──
export const fetchPromotionCriteria = async () => {
  const res = await authFetch(`${BASE_URL}/users/admin/food-saver-threshold/`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch criteria.');
  return data;
};

export const updatePromotionCriteria = async ({ min_score }) => {
  const res = await authFetch(`${BASE_URL}/users/admin/food-saver-threshold/`, {
    method: 'POST',
    body: JSON.stringify({ min_score }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update criteria.');
  return data;
};

// ── Export ──
export const exportAdminData = async (format, dateRange, dataType) => {
  const DATE_MAP = {
    'Last 7 days':   'last_7',
    'Last 30 days':  'last_30',
    'Last 3 months': 'last_3m',
    'This year':     'this_year',
    'All time':      'all',
  };

  const FORMAT_MAP = {
    '.CSV':  'csv',
    '.JSON': 'json',
    '.XLSX': 'xlsx',
  };

  const fmt       = FORMAT_MAP[format] || 'csv';
  const dateParam = DATE_MAP[dateRange] || 'all';
  const typeParam = dataType.toLowerCase();

  const url = `${BASE_URL}/donations/admin/export/?file_format=${fmt}&date_range=${dateParam}&data_type=${typeParam}`;

  const token = localStorage.getItem('access_token');
  const res   = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Export failed.');
  }

  const blob        = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a           = document.createElement('a');
  a.href            = downloadUrl;
  a.download        = `zerowaste_${typeParam}_${dateParam}${format.toLowerCase()}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
};