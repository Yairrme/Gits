import { createContext, useState, useEffect, PropsWithChildren } from 'react';
import {
  saveSessionToken,
  getSessionToken,
  deleteSessionToken,
  saveStoredUser,
  getStoredUser,
  deleteStoredUser,
} from '@/lib/storage/secure-storage';
import { onUnauthorized } from '@/lib/api/auth-events';
import { AuthUser } from './auth.types';

// Definición de las funciones y variables que compartirá el contexto de sesión
export type AuthContextType = {
  user: AuthUser | null;                              // Datos del usuario logueado (o null si no hay sesión)
  isLoading: boolean;                                 // Indica si está leyendo los datos de memoria
  sessionNotice: string | null;                       // Aviso para el login (ej. "Tu sesión venció")
  clearSessionNotice: () => void;                     // Borra el aviso
  signIn: (token: string, user: AuthUser) => Promise<void>; // Función para iniciar sesión
  signOut: () => Promise<void>;                       // Función para cerrar sesión
};

// Sin valor por defecto: useSession() avisa si se usa fuera del SessionProvider
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SESSION_EXPIRED_MESSAGE = 'Tu sesión venció. Iniciá sesión de nuevo.';

/**
 * Proveedor de Sesión: Mantiene el estado del usuario activo en toda la aplicación.
 */
export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  // Al montar la app, leemos si había una sesión previa guardada en el dispositivo
  useEffect(() => {
    const loadSession = async () => {
      try {
        const token = await getSessionToken();
        const storedUser = await getStoredUser<AuthUser>();

        // Si existen tanto el token como los datos del usuario, restauramos la sesión
        if (token && storedUser) {
          setUser(storedUser);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error('Error cargando sesión', e);
        setUser(null);
      } finally {
        setIsLoading(false); // Terminó la comprobación inicial
      }
    };

    loadSession();
  }, []);

  // Si la API responde 401 (token vencido), el cliente HTTP ya borró el token:
  // acá se cierra la sesión en memoria y el guard de _layout.tsx lleva al login.
  useEffect(
    () =>
      onUnauthorized(() => {
        setUser(null);
        setSessionNotice(SESSION_EXPIRED_MESSAGE);
      }),
    [],
  );

  /**
   * Inicia sesión: Guarda el token y el perfil en almacenamiento seguro y actualiza el estado en memoria.
   */
  const signIn = async (token: string, userData: AuthUser) => {
    await saveSessionToken(token);
    await saveStoredUser(userData);
    setSessionNotice(null);
    setUser(userData);
  };

  /**
   * Cierra sesión: Borra el token y el usuario del dispositivo y limpia el estado a null.
   */
  const signOut = async () => {
    await deleteSessionToken();
    await deleteStoredUser();
    setSessionNotice(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        sessionNotice,
        clearSessionNotice: () => setSessionNotice(null),
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
