import { useMemo, useState } from 'react';
import { useCourseStudents } from '@/features/courses/useCourseStudents';
import { formatLongDate, todayString } from '@/lib/dates';
import {
  bulkMarkAttendance,
  closeClassSession,
  createClassSession,
  getClassSessions,
  getSessionAttendance,
  updateClassSession,
} from './attendance.service';
import { AttendanceStatus, ClassSession, MarkAttendanceRecordInput } from './attendance.types';

/** Clase en la que se está guardando la asistencia (se recuerda entre reintentos) */
type PendingSession = {
  id: string;
  attendanceSaved: boolean; // true cuando el envío masivo ya se hizo
};

/** Resultado de `submitAttendance` para que la pantalla sepa qué mostrar */
export type SubmitAttendanceResult =
  | { ok: true; reusedExisting: boolean }    // reusedExisting: se usó una clase abierta y vacía de esa fecha
  | {
      ok: false;
      existingSession?: ClassSession; // ya hay una clase con asistencia ese día
      invalidField?: 'topic';         // falló la validación de un campo del formulario
    };

/**
 * Custom Hook para gestionar todo el ciclo de toma de asistencia:
 * 1. Carga los alumnos inscriptos en la materia.
 * 2. Inicializa a todos como 'PRESENT' por defecto para agilizar el marcado.
 * 3. Permite modificar el estado de cada alumno o hacer cambios en lote.
 * 4. Envía a la API la creación de la clase y el registro masivo de asistencias.
 */
export function useAttendanceSession(courseOfferingId: string) {
  // Carga de alumnos inscriptos usando el hook de cursos
  const { students, isLoading: isLoadingStudents, error: studentsError } = useCourseStudents(
    courseOfferingId,
  );

  // Mapa de cambios manuales de asistencia por cada alumno (clave: studentId)
  const [customAttendanceMap, setCustomAttendanceMap] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [topic, setTopicValue] = useState(''); // Tema de la clase (libro de temas)
  // Error del campo "Tema" (se muestra debajo del campo). Los errores del guardado van en saveError.
  const [topicError, setTopicError] = useState('');
  // Fecha de la clase en formato AAAA-MM-DD. Arranca en "hoy" según la hora LOCAL
  // (con toISOString daba "mañana" después de las 21:00 en Argentina).
  const [date, setDate] = useState(todayString);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  // Clase ya creada en este intento. Si algo falla después de crearla, al reintentar
  // se usa esta misma en vez de crear otra (así no quedan clases duplicadas).
  const [pendingSession, setPendingSession] = useState<PendingSession | null>(null);

  // Mapa completo derivado: inicializa a todos los estudiantes como PRESENTES por defecto
  const attendanceMap = useMemo(() => {
    const map: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      map[s.id] = customAttendanceMap[s.id] ?? 'PRESENT';
    });
    return map;
  }, [students, customAttendanceMap]);

  /** Cambia el tema; al escribir se borra el aviso de "tema obligatorio" */
  const setTopic = (value: string) => {
    setTopicValue(value);
    if (topicError) setTopicError('');
  };

  /**
   * Cambia el estado de asistencia de un estudiante específico
   */
  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setCustomAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  /**
   * Marca a todos los estudiantes con el mismo estado (ej: todos Presentes o todos Ausentes)
   */
  const markAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setCustomAttendanceMap(updated);
  };

  /**
   * Guarda la sesión de clase y envía las asistencias a la API
   * @param autoClose Si es true, cierra automáticamente la sesión luego de guardar
   */
  const submitAttendance = async (autoClose: boolean = false): Promise<SubmitAttendanceResult> => {
    const cleanTopic = topic.trim();
    if (!cleanTopic) {
      setTopicError('Escribí el tema de la clase: es obligatorio para el libro de temas.');
      return { ok: false, invalidField: 'topic' };
    }
    setTopicError('');

    // Se usa una variable local (y no solo el estado) porque el estado se actualiza
    // recién en el próximo render y el catch necesita saber si la clase ya existe.
    let target = pendingSession;
    let reusedExisting = false;

    try {
      setIsSaving(true);
      setSaveError('');
      setSaveSuccess(false);

      // PASO 1: Conseguir la clase (solo la primera vez; en un reintento ya la tenemos)
      if (!target) {
        // ¿Ya hay una clase de esta materia en la fecha elegida?
        const sessions = await getClassSessions(courseOfferingId);
        const sameDate = (Array.isArray(sessions) ? sessions : []).filter(
          (s) => String(s.date ?? '').slice(0, 10) === date,
        );

        if (sameDate.length > 0) {
          // Si alguna quedó ABIERTA y sin asistencias (por ejemplo, un guardado que falló
          // a la mitad), se "abre" esa clase y se carga ahí la asistencia.
          let emptyOpen: ClassSession | null = null;
          for (const s of sameDate) {
            if (s.status !== 'OPEN') continue;
            const existingRecords = await getSessionAttendance(s.id);
            if (existingRecords.length === 0) {
              emptyOpen = s;
              break;
            }
          }

          if (!emptyOpen) {
            // Ya tiene asistencia cargada: no se crea otra. La pantalla ofrece abrirla.
            setSaveError(`Ya hay una clase registrada el ${formatLongDate(date)}.`);
            return { ok: false, existingSession: sameDate[0] };
          }

          if ((emptyOpen.topic ?? '').trim() !== cleanTopic) {
            await updateClassSession(emptyOpen.id, { topic: cleanTopic });
          }
          target = { id: emptyOpen.id, attendanceSaved: false };
          reusedExisting = true;
        } else {
          // No hay clase ese día: se crea (POST /course-offerings/:id/class-sessions)
          const created = await createClassSession(courseOfferingId, { date, topic: cleanTopic });
          target = { id: created.id, attendanceSaved: false };
        }
        setPendingSession(target);
      }

      // PASO 2: Envía la asistencia de todos (POST /class-sessions/:id/attendance/bulk).
      // Si ya se había enviado en un intento anterior, no se repite.
      if (!target.attendanceSaved) {
        const records: MarkAttendanceRecordInput[] = students.map((s) => ({
          studentId: s.id,
          status: attendanceMap[s.id] || 'PRESENT',
        }));
        await bulkMarkAttendance(target.id, { records });
        target = { ...target, attendanceSaved: true };
        setPendingSession(target);
      }

      // PASO 3: Opcionalmente cierra la clase (PATCH /class-sessions/:id/close)
      if (autoClose) {
        await closeClassSession(target.id);
      }

      setPendingSession(null); // Terminó bien: el próximo guardado empieza de cero
      setSaveSuccess(true);
      return { ok: true, reusedExisting };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo guardar la asistencia.';
      setSaveError(
        target
          ? `${message} La clase ya quedó creada: tocá "Guardar" de nuevo para reintentar sin duplicarla.`
          : message,
      );
      return { ok: false };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    students,
    isLoadingStudents,
    studentsError,
    attendanceMap,
    setStudentStatus,
    markAll,
    topic,
    setTopic,
    topicError,
    date,
    setDate,
    isSaving,
    saveError,
    saveSuccess,
    submitAttendance,
    // true si la clase ya se creó y falta terminar de guardar: la fecha y el tema quedan fijos
    isSessionLocked: pendingSession !== null,
    // true si el docente ya marcó algo o escribió el tema (salir sin guardar lo perdería)
    hasUnsavedChanges: Object.keys(customAttendanceMap).length > 0 || topic.trim() !== '',
  };
}
