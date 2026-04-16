import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/config';

const API_URL = BASE_URL + 'accounts';

export const register = async (username: string, email: string, password: string, phone?: string) => {
  const res = await axios.post(`${API_URL}/register/`, { username, email, password, phone });
  await AsyncStorage.setItem('access_token', res.data.access);
  await AsyncStorage.setItem('refresh_token', res.data.refresh);
  await AsyncStorage.setItem('isLoggedIn', 'true');
  return res.data.user;
};

export const login = async (username: string, password: string) => {
  const res = await axios.post(`${API_URL}/login/`, { username, password });
  await AsyncStorage.setItem('access_token', res.data.access);
  await AsyncStorage.setItem('refresh_token', res.data.refresh);
  await AsyncStorage.setItem('isLoggedIn', 'true');
  return res.data.user;
};

export const logout = async () => {
  await AsyncStorage.removeItem('access_token');
  await AsyncStorage.removeItem('refresh_token');
  await AsyncStorage.removeItem('isLoggedIn');
};

export const getToken = async () => {
  return await AsyncStorage.getItem('access_token');
};