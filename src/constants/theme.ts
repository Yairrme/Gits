/**
 * Tema visual de toda la app, basado en el diseño del login.
 *
 * - BRAND: colores institucionales (azul y verde del logo).
 * - palettes.light / palettes.dark: colores de cada modo. Los valores base
 *   (background, card, input, text, textSecondary, border, shadow) son los del login.
 * - theme: espaciados, radios y tamaños de letra (no cambian con el modo).
 *
 * En las pantallas se usan con el hook useAppTheme() o con makeStyles()
 * (ver src/lib/theme/use-app-theme.ts).
 */

export const BRAND = {
  blue: '#116EB3',
  green: '#47F54E',
  sun: '#ccc7a9ff',
  error: '#EF4444',
  /** Degradado del botón principal (igual al botón "Ingresar" del login) */
  gradient: ['#116EB3', '#47F54E'] as const,
};

const light = {
  // Base (idéntica al login)
  background: '#FFFFFF',
  card: '#F5F5F5',
  input: '#F0F0F0',
  text: '#111111',
  textSecondary: '#666666',
  border: 'rgba(0,0,0,0.05)',
  shadow: '#CCCCCC',

  // Marca
  primary: BRAND.blue,
  secondary: BRAND.green,
  onPrimary: '#FFFFFF', // texto sobre azul, verde o degradado

  // Estados
  success: '#16A34A',
  warning: '#D97706',
  danger: BRAND.error,

  // Fondos suaves para etiquetas y avisos
  primarySoft: 'rgba(17,110,179,0.10)',
  successSoft: 'rgba(22,163,74,0.10)',
  warningSoft: 'rgba(217,119,6,0.12)',
  dangerSoft: 'rgba(239,68,68,0.10)',
};

export type AppColors = { [K in keyof typeof light]: string };

const dark: AppColors = {
  // Base (idéntica al login)
  background: '#000000',
  card: '#1A1A1A',
  input: '#222222',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  border: 'rgba(255,255,255,0.08)',
  shadow: '#000000',

  // Marca
  primary: BRAND.blue,
  secondary: BRAND.green,
  onPrimary: '#FFFFFF',

  // Estados
  success: BRAND.green,
  warning: '#FBBF24',
  danger: BRAND.error,

  // Fondos suaves para etiquetas y avisos
  primarySoft: 'rgba(17,110,179,0.25)',
  successSoft: 'rgba(71,245,78,0.14)',
  warningSoft: 'rgba(251,191,36,0.16)',
  dangerSoft: 'rgba(239,68,68,0.18)',
};

export const palettes: Record<'light' | 'dark', AppColors> = { light, dark };

export const theme = {
  // Espaciados en píxeles (márgenes y paddings)
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
  },
  // Sin radios de borde: la plataforma usa esquinas rectas (el login conserva las suyas)
  // Tamaños de fuente
  typography: {
    title: 26,
    subtitle: 18,
    body: 15,
    small: 13,
  },
};
