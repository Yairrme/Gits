import { AppColors, palettes } from "@/constants/theme";
import { useColorScheme } from "@/lib/hooks/use-color-scheme";
import { useMemo, useSyncExternalStore } from "react";
import { Appearance } from "react-native";

export type AppScheme = "light" | "dark";

// ---------------------------------------------------------------------------
// Modo elegido por el usuario (selector del login).
// Si nunca eligió, se usa el modo del sistema.
// ---------------------------------------------------------------------------
let chosenScheme: AppScheme | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Cambia el modo claro / oscuro de toda la app. */
export function setAppColorScheme(scheme: AppScheme) {
  chosenScheme = scheme;
  try {
    // En Android / iOS también cambia la barra de estado y los componentes nativos
    Appearance.setColorScheme(scheme);
  } catch {
    // En web no está disponible: alcanza con el estado de la app
  }
  listeners.forEach((listener) => listener());
}

/** Modo actual: el elegido por el usuario o, si no eligió, el del sistema. */
export function useAppColorScheme(): AppScheme {
  const systemScheme = useColorScheme();
  const chosen = useSyncExternalStore(
    subscribe,
    () => chosenScheme,
    () => null,
  );
  return chosen ?? (systemScheme === "dark" ? "dark" : "light");
}

/**
 * Colores del modo actual.
 * Uso: const { colors, isDark } = useAppTheme();
 */
export function useAppTheme() {
  const scheme = useAppColorScheme();
  return { scheme, isDark: scheme === "dark", colors: palettes[scheme] };
}

/**
 * Crea un hook de estilos que se recalcula al cambiar de modo.
 * Uso:
 *   const useStyles = makeStyles((c) => StyleSheet.create({ box: { backgroundColor: c.card } }));
 *   function MiPantalla() { const styles = useStyles(); ... }
 */
export function makeStyles<T>(factory: (colors: AppColors) => T) {
  return function useStyles(): T {
    const { colors } = useAppTheme();
    return useMemo(() => factory(colors), [colors]);
  };
}
