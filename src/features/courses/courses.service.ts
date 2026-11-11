import { api } from '@/lib/api/api.client';
import { CourseOffering, EnrolledStudent } from './courses.types';

/**
 * CAPA DE SERVICES (Servicios de Cursos):
 * Se encarga exclusivamente de comunicarse con la API HTTP (usando el cliente Axios `api`)
 * y devolver los datos normalizados según los tipos de `courses.types.ts`.
 */

type RawStudentItem = Partial<EnrolledStudent> & {
  student?: Partial<EnrolledStudent> & {
    profile?: Partial<EnrolledStudent>;
  };
  profile?: Partial<EnrolledStudent>;
};

/**
 * Normaliza la estructura de un estudiante por si la API devuelve el alumno directo
 * o envuelto dentro de una inscripción (`{ student: { ... } }`).
 */
function normalizeStudent(raw: RawStudentItem, index: number): EnrolledStudent {
  const source = raw.student ?? raw;
  const profile = source.profile ?? raw.profile;

  return {
    id: String(source.id ?? raw.id ?? `student-${index}`),
    firstName: source.firstName ?? profile?.firstName ?? 'Sin nombre',
    lastName: source.lastName ?? profile?.lastName ?? 'Sin apellido',
    documentNumber: source.documentNumber ?? profile?.documentNumber ?? '-',
    studentNumber: source.studentNumber ?? profile?.studentNumber ?? '-',
  };
}

/**
 * Obtiene el listado de materias asignadas al profesor autenticado.
 */
export async function getMyCourseOfferings(): Promise<CourseOffering[]> {
  const response = await api.get<CourseOffering[]>('/teachers/me/course-offerings');
  return Array.isArray(response.data) ? response.data : [];
}

/**
 * Obtiene el detalle de una materia (comisión) por su ID.
 * Intenta consultar el endpoint directo y, si no está disponible para el rol,
 * la busca dentro de las materias asignadas al docente.
 */
export async function getCourseOfferingById(
  courseOfferingId: string,
): Promise<CourseOffering | null> {
  try {
    const response = await api.get<CourseOffering>(`/course-offerings/${courseOfferingId}`);
    if (response.data && response.data.id) {
      return response.data;
    }
  } catch {
    // Fallback al listado de materias del profesor
  }

  const offerings = await getMyCourseOfferings();
  return offerings.find((item) => item.id === courseOfferingId) ?? null;
}

/**
 * Obtiene el listado de estudiantes inscriptos en una materia específica.
 */
export async function getCourseStudents(courseOfferingId: string): Promise<EnrolledStudent[]> {
  const response = await api.get<RawStudentItem[]>(
    `/course-offerings/${courseOfferingId}/students`,
  );
  const list = Array.isArray(response.data) ? response.data : [];
  return list.map((item, idx) => normalizeStudent(item, idx));
}

/** Inscripción del alumno tal como la devuelve GET /students/me/enrollments */
type StudentEnrollment = {
  id: string;
  status?: 'ACTIVE' | 'DROPPED' | 'COMPLETED' | 'VOID';
  courseOfferingId?: string;
  courseOffering?: CourseOffering | null; // La comisión viene anidada (materia, año, docente)
};

/**
 * Obtiene SOLO las materias (comisiones) en las que está inscripto el alumno autenticado.
 * Endpoint: GET /students/me/enrollments (por defecto devuelve solo inscripciones ACTIVAS).
 *
 * Antes se usaba /students/me/course-offerings (no existe en la API) y, si fallaba,
 * se terminaba pidiendo /course-offerings, que trae TODAS las comisiones del instituto:
 * por eso aparecían materias de más. Ahora, si la API falla, se muestra el error.
 */
export async function getStudentCourseOfferings(): Promise<CourseOffering[]> {
  const response = await api.get<StudentEnrollment[]>('/students/me/enrollments');
  const enrollments = Array.isArray(response.data) ? response.data : [];

  const seen = new Set<string>();
  const courses: CourseOffering[] = [];
  for (const enrollment of enrollments) {
    if (enrollment.status && enrollment.status !== 'ACTIVE') continue; // dadas de baja / finalizadas
    const course = enrollment.courseOffering;
    if (!course?.id || seen.has(course.id)) continue; // sin datos o repetida
    seen.add(course.id);
    courses.push(course);
  }
  return courses;
}

