import { api } from "@/lib/api/api.client";
import {
  AcademicYearSummary,
  AssignCareerInput,
  Career,
  CourseOfferingDetail,
  CreateCourseOfferingInput,
  PaginatedTeachers,
  SubjectSummary,
  TeacherSummary,
  CreateEnrollmentInput,
  CreateStudentAccountInput,
  CreateStudentInput,
  CreateTeacherInput,
  TeacherCreated,
  EnrollmentRecord,
  PaginatedStudents,
  StudentCareer,
  StudentSummary,
  StudyPlan,
} from "./academic.types";

/**
 * Servicios de gestión académica (uso exclusivo de roles ADMIN / ACADEMIC).
 */

/** Algunas respuestas pueden venir como lista o como { items: [...] }: devuelve siempre la lista */
function toList<T>(data: T[] | { items?: T[] } | null | undefined): T[] {
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.items) ? data.items : [];
}

/**
 * Busca alumnos por nombre, apellido o DNI.
 * Endpoint: GET /students?q=...&limit=50 (paginado, máximo 100 por página)
 */
export async function searchStudents(search: string): Promise<StudentSummary[]> {
  const { data } = await api.get<PaginatedStudents | StudentSummary[]>("/students", {
    params: { page: 1, limit: 50, ...(search.trim() ? { q: search.trim() } : {}) },
  });
  return toList(data);
}

/**
 * Lista las comisiones (materia + año + docente).
 * Endpoint: GET /course-offerings
 */
export async function getCourseOfferings(): Promise<CourseOfferingDetail[]> {
  const { data } = await api.get<CourseOfferingDetail[]>("/course-offerings");
  return toList(data);
}

/**
 * Lista las carreras del instituto.
 * Endpoint: GET /careers
 */
export async function getCareers(): Promise<Career[]> {
  const { data } = await api.get<Career[]>("/careers");
  return toList(data);
}

/**
 * Lista los planes de estudio de una carrera.
 * Endpoint: GET /study-plans?careerId=...
 */
export async function getStudyPlans(careerId: string): Promise<StudyPlan[]> {
  const { data } = await api.get<StudyPlan[]>("/study-plans", { params: { careerId } });
  return toList(data);
}

/** Saca los campos opcionales vacíos para no enviarlos a la API ("" daría error de validación) */
function withoutEmpty<T extends Record<string, unknown>>(input: T): T {
  return Object.fromEntries(
    Object.entries(input).filter(([, v]) => v !== undefined && v !== ''),
  ) as T;
}

/**
 * Crea el perfil de un alumno.
 * Endpoint: POST /students (roles ADMIN / ACADEMIC). El DNI y el legajo no se pueden repetir (409).
 */
export async function createStudent(input: CreateStudentInput): Promise<StudentSummary> {
  const { data } = await api.post<StudentSummary>("/students", withoutEmpty(input));
  return data;
}

/**
 * Crea la cuenta de acceso (usuario para iniciar sesión) de un alumno ya creado.
 * Endpoint: POST /students/:id/account. La API le pide cambiar la contraseña en el primer ingreso.
 */
export async function createStudentAccount(
  studentId: string,
  input: CreateStudentAccountInput,
): Promise<void> {
  await api.post(`/students/${studentId}/account`, withoutEmpty(input));
}

/**
 * Crea un profesor: su usuario (rol TEACHER) y su perfil, en un solo paso.
 * Endpoint: POST /teachers (roles ADMIN / ACADEMIC).
 */
export async function createTeacher(input: CreateTeacherInput): Promise<TeacherCreated> {
  const { data } = await api.post<TeacherCreated>("/teachers", withoutEmpty(input));
  return data;
}

/**
 * Lista todos los profesores.
 * Endpoint: GET /teachers?page=N&limit=100 (paginado, máximo 100 por página: se piden todas)
 */
export async function getTeachers(): Promise<TeacherSummary[]> {
  const all: TeacherSummary[] = [];
  const MAX_PAGES = 20; // tope de seguridad (2000 profesores)
  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data } = await api.get<PaginatedTeachers | TeacherSummary[]>("/teachers", {
      params: { page, limit: 100 },
    });
    all.push(...toList(data));
    const totalPages = Array.isArray(data) ? 1 : (data?.meta?.totalPages ?? 1);
    if (page >= totalPages) break;
  }
  return all;
}

/**
 * Lista las materias del instituto.
 * Endpoint: GET /subjects
 */
export async function getSubjects(): Promise<SubjectSummary[]> {
  const { data } = await api.get<SubjectSummary[]>("/subjects");
  return toList(data);
}

/**
 * Lista los años lectivos (ciclos).
 * Endpoint: GET /academic-years
 */
export async function getAcademicYears(): Promise<AcademicYearSummary[]> {
  const { data } = await api.get<AcademicYearSummary[]>("/academic-years");
  return toList(data);
}

/**
 * Asigna una materia a un profesor creando la comisión (materia + año lectivo + comisión + turno).
 * Endpoint: POST /course-offerings (roles ADMIN / ACADEMIC)
 */
export async function createCourseOffering(
  input: CreateCourseOfferingInput,
): Promise<CourseOfferingDetail> {
  const { data } = await api.post<CourseOfferingDetail>("/course-offerings", withoutEmpty(input));
  return data;
}

/**
 * Cambia el profesor titular de una comisión que ya existe.
 * Endpoint: PATCH /course-offerings/:id { teacherId }
 * Es el cambio definitivo de titular: la API exige un docente activo y lo deja auditado.
 */
export async function changeCourseOfferingTeacher(
  courseOfferingId: string,
  teacherId: string,
): Promise<CourseOfferingDetail> {
  const { data } = await api.patch<CourseOfferingDetail>(`/course-offerings/${courseOfferingId}`, {
    teacherId,
  });
  return data;
}

/**
 * Asigna un estudiante a una carrera y plan de estudios.
 * Endpoint: POST /student-careers
 */
export async function assignStudentCareer(
  input: AssignCareerInput,
): Promise<StudentCareer> {
  const { data } = await api.post<StudentCareer>("/student-careers", input);
  return data;
}

/**
 * Inscribe un estudiante en una materia/comisión (cursada).
 * Endpoint: POST /enrollments
 * Requiere rol ADMIN o ACADEMIC.
 */
export async function enrollStudentInCourse(
  input: CreateEnrollmentInput,
): Promise<EnrollmentRecord> {
  const { data } = await api.post<EnrollmentRecord>("/enrollments", input);
  return data;
}
