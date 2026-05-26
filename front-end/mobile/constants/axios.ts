import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { appendIsInitial } from 'expo-router/build/fork/getStateFromPath-forks';

const api = axios.create({


  baseURL: 'http://192.168.1.38:8000/api/',



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

// ==================== EXISTING FUNCTIONS ====================
export const fetchMyConversations = (): Promise<AxiosResponse> => 
  api.get('/chat/my-conversations/');

export const startConversation = (donationId: number): Promise<AxiosResponse> =>
  api.post(`/chat/start/${donationId}/`);

export const markMessagesRead = (conversationId: number): Promise<AxiosResponse> =>
  api.post(`/chat/${conversationId}/read/`);

// ==================== NEW FUNCTIONS FOR NOTIFICATIONS ====================

export const fetchNotifications = (): Promise<AxiosResponse> =>
  api.get('/notifications/');

export const confirmReservation = (reservationId: number): Promise<AxiosResponse> =>
  api.post(`/reservations/${reservationId}/confirm/`);

export const rejectReservation = (reservationId: number): Promise<AxiosResponse> =>
  api.post(`/reservations/${reservationId}/reject/`);

// Optional: Mark notification as read
export const markNotificationRead = (notificationId: string | number): Promise<AxiosResponse> =>
  api.post(`/notifications/${notificationId}/read/`);

export const savePushToken = (token: string) =>
  api.post("/api/notifications/save-push-token/", { push_token: token });

export default api;
