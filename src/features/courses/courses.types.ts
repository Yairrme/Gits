/**
 * CAPA DE TYPES (Tipos de Dominio - Cursos):
 * Define la forma exacta de los datos con los que trabaja la aplicación
 * para materias, ciclos lectivos, comisiones (CourseOffering) y alumnos inscriptos.
 */

export type CourseShift = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'VIRTUAL' | 'MIXED';

/** Traducción de los turnos devueltos por la API para mostrar en la interfaz */
export const COURSE_SHIFT_LABELS: Record<CourseShift, string> = {
  MORNING: 'Mañana',
  AFTERNOON: 'Tarde',
  EVENING: 'Noche',
  VIRTUAL: 'Virtual',
  MIXED: 'Mixto',
};

export type Subject = {
  id: string;
  name: string;
  code: string;
};

export type AcademicYear = {
  id: string;
  year: number;
  name: string;
};

export type CourseOffering = {
  id: string;
  commission: string;
  shift: CourseShift;
  subject: Subject;
  academicYear: AcademicYear;
};

export type EnrolledStudent = {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  studentNumber: string;
};

