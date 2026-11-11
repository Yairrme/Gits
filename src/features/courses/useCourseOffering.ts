import { useCallback, useEffect, useState } from 'react';
import { getCourseOfferingById } from './courses.service';
import { CourseOffering } from './courses.types';

/**
 * CAPA DE HOOKS (useCourseOffering):
 * Obtiene y mantiene el estado del detalle de una materia (comisión) específica
 * a partir de su `courseOfferingId`.
 */
export function useCourseOffering(courseOfferingId?: string) {
  const [course, setCourse] = useState<CourseOffering | null>(null);
  const [isLoading, setIsLoading] = useState( Boolean(courseOfferingId) );
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!courseOfferingId) {
      setCourse(null);
      setIsLoading(false);
      return;
    }

    try {
      setError('');
      setIsLoading(true);
      const data = await getCourseOfferingById(courseOfferingId);
      setCourse(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo cargar el detalle de la materia.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [courseOfferingId]);

  useEffect(() => {
    let isMounted = true;

    async function fetchDetail() {
      if (!courseOfferingId) {
        if (isMounted) {
          setCourse(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const data = await getCourseOfferingById(courseOfferingId);
        if (isMounted) {
          setCourse(data);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          const message =
            err instanceof Error
              ? err.message
              : 'No se pudo cargar el detalle de la materia.';
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [courseOfferingId]);

  return { course, isLoading, error, reload };
}
