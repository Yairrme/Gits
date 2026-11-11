import { useCallback, useEffect, useState } from 'react';
import { getStudentCourseOfferings } from './courses.service';
import { CourseOffering } from './courses.types';

/**
 * Hook del alumno: carga las materias (comisiones) en las que está inscripto.
 * Devuelve { courses, isLoading, isRefreshing, error, reload, refresh }.
 * - isLoading: carga completa (la pantalla muestra "Cargando...").
 * - isRefreshing: recarga con la lista ya visible (deslizar hacia abajo).
 */
export function useStudentCourses() {
  const [courses, setCourses] = useState<CourseOffering[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Pide las materias a la API (el estado se actualiza recién cuando llega la respuesta)
  const fetchCourses = useCallback(async () => {
    try {
      const data = await getStudentCourseOfferings();
      setCourses(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar tus materias.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Carga inicial al abrir la pantalla. `isMounted` evita actualizar el estado
  // si la pantalla se cerró antes de que llegue la respuesta.
  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      try {
        const data = await getStudentCourseOfferings();
        if (isMounted) setCourses(data);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'No se pudieron cargar tus materias.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadInitial();
    return () => {
      isMounted = false;
    };
  }, []);

  // "Reintentar" desde el error: carga completa
  const reload = useCallback(() => {
    setError('');
    setIsLoading(true);
    fetchCourses();
  }, [fetchCourses]);

  // Deslizar la lista hacia abajo: refresca sin ocultar las materias
  const refresh = useCallback(() => {
    setIsRefreshing(true);
    fetchCourses();
  }, [fetchCourses]);

  return { courses, isLoading, isRefreshing, error, reload, refresh };
}
