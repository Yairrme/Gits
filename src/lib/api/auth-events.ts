/**
 * Aviso de "sesión vencida" entre el cliente HTTP y la sesión.
 *
 * api.client.ts no puede importar el SessionProvider (sería una dependencia circular),
 * así que cuando la API responde 401 llama a notifyUnauthorized() y el SessionProvider,
 * que se suscribió con onUnauthorized(), cierra la sesión y la app vuelve al login.
 */
type Listener = () => void;

const listeners = new Set<Listener>();

/** Se suscribe al aviso. Devuelve la función para desuscribirse. */
export function onUnauthorized(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Avisa que el token venció o es inválido. */
export function notifyUnauthorized() {
  listeners.forEach((listener) => listener());
}
