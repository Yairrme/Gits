/**
 * Tipos del módulo de asistencia.
 */

/** Estados posibles de asistencia de un alumno en una clase */
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'JUSTIFIED';

/** Registro de asistencia guardado en el servidor */
export type AttendanceRecord = {
  id: string;
  classSessionId: string;
  studentId: string;
  status: AttendanceStatus;
  observation?: string | null;
  markedAt: string;          // Fecha ISO en que se marcó
  markedByTeacherId: string; // Docente que la registró
};

/** Registro de asistencia de una clase con los datos del alumno (GET /class-sessions/:id/attendance) */
export type SessionAttendanceRecord = AttendanceRecord & {
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    studentNumber?: string;
    documentNumber?: string;
  } | null;
};

/** Corrección de un registro (PATCH /attendance/:id) */
export type UpdateAttendanceInput = {
  status?: AttendanceStatus;
  observation?: string;
};

/** Una clase dictada (sesión) de una comisión */
export type ClassSession = {
  id: string;
  courseOfferingId: string;
  date: string;
  topic?: string | null; // Tema dado (libro de temas)
  notes?: string | null;
  status: 'OPEN' | 'CLOSED'; // CLOSED = ya no se puede modificar
  createdByTeacherId: string;
  createdAt: string;
  updatedAt: string;
};

/** Datos para crear una clase */
export type CreateClassSessionInput = {
  date: string; // YYYY-MM-DD
  topic: string;
  notes?: string;
};

/** Asistencia de un alumno dentro del envío masivo */
export type MarkAttendanceRecordInput = {
  studentId: string;
  status: AttendanceStatus;
  observation?: string;
};

/** Cuerpo del envío masivo: POST /class-sessions/:id/attendance/bulk */
export type BulkMarkAttendanceInput = {
  records: MarkAttendanceRecordInput[];
};
