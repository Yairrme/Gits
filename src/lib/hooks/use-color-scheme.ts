/**
 * Versión nativa (Android / iOS) del hook de esquema de color.
 * Reexporta directamente el hook de React Native ("light" | "dark" | null).
 * En web, Metro usa automáticamente `use-color-scheme.web.ts` en su lugar.
 */
export { useColorScheme } from 'react-native';
