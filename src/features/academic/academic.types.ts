/**
 * Tipos del módulo académico (inscripciones y carreras).
 * Las formas de las respuestas siguen la documentación de la API (/docs).
 */

import { CourseOffering, CourseShift } from '@/features/courses/courses.types';

/** Alumno de la lista GET /students */
export type StudentSummary = {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string; // DNI
  studentNumber: string;  // Legajo
  email?: string | null;
  isActive: boolean;
};

/** Respuesta paginada de GET /students: { items, meta } */
export type PaginatedStudents = {
  items: StudentSummary[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

/** Datos para crear un alumno (POST /students). Los opcionales se omiten si están vacíos. */
export type CreateStudentInput = {
  firstName: string;
  lastName: string;
  documentNumber: string; // DNI
  studentNumber: string;  // Legajo
  email?: string;
  phone?: string;
  birthDate?: string;     // AAAA-MM-DD
};

/** Cuenta de acceso del alumno (POST /students/:id/account). Contraseña de 6 caracteres o más. */
export type CreateStudentAccountInput = {
  email?: string;
  password: string;
};

/** Datos para crear un profesor (POST /teachers): crea su usuario y su perfil a la vez */
export type CreateTeacherInput = {
  email: string;            // Email para iniciar sesión
  password: string;         // 6 caracteres o más
  firstName: string;
  lastName: string;
  documentNumber: string;   // DNI
  employeeNumber: string;   // Número de empleado
  phone?: string;
  institutionalEmail?: string;
};

/** Profesor creado (respuesta de POST /teachers) */
export type TeacherCreated = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  employeeNumber: string;
};

/** Comisión de la lista GET /course-offerings (incluye materia, año y docente) */
export type CourseOfferingDetail = CourseOffering & {
  isActive?: boolean;
  teacherId?: string; // Id del perfil docente titular
  teacher?: { id: string; firstName: string; lastName: string } | null;
};

/** Profesor de la lista GET /teachers (paginada: { items, meta }) */
export type TeacherSummary = {
  id: string; // Id del perfil docente (TeacherProfile): es el que se usa al asignar materias
  firstName: string;
  lastName: string;
  documentNumber: string;
  employeeNumber: string;
  email?: string | null;
  isActive: boolean;
};

export type PaginatedTeachers = {
  items: TeacherSummary[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

/** Materia de GET /subjects */
export type SubjectSummary = {
  id: string;
  name: string;
  code: string;
  year?: number;     // Año de la carrera en que se cursa (1°, 2°, ...)
  isActive?: boolean;
  career?: { id: string; name: string } | null;
};

/** Año lectivo de GET /academic-years */
export type AcademicYearSummary = {
  id: string;
  year: number;
  name: string;
  isActive?: boolean;
};

/**
 * Datos para crear una comisión: asigna un profesor a una materia en un año lectivo
 * (POST /course-offerings). Los opcionales se omiten si están vacíos.
 */
export type CreateCourseOfferingInput = {
  subjectId: string;
  academicYearId: string;
  teacherId: string;   // Id del perfil docente (no el del usuario)
  commission: string;  // Ej. "A"
  shift: CourseShift;
  dayOfWeek?: number;  // 1 = lunes … 7 = domingo
  startTime?: string;  // "HH:MM"
  endTime?: string;    // "HH:MM"
  classroom?: string;
  maxCapacity?: number;
};

/** Carrera de GET /careers */
export type Career = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
};

/** Plan de estudio de GET /study-plans?careerId=... */
export type StudyPlan = {
  id: string;
  careerId: string;
  code: string;
  name: string;
  isCurrent: boolean; // true = plan vigente de la carrera
};

/** Datos que se envían para asignar un alumno a una carrera (POST /student-careers) */
export type AssignCareerInput = {
  studentId: string;
  careerId: string;
  studyPlanId: string;
  cohortYear?: number; // Año de ingreso (cohorte), opcional
};

/** Respuesta del servidor: la asignación creada con su id */
export type StudentCareer = AssignCareerInput & {
  id: string;
};

/** Datos para inscribir un alumno en una comisión (POST /enrollments) */
export type CreateEnrollmentInput = {
  studentId: string;
  courseOfferingId: string;
};

/** Inscripción creada por el servidor */
export type EnrollmentRecord = {
  id: string;
  courseOfferingId: string;
  studentId: string;
  status: 'ACTIVE' | 'DROPPED' | 'COMPLETED';
  enrolledAt: string; // Fecha ISO
};
