import { AttendanceStatus } from './attendance.types';

/** Nombre completo de cada estado, para mostrar en la interfaz */
export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: 'Presente',
  ABSENT: 'Ausente',
  LATE: 'Tarde',
  JUSTIFIED: 'Justificado',
};

/** Letra corta de cada estado, usada en los botones P / A / T / J */
export const ATTENDANCE_STATUS_SHORT_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: 'P',
  ABSENT: 'A',
  LATE: 'T',
  JUSTIFIED: 'J',
};

/**
 * Colores de fondo y texto de cada estado (selector, resumen en vivo y sello de la clase).
 * Paleta propia de asistencia, igual en modo claro y oscuro (ver DESIGN.md).
 * La letra blanca sobre cada color supera 4,5:1 y el color se distingue de las tarjetas
 * oscuras (≥ 3:1), así P / A / T / J se leen a pleno sol y de noche.
 */
export const ATTENDANCE_STATUS_COLORS: Record<AttendanceStatus, { bg: string; text: string }> = {
  PRESENT: { bg: '#15803D', text: '#FFFFFF' },
  ABSENT: { bg: '#DC2626', text: '#FFFFFF' },
  LATE: { bg: '#B45309', text: '#FFFFFF' },
  JUSTIFIED: { bg: '#2563EB', text: '#FFFFFF' },
};
