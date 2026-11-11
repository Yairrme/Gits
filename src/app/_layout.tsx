import { AuthUser } from "@/features/auth/auth.types";
import { SessionProvider } from "@/features/auth/session.provider";
import { useSession } from "@/features/auth/useSession";
import { useAppTheme } from "@/lib/theme/use-app-theme";
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  useRouter,
  useSegments,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useMemo } from "react";
import { StatusBar } from "react-native";

// Evita que la pantalla de carga (Splash Screen) se oculte antes de verificar la sesión
SplashScreen.preventAutoHideAsync();

/** Sección (carpeta de src/app) a la que pertenece cada rol */
type RoleSection = "student" | "teacher" | "academic";

function getRoleSection(role: AuthUser["role"]): RoleSection {
  if (role === "STUDENT") return "student";
  if (role === "ACADEMIC" || role === "ADMIN") return "academic";
  return "teacher"; // TEACHER, o rol vacío
}

/**
 * Componente principal de navegación y protección de rutas.
 * - Sin sesión: solo puede estar en "(public)" (login).
 * - Con sesión: solo puede estar en la sección de su rol (/student, /teacher o /academic).
 *   Si entra al login, a la raíz o a la sección de otro rol, se lo manda a la suya.
 */
function RootLayoutNav() {
  const { colors, isDark } = useAppTheme(); // Modo claro / oscuro elegido en el login
  const { user, isLoading } = useSession(); // Usuario actual y estado de carga
  const segments = useSegments();           // Primer segmento de la ruta (ej: '(public)', 'teacher')
  const router = useRouter();               // Herramienta de navegación de Expo Router

  useEffect(() => {
    // Si la sesión aún está cargando desde el almacenamiento, esperamos
    if (isLoading) return;

    const currentSection = segments[0];

    if (!user) {
      if (currentSection !== "(public)") router.replace("/(public)/login");
      return;
    }

    const roleSection = getRoleSection(user.role);
    if (currentSection !== roleSection) {
      router.replace(`/${roleSection}`);
    }
  }, [user, isLoading, segments, router]);

  // Una vez terminada la carga de sesión, ocultamos la pantalla de splash inicial
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Tema de navegación con los colores de la app (fondo de pantallas y transiciones)
  const navigationTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.background,
        text: colors.text,
        border: colors.border,
        notification: colors.danger,
      },
    };
  }, [colors, isDark]);

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      {/* Contenedor principal de pantallas en formato Pila (Stack) */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(public)" options={{ headerShown: false }} />
        <Stack.Screen name="teacher" options={{ headerShown: false }} />
        <Stack.Screen name="academic" options={{ headerShown: false }} />
        <Stack.Screen name="student" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}

/**
 * Punto de entrada de la aplicación.
 * Envuelve toda la app en el SessionProvider para que cualquier pantalla pueda acceder al usuario logueado.
 */
export default function RootLayout() {
  return (
    <SessionProvider>
      <RootLayoutNav />
    </SessionProvider>
  );
}
