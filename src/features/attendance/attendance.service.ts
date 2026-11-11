import { api } from '@/lib/api/api.client';
import {
  AttendanceRecord,
  BulkMarkAttendanceInput,
  ClassSession,
  CreateClassSessionInput,
  SessionAttendanceRecord,
  UpdateAttendanceInput,
} from './attendance.types';

/**
 * Servicios de asistencia: clases (sesiones) y registros de presente/ausente.
 */

/**
 * Lista las clases dictadas de una comisión.
 * Endpoint: GET /course-offerings/:id/class-sessions
 */
export async function getClassSessions(courseOfferingId: string): Promise<ClassSession[]> {
  const response = await api.get<ClassSession[]>(
    `/course-offerings/${courseOfferingId}/class-sessions`,
  );
  return response.data;
}

/**
 * Crea una nueva clase (sesión) con fecha y tema.
 * Endpoint: POST /course-offerings/:id/class-sessions
 */
export async function createClassSession(
  courseOfferingId: string,
  input: CreateClassSessionInput,
): Promise<ClassSession> {
  const response = await api.post<ClassSession>(
    `/course-offerings/${courseOfferingId}/class-sessions`,
    input,
  );
  return response.data;
}

/**
 * Corrige el tema (y/o notas) de una clase. Funciona con la clase ABIERTA o CERRADA.
 * Endpoint: PATCH /class-sessions/:id
 */
export async function updateClassSession(
  classSessionId: string,
  input: { topic?: string; notes?: string },
): Promise<ClassSession> {
  const response = await api.patch<ClassSession>(`/class-sessions/${classSessionId}`, input);
  return response.data;
}

/**
 * Registra la asistencia de todos los alumnos de una clase en una sola petición.
 * Endpoint: POST /class-sessions/:id/attendance/bulk
 */
export async function bulkMarkAttendance(
  classSessionId: string,
  input: BulkMarkAttendanceInput,
): Promise<AttendanceRecord[]> {
  const response = await api.post<AttendanceRecord[]>(
    `/class-sessions/${classSessionId}/attendance/bulk`,
    input,
  );
  return response.data;
}

/**
 * Cierra una clase para que no se pueda seguir modificando.
 * Endpoint: PATCH /class-sessions/:id/close
 */
export async function closeClassSession(classSessionId: string): Promise<ClassSession> {
  const response = await api.patch<ClassSession>(`/class-sessions/${classSessionId}/close`);
  return response.data;
}

// ---------------------------------------------------------------------------
// Corrección de asistencias (docente)
// ---------------------------------------------------------------------------

/**
 * Detalle de una clase (fecha, tema, estado ABIERTA / CERRADA).
 * Endpoint: GET /class-sessions/:id
 */
export async function getClassSession(classSessionId: string): Promise<ClassSession> {
  const response = await api.get<ClassSession>(`/class-sessions/${classSessionId}`);
  return response.data;
}

/**
 * Asistencia de cada alumno en una clase (con los datos del alumno), ordenada por apellido.
 * Endpoint: GET /class-sessions/:id/attendance
 */
export async function getSessionAttendance(
  classSessionId: string,
): Promise<SessionAttendanceRecord[]> {
  const response = await api.get<SessionAttendanceRecord[]>(
    `/class-sessions/${classSessionId}/attendance`,
  );
  const list = Array.isArray(response.data) ? response.data : [];
  return [...list].sort((a, b) =>
    `${a.student?.lastName ?? ''} ${a.student?.firstName ?? ''}`.localeCompare(
      `${b.student?.lastName ?? ''} ${b.student?.firstName ?? ''}`,
      'es',
    ),
  );
}

/**
 * Reabre una clase cerrada para poder corregirla.
 * Endpoint: PATCH /class-sessions/:id/reopen
 * Regla de la API: el docente puede reabrir solo hasta el día siguiente a la fecha de la clase;
 * después, solo Gestión Académica / Admin. Queda registrado en la auditoría con el motivo.
 */
export async function reopenClassSession(classSessionId: string, reason: string): Promise<void> {
  await api.patch(`/class-sessions/${classSessionId}/reopen`, { reason });
}

/**
 * Corrige un registro de asistencia (estado y/u observación). La clase tiene que estar ABIERTA.
 * Endpoint: PATCH /attendance/:id (la API guarda el historial del cambio)
 */
export async function updateAttendanceRecord(
  attendanceId: string,
  input: UpdateAttendanceInput,
): Promise<AttendanceRecord> {
  const response = await api.patch<AttendanceRecord>(`/attendance/${attendanceId}`, input);
  return response.data;
}

/** Un registro del historial de asistencias del alumno logueado (ya normalizado para la pantalla) */
export type StudentAttendanceHistoryItem = {
  id: string;
  date: string;                 // AAAA-MM-DD
  topic?: string | null;
  status: AttendanceRecord['status'];
  observation?: string | null;
  subjectName?: string | null;  // Materia (útil en el historial general)
};

/** Registro tal como lo devuelve la API: la fecha y el tema vienen dentro de classSession */
type RawStudentAttendanceRecord = {
  id: string;
  status: AttendanceRecord['status'];
  observation?: string | null;
  date?: string;
  topic?: string | null;
  classSession?: {
    date?: string;
    topic?: string | null;
    courseOffering?: { subject?: { name?: string } | null } | null;
  } | null;
  courseOffering?: { subject?: { name?: string } | null } | null;
};

/**
 * Historial de asistencias del alumno autenticado (opcionalmente filtrado por materia).
 * Endpoint: GET /students/me/attendance[?courseOfferingId=...]
 * Respuesta: { totals: { PRESENT, ABSENT, LATE, JUSTIFIED }, records: [...] }
 *
 * Si la API falla, el error llega a la pantalla (antes se inventaba un historial
 * con todas las clases como "PRESENTE").
 */
export async function getStudentAttendanceHistory(
  courseOfferingId?: string,
): Promise<StudentAttendanceHistoryItem[]> {
  const response = await api.get<
    { totals?: Record<string, number>; records?: RawStudentAttendanceRecord[] } | RawStudentAttendanceRecord[]
  >('/students/me/attendance', {
    params: courseOfferingId ? { courseOfferingId } : undefined,
  });

  const data = response.data;
  const raw = Array.isArray(data) ? data : Array.isArray(data?.records) ? data.records : [];

  return raw
    .map((r) => ({
      id: r.id,
      // La fecha puede venir como "2026-08-06" o "2026-08-06T00:00:00.000Z": nos quedamos con el día
      date: (r.classSession?.date ?? r.date ?? '').slice(0, 10),
      topic: r.classSession?.topic ?? r.topic ?? null,
      status: r.status,
      observation: r.observation ?? null,
      subjectName:
        r.courseOffering?.subject?.name ?? r.classSession?.courseOffering?.subject?.name ?? null,
    }))
    .sort((a, b) => b.date.localeCompare(a.date)); // más recientes primero
}
