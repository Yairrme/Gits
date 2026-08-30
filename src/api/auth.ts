import { api } from './client';
import * as SecureStore from 'expo-secure-store';

export interface LoginPayload {
  email: string;
  password: string;
}

export async function login({ email, password }: LoginPayload) {
  const { data } = await api.post('/auth/login', { email, password });
  
  if (data.access_token) {
    await SecureStore.setItemAsync('token', data.access_token);
  }
  
  return data;
}

export async function logout() {
  await SecureStore.deleteItemAsync('token');
}
