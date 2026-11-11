import { Stack, useRouter } from 'expo-router';
import { HeaderButton } from '@/components/ui/HeaderButton';
import { useStackHeaderOptions } from '@/constants/navigation';

/**
 * Layout de la sección /student (rol STUDENT).
 * Declara las pantallas del alumno con el header común
 * y un botón "PERFIL" en la pantalla principal.
 */
export default function StudentLayout() {
  const router = useRouter();
  const headerOptions = useStackHeaderOptions();

  return (
    <Stack screenOptions={headerOptions}>
      {/* Listado de materias del estudiante */}
      <Stack.Screen
        name="index"
        options={{
          title: 'Portal Estudiante',
          headerRight: () => (
            <HeaderButton
              label="PERFIL"
              icon="person-sharp"
              onPress={() => router.push('/student/profile')}
            />
          ),
        }}
      />

      {/* Historial y detalle de asistencia */}
      <Stack.Screen name="attendance-history" options={{ title: 'Registro de Asistencias' }} />

      {/* Perfil del estudiante */}
      <Stack.Screen name="profile" options={{ title: 'Credencial Estudiantil' }} />
    </Stack>
  );
}
