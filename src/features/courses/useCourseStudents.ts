import { useCallback, useEffect, useState } from 'react';
import { getCourseStudents } from './courses.service';
import { EnrolledStudent } from './courses.types';

/**
 * CAPA DE HOOKS (useCourseStudents):
 * Administra la carga, estado de error y actualización del padrón de estudiantes
 * inscriptos en una comisión (`courseOfferingId`).
 */
export function useCourseStudents(courseOfferingId?: string) {
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(courseOfferingId));
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!courseOfferingId) {
      setStudents([]);
      setIsLoading(false);
      return;
    }

    try {
      setError('');
      setIsLoading(true);
      const data = await getCourseStudents(courseOfferingId);
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudieron cargar los estudiantes.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [courseOfferingId]);

  useEffect(() => {
    let isMounted = true;

    async function fetchStudents() {
      if (!courseOfferingId) {
        if (isMounted) {
          setStudents([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        const data = await getCourseStudents(courseOfferingId);
        if (isMounted) {
          setStudents(Array.isArray(data) ? data : []);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : 'No se pudieron cargar los estudiantes.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchStudents();

    return () => {
      isMounted = false;
    };
  }, [courseOfferingId]);

  return { students, isLoading, error, reload };
}

