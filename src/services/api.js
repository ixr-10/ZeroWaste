const BASE_URL = 'http://localhost:8000/api/users';

export const loginUser = async (username, password) => {
  const response = await fetch(`${BASE_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Login failed.');
  return data;
};

export const getProfile = async (accessToken) => {
  const response = await fetch(`${BASE_URL}/profile/`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to get profile.');
  return data;
};