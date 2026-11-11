import { Redirect } from 'expo-router';

/**
 * Ruta raíz ("/").
 * No tiene contenido propio: redirige siempre al login.
 * Si ya hay sesión, el guard de `_layout.tsx` vuelve a redirigir al panel del rol.
 */
export default function Index() {
  return <Redirect href="/(public)/login" />;
}
