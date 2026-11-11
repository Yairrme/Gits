import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_TOKEN_KEY = 'session_token';
const USER_DATA_KEY = 'user_data';

/**
 * Guarda el token de acceso JWT.
 * En la Web utiliza 'localStorage', mientras que en Móviles (Android/iOS)
 * utiliza 'expo-secure-store' (almacenamiento encriptado de hardware).
 */
export async function saveSessionToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
  }
}

/**
 * Obtiene el token de acceso JWT almacenado.
 */
export async function getSessionToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  }
  return await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
}

/**
 * Elimina el token de sesión guardado.
 */
export async function deleteSessionToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(SESSION_TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
  }
}

/**
 * Guarda los datos del usuario en formato JSON.
 */
export async function saveStoredUser(userData: unknown): Promise<void> {
  const json = JSON.stringify(userData);
  if (Platform.OS === 'web') {
    localStorage.setItem(USER_DATA_KEY, json);
  } else {
    await SecureStore.setItemAsync(USER_DATA_KEY, json);
  }
}

/**
 * Recupera los datos del usuario deserializándolos desde JSON.
 */
export async function getStoredUser<T>(): Promise<T | null> {
  let raw: string | null = null;
  if (Platform.OS === 'web') {
    raw = localStorage.getItem(USER_DATA_KEY) ?? localStorage.getItem('user-data');
  } else {
    raw = (await SecureStore.getItemAsync(USER_DATA_KEY)) ?? (await SecureStore.getItemAsync('user-data'));
  }
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Elimina los datos del usuario almacenados.
 */
export async function deleteStoredUser(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem('user-data');
  } else {
    await SecureStore.deleteItemAsync(USER_DATA_KEY);
    await SecureStore.deleteItemAsync('user-data');
  }
}
