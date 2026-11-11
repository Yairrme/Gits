import { Stack } from "expo-router";

/**
 * Layout del grupo público "(public)".
 * Agrupa las pantallas accesibles sin sesión (por ahora solo el login).
 * Se oculta el header porque el login dibuja su propio diseño a pantalla completa.
 */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
