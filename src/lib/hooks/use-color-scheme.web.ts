import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Versión web del hook de esquema de color.
 * Con renderizado estático (`web.output: "static"`) el HTML se genera en el servidor,
 * donde no se conoce el tema del navegador. Por eso devuelve "light" hasta que
 * el componente se hidrata en el cliente, y recién ahí devuelve el valor real.
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  // Se ejecuta solo en el cliente, después del primer render
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
