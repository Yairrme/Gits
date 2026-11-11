import { useCallback, useEffect, useMemo, useState } from 'react';
import { addDays, todayString } from '@/lib/dates';
import {
  closeClassSession,
  getClassSession,
  getSessionAttendance,
  reopenClassSession,
  updateAttendanceRecord,
} from './attendance.service';
import { AttendanceStatus, ClassSession, SessionAttendanceRecord } from './attendance.types';

/** Cambio pendiente de un registro (lo que el docente modificó en pantalla) */
type Edit = { status: AttendanceStatus; observation: string };

/** Resultado del guardado, para que la pantalla muestre el aviso correcto */
export type SaveResult =
  | { ok: true; updated: number }
  | { ok: false; message: string };

/**
 * Hook del docente para ver y corregir la asistencia de una clase ya tomada.
 *
 * Flujo de "Guardar cambios":
 * 1. Si la clase está CERRADA, la reabre (PATCH /class-sessions/:id/reopen) con el motivo.
 * 2. Guarda solo los registros que cambiaron (PATCH /attendance/:id).
 * 3. Si estaba cerrada, la vuelve a cerrar (PATCH /class-sessions/:id/close).
 */
export function useClassSessionEditor(sessionId: string) {
  const [session, setSession] = useState<ClassSession | null>(null);
  const [records, setRecords] = useState<SessionAttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [edits, setEdits] = useState<Record<string, Edit>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Carga la clase y sus registros (el estado se actualiza recién al llegar la respuesta)
  const fetchAll = useCallback(async () => {
    const [s, r] = await Promise.all([getClassSession(sessionId), getSessionAttendance(sessionId)]);
    return { s, r };
  }, [sessionId]);

  useEffect(() => {
    let isMounted = true;
    fetchAll()
      .then(({ s, r }) => {
        if (!isMounted) return;
        setSession(s);
        setRecords(r);
      })
      .catch((err) => {
        if (isMounted) setError(err instanceof Error ? err.message : 'No se pudo cargar la clase.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [fetchAll]);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const { s, r } = await fetchAll();
      setSession(s);
      setRecords(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la clase.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchAll]);

  // --- Estado visible de cada alumno (lo guardado + lo editado) ---
  const valueOf = (r: SessionAttendanceRecord): Edit =>
    edits[r.id] ?? { status: r.status, observation: r.observation ?? '' };

  const setStatus = (recordId: string, status: AttendanceStatus) => {
    const record = records.find((r) => r.id === recordId);
    if (!record) return;
    setEdits((prev) => ({ ...prev, [recordId]: { ...valueOf(record), ...prev[recordId], status } }));
  };

  const setObservation = (recordId: string, observation: string) => {
    const record = records.find((r) => r.id === recordId);
    if (!record) return;
    setEdits((prev) => ({ ...prev, [recordId]: { ...valueOf(record), ...prev[recordId], observation } }));
  };

  // Registros realmente modificados (si vuelve al valor original, no cuenta)
  const changedIds = useMemo(
    () =>
      records
        .filter((r) => {
          const e = edits[r.id];
          return e && (e.status !== r.status || e.observation.trim() !== (r.observation ?? '').trim());
        })
        .map((r) => r.id),
    [records, edits],
  );

  // Mapa de estados actual, para el resumen de presentes / ausentes
  const statusMap = useMemo(() => {
    const map: Record<string, AttendanceStatus> = {};
    records.forEach((r) => {
      map[r.id] = edits[r.id]?.status ?? r.status;
    });
    return map;
  }, [records, edits]);

  // Plazo del docente: hasta el día siguiente a la fecha de la clase
  const classDate = session?.date ? String(session.date).slice(0, 10) : '';
  const deadline = classDate ? addDays(classDate, 1) : '';
  const isClosed = session?.status === 'CLOSED';
  const canEdit = !isClosed || (deadline !== '' && todayString() <= deadline);

  const startEditing = () => {
    setEdits({});
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEdits({});
    setIsEditing(false);
  };

  /** Errores de validación: un Justificado necesita observación (el motivo) */
  const missingJustification = records
    .filter((r) => changedIds.includes(r.id))
    .filter((r) => {
      const e = valueOf(r);
      return e.status === 'JUSTIFIED' && !e.observation.trim();
    })
    .map((r) => r.id);

  const save = async (reason: string): Promise<SaveResult> => {
    if (changedIds.length === 0) return { ok: false, message: 'No hay cambios para guardar.' };
    if (missingJustification.length > 0) {
      return { ok: false, message: 'Escribí el motivo en la observación de cada alumno justificado.' };
    }

    setIsSaving(true);
    const wasClosed = isClosed;
    try {
      // 1. Reabrir si estaba cerrada
      if (wasClosed) {
        try {
          await reopenClassSession(sessionId, reason.trim());
        } catch (err) {
          const msg = err instanceof Error ? err.message : '';
          return {
            ok: false,
            message:
              `No se pudo reabrir la clase${msg ? `: ${msg}` : ''}. ` +
              'El docente puede corregir hasta el día siguiente a la fecha de la clase; ' +
              'después, pedíselo a Gestión Académica.',
          };
        }
      }

      // 2. Guardar cada registro modificado
      const failed: string[] = [];
      for (const id of changedIds) {
        const record = records.find((r) => r.id === id)!;
        const e = valueOf(record);
        try {
          await updateAttendanceRecord(id, {
            status: e.status,
            observation: e.observation.trim(),
          });
        } catch {
          failed.push(`${record.student?.lastName ?? ''}, ${record.student?.firstName ?? ''}`);
        }
      }

      // 3. Volver a cerrar la clase si estaba cerrada
      let closeError = '';
      if (wasClosed) {
        try {
          await closeClassSession(sessionId);
        } catch (err) {
          closeError = err instanceof Error ? err.message : 'error desconocido';
        }
      }

      await reload();
      setEdits({});
      setIsEditing(false);

      if (failed.length > 0 || closeError) {
        const parts = [];
        if (failed.length > 0) parts.push(`No se pudieron guardar: ${failed.join('; ')}.`);
        if (closeError) parts.push(`La clase quedó abierta (${closeError}).`);
        return { ok: false, message: parts.join(' ') };
      }
      return { ok: true, updated: changedIds.length };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    session,
    records,
    isLoading,
    error,
    reload,
    isEditing,
    startEditing,
    cancelEditing,
    valueOf,
    setStatus,
    setObservation,
    changedIds,
    missingJustification,
    statusMap,
    isClosed,
    canEdit,
    deadline,
    isSaving,
    save,
  };
}
