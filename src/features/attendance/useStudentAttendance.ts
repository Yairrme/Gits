import { useCallback, useEffect, useState } from 'react';
import {
  getStudentAttendanceHistory,
  StudentAttendanceHistoryItem,
} from './attendance.service';

/**
 * Hook del alumno: carga su historial de asistencias y calcula las métricas
 * (total de clases, presentes y porcentaje).
 * @param courseOfferingId Si se pasa, filtra por esa materia; si no, trae el historial general.
 */
export function useStudentAttendance(courseOfferingId?: string) {
  const [records, setRecords] = useState<StudentAttendanceHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Recarga manual (botón "Reintentar" o pull-to-refresh)
  const reload = useCallback(async () => {
    try {
      setError('');
      setIsLoading(true);
      const data = await getStudentAttendanceHistory(courseOfferingId);
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudieron cargar las asistencias.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [courseOfferingId]);

  // Carga inicial. `isMounted` evita actualizar el estado si la pantalla
  // se cerró antes de que llegue la respuesta.
  useEffect(() => {
    let isMounted = true;

    async function fetchAttendance() {
      try {
        const data = await getStudentAttendanceHistory(courseOfferingId);
        if (isMounted) {
          setRecords(Array.isArray(data) ? data : []);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : 'No se pudieron cargar las asistencias.';
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchAttendance();

    return () => {
      isMounted = false;
    };
  }, [courseOfferingId]);

  // Métricas derivadas (se recalculan en cada render a partir de `records`).
  // Cuentan como asistencia: Presente, Tarde (vino a clase) y Justificado. Solo Ausente resta.
  const total = records.length;
  const presentCount = records.filter(
    (r) => r.status === 'PRESENT' || r.status === 'LATE' || r.status === 'JUSTIFIED',
  ).length;
  const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  return {
    records,
    isLoading,
    error,
    total,
    presentCount,
    percentage,
    reload,
  };
}
