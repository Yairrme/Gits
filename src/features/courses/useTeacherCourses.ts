import { useCallback, useEffect, useState } from 'react';
import { getMyCourseOfferings } from './courses.service';
import { CourseOffering } from './courses.types';

/**
 * CAPA DE HOOKS (useTeacherCourses):
 * Administra el estado reactivo (datos, carga, error y recarga)
 * para las materias asignadas al profesor autenticado.
 */
export function useTeacherCourses() {
  const [courses, setCourses] = useState<CourseOffering[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    try {
      setError('');
      setIsLoading(true);
      const data = await getMyCourseOfferings();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudieron cargar las materias.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchCourses() {
      try {
        const data = await getMyCourseOfferings();
        if (isMounted) {
          setCourses(Array.isArray(data) ? data : []);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : 'No se pudieron cargar las materias.';
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  return { courses, isLoading, error, reload };
}

