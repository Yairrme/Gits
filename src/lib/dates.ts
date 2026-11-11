/**
 * Utilidades de fechas en hora LOCAL (no UTC).
 * La API recibe las fechas de clase como texto "AAAA-MM-DD".
 * Usar toISOString() daría la fecha UTC: en Argentina (UTC-3), después de las 21:00
 * ya sería "mañana". Por eso acá todo se arma con getFullYear / getMonth / getDate.
 */

export const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export const WEEKDAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/** Iniciales de los días empezando por lunes (como se usa en Argentina) */
export const WEEKDAY_INITIALS_MONDAY_FIRST = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Date → "AAAA-MM-DD" en hora local */
export function toDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Fecha de hoy como "AAAA-MM-DD" (hora local) */
export function todayString(): string {
  return toDateString(new Date());
}

/** "AAAA-MM-DD" → Date a las 00:00 hora local. Devuelve null si el texto no es una fecha válida. */
export function parseDateString(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  // Descarta fechas imposibles como 2026-02-31
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

/** Suma (o resta) días a una fecha "AAAA-MM-DD". Devuelve el texto original si no es válida. */
export function addDays(value: string, days: number): string {
  const date = parseDateString(value);
  if (!date) return value;
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

/** "AAAA-MM-DD" → "jueves 6 de agosto de 2026" */
export function formatLongDate(value: string): string {
  const date = parseDateString(value);
  if (!date) return value;
  return `${WEEKDAY_NAMES[date.getDay()]} ${date.getDate()} de ${MONTH_NAMES[date.getMonth()]} de ${date.getFullYear()}`;
}
