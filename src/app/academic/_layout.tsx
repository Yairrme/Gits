import { Stack, useRouter } from "expo-router";
import { HeaderButton } from "@/components/ui/HeaderButton";
import { useStackHeaderOptions } from "@/constants/navigation";
import { useSession } from "@/features/auth/useSession";

/**
 * Layout de la sección /academic (roles ACADEMIC y ADMIN).
 * Usa el header común y agrega el botón "SALIR" para cerrar sesión.
 */
export default function AcademicLayout() {
  const { signOut } = useSession();
  const router = useRouter();
  const headerOptions = useStackHeaderOptions();

  // Borra la sesión guardada y vuelve al login
  // (el guard de _layout.tsx también redirige al quedar user = null).
  const handleLogout = async () => {
    await signOut();
    router.replace("/(public)/login");
  };

  return (
    <Stack screenOptions={headerOptions}>
      <Stack.Screen
        name="index"
        options={{
          title: "Gestión Académica",
          headerRight: () => (
            <HeaderButton
              label="SALIR"
              icon="log-out-outline"
              variant="danger"
              onPress={handleLogout}
            />
          ),
        }}
      />
    </Stack>
  );
}
