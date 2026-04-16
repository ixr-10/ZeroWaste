import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './config';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto attach token
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

export const fetchMyConversations = (): Promise<AxiosResponse> =>
  api.get('/chat/my-conversations/');

export const startConversation = (donationId: number): Promise<AxiosResponse> =>
  api.post(`/chat/start/${donationId}/`);

export const markMessagesRead = (conversationId: number): Promise<AxiosResponse> =>
  api.post(`/chat/${conversationId}/read/`);

export default api;