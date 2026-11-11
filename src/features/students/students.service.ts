import { api } from '@/lib/api/api.client';

/** Perfil del alumno autenticado (GET /students/me) */
export type MyStudentProfile = {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string; // DNI
  studentNumber: string;  // Legajo
  email?: string | null;
  isActive: boolean;
};

/**
 * Datos del alumno logueado: nombre, DNI, legajo y si está activo.
 * Endpoint: GET /students/me (rol STUDENT)
 */
export async function getMyStudentProfile(): Promise<MyStudentProfile> {
  const { data } = await api.get<MyStudentProfile>('/students/me');
  return data;
}
