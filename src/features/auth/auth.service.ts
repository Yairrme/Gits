import { api } from '@/lib/api/api.client';
import { LoginCredentials, LoginResponse } from './auth.types';

/**
 * Envía email y contraseña al backend.
 * Endpoint: POST /auth/login → { accessToken, user }
 * Si las credenciales son inválidas, axios lanza un error con el mensaje del servidor.
 * Para cerrar sesión se usa `signOut()` de useSession().
 */
export async function login({ email, password }: LoginCredentials): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  return response.data;
}
