import { useContext } from 'react';
import { AuthContext, AuthContextType } from './session.provider';

/**
 * Hook para acceder a la sesión desde cualquier pantalla:
 * const { user, isLoading, signIn, signOut, sessionNotice } = useSession();
 * Tira un error claro si se usa fuera del SessionProvider.
 */
export function useSession(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSession debe usarse dentro de <SessionProvider>');
  }
  return context;
}
