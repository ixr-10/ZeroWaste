import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './api';

const api = axios.create({ baseURL: BASE_URL });

const PUBLIC_ROUTES = ['/register/', '/login/', '/verify-email/', '/forgot-password/', '/reset-password/'];

api.interceptors.request.use(async (config) => {
  const isPublic = PUBLIC_ROUTES.some(route => config.url?.includes(route));
  
  if (!isPublic) {
    const token = await AsyncStorage.getItem('access');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;