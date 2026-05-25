import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://192.168.1.33:8000/api/',
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
  },
});

// ✅ Attach access token to every request
api.interceptors.request.use(
  async (config) => {
    const access = await AsyncStorage.getItem('access');
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = await AsyncStorage.getItem('refresh');
        if (!refresh) throw new Error('No refresh token');

        const { data } = await axios.post(
          'http://192.168.1.33:8000/api/users/token/refresh/',
          { refresh }
        );

        // Save new access token
        await AsyncStorage.setItem('access', data.access);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh failed — clear storage and redirect to login
        await AsyncStorage.multiRemove(['access', 'refresh', 'access_token', 'refresh_token', 'isLoggedIn', 'user']);
        // You can add navigation to login here if needed
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const fetchMyConversations = (): Promise<AxiosResponse> =>
  api.get('/chat/my-conversations/');

export const startConversation = (donationId: number): Promise<AxiosResponse> =>
  api.post(`/chat/start/${donationId}/`);

export const markMessagesRead = (conversationId: number): Promise<AxiosResponse> =>
  api.post(`/chat/${conversationId}/read/`);

export default api;