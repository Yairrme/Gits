import { useMemo } from 'react';
import { useAppTheme } from '@/lib/theme/use-app-theme';

/**
 * Estilo común del header para los Stack de cada rol (student, teacher, academic).
 * Usa los colores del modo actual (claro / oscuro), igual que el login.
 * Uso: const headerOptions = useStackHeaderOptions();
 *      <Stack screenOptions={headerOptions}>
 */
export function useStackHeaderOptions() {
  const { colors } = useAppTheme();

  return useMemo(
    () =>
      ({
        headerShown: true,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 17,
          color: colors.text,
        },
        headerShadowVisible: false,
        headerTintColor: colors.primary,
        headerBackTitle: 'Volver',
        contentStyle: { backgroundColor: colors.background },
      }) as const,
    [colors],
  );
}
