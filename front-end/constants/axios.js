import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './api';

const api = axios.create({ baseURL: BASE_URL });


api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;