import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const api = axios.create({
  baseURL: 'https://tu-api-nestjs.com', // Cambiar por la URL real
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para pegar el token en cada request
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error al obtener el token', error);
  }
  return config;
});
