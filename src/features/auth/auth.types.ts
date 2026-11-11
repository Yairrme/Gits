/**
 * Tipos del módulo de autenticación.
 */

/** Roles del sistema. Cada uno tiene su propio grupo de rutas en src/app */
export type UserRole = 'ADMIN' | 'ACADEMIC' | 'TEACHER' | 'STUDENT';

/** Datos personales del usuario (alumno o docente) */
export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
};

/** Usuario logueado, tal como lo devuelve /auth/login y se guarda en el dispositivo */
export type AuthUser = {
  id?: string;
  email: string;
  name?: string;
  role?: UserRole; // Si viene vacío, el guard de _layout.tsx lo manda al panel docente
  profile?: UserProfile;
};

/** Datos del formulario de login */
export type LoginCredentials = {
  email: string;
  password: string;
};

/** Respuesta del endpoint POST /auth/login */
export type LoginResponse = {
  accessToken: string; // JWT que se envía en el header Authorization
  user: AuthUser;
};
