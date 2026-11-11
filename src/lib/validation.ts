import { parseDateString, todayString } from './dates';

/**
 * Validaciones de formularios. Cada función devuelve el mensaje de error o '' si está bien.
 */

export function required(value: string, field: string): string {
  return value.trim() ? '' : `Completá ${field}.`;
}

/** DNI argentino: 7 u 8 dígitos (se aceptan puntos, que se quitan antes de enviar) */
export function validateDni(value: string): string {
  const digits = value.replace(/\./g, '').trim();
  if (!digits) return 'Completá el DNI.';
  return /^\d{7,8}$/.test(digits) ? '' : 'El DNI debe tener 7 u 8 números.';
}

/** Email con formato válido. Si `optional`, vacío está permitido. */
export function validateEmail(value: string, optional = false): string {
  const v = value.trim();
  if (!v) return optional ? '' : 'Completá el email.';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'El email no es válido.';
}

/** Contraseña de 6 caracteres o más (regla de la API) */
export function validatePassword(value: string): string {
  if (!value) return 'Completá la contraseña.';
  return value.length >= 6 ? '' : 'La contraseña debe tener al menos 6 caracteres.';
}

export function validatePasswordMatch(password: string, repeat: string): string {
  return password === repeat ? '' : 'Las contraseñas no coinciden.';
}

/** Fecha opcional "AAAA-MM-DD" que no sea futura */
export function validatePastDate(value: string): string {
  const v = value.trim();
  if (!v) return '';
  if (!parseDateString(v)) return 'Usá el formato AAAA-MM-DD (ej. 2004-05-15).';
  return v <= todayString() ? '' : 'La fecha no puede ser futura.';
}

/** Quita los puntos del DNI ("40.123.456" → "40123456") */
export function cleanDni(value: string): string {
  return value.replace(/\./g, '').trim();
}
