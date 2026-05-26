import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.1.38:8000/api/';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
  },
});

// Public routes — no token attached, no refresh attempted
const AUTH_ROUTES = [
  '/register/',
  '/login/',
  '/verify-email/',
  '/forgot-password/',
  '/reset-password/',
  '/token/refresh/',
  '/set-password/',
  '/verify-reset-code/',
];

// Request interceptor — skip token for public routes
api.interceptors.request.use(
  async (config) => {
    const isAuthRoute = AUTH_ROUTES.some(route => config.url?.includes(route));
    if (!isAuthRoute) {
      const access = await AsyncStorage.getItem('access');
      if (access) {
        config.headers.Authorization = `Bearer ${access}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — auto-refresh token on 401, skip for public routes
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = AUTH_ROUTES.some(route =>
      originalRequest.url?.includes(route)
    );

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        const refresh = await AsyncStorage.getItem('refresh');
        if (!refresh) throw new Error('No refresh token');

        const { data } = await axios.post(
          `${BASE_URL}users/token/refresh/`,
          { refresh }
        );

        await AsyncStorage.setItem('access', data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);

      } catch (refreshError) {
        await AsyncStorage.multiRemove([
          'access', 'refresh', 'access_token',
          'refresh_token', 'isLoggedIn', 'user'
        ]);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Chat
export const fetchMyConversations = (): Promise<AxiosResponse> =>
  api.get('/chat/my-conversations/');

export const startConversation = (donationId: number): Promise<AxiosResponse> =>
  api.post(`/chat/start/${donationId}/`);

export const markMessagesRead = (conversationId: number): Promise<AxiosResponse> =>
  api.post(`/chat/${conversationId}/read/`);

// Notifications
export const fetchNotifications = (): Promise<AxiosResponse> =>
  api.get('/notifications/');

export const markNotificationRead = (notificationId: string | number): Promise<AxiosResponse> =>
  api.post(`/notifications/${notificationId}/read/`);

export const savePushToken = (token: string) =>
  api.post('/notifications/save-push-token/', { push_token: token });

// Reservations
export const confirmReservation = (reservationId: number): Promise<AxiosResponse> =>
  api.post(`/reservations/${reservationId}/confirm/`);

export const rejectReservation = (reservationId: number): Promise<AxiosResponse> =>
  api.post(`/reservations/${reservationId}/reject/`);

export default api;