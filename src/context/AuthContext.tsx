import { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store'; // Para persistir el token

type User = {
  id?: string;
  email: string;
  name?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Aquí cargarías el token de SecureStore para ver si ya está logueado
    const loadSession = async () => {
      try {
        let token: string | null = null;
        let storedUser: string | null = null;
        
        if (Platform.OS === 'web') {
          token = localStorage.getItem('token');
          storedUser = localStorage.getItem('user-data');
        } else {
          token = await SecureStore.getItemAsync('token');
          storedUser = await SecureStore.getItemAsync('user-data');
        }
        
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Error cargando sesión', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const signIn = async (token: string, userData: User) => {
    if (Platform.OS === 'web') {
      localStorage.setItem('token', token);
      localStorage.setItem('user-data', JSON.stringify(userData));
    } else {
      await SecureStore.setItemAsync('token', token);
      await SecureStore.setItemAsync('user-data', JSON.stringify(userData));
    }
    setUser(userData);
  };

  const signOut = async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('token');
      localStorage.removeItem('user-data');
    } else {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user-data');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
