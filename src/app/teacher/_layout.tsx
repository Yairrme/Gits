import { HeaderButton } from "@/components/ui/HeaderButton";
import { useStackHeaderOptions } from "@/constants/navigation";
import { Stack, useRouter } from "expo-router";

/**
 * Layout de la sección /teacher (rol TEACHER).
 * Declara todas las pantallas del docente: inicio, perfil y las sub-rutas
 * de una comisión (detalle, alumnos, asistencia y libro de temas).
 */
export default function TeacherLayout() {
  const router = useRouter();
  const headerOptions = useStackHeaderOptions();

  return (
    <Stack screenOptions={headerOptions}>
      {/* Pantalla principal del profesor */}
      <Stack.Screen
        name="index"
        options={{
          title: "Portal Docente",
          headerRight: () => (
            <HeaderButton
              label="PERFIL"
              icon="person-sharp"
              onPress={() => router.push("/teacher/profile")}
            />
          ),
        }}
      />

      {/* Perfil del profesor */}
      <Stack.Screen name="profile" options={{ title: "Credencial Docente" }} />

      {/* Detalle de la materia */}
      <Stack.Screen
        name="course-offerings/[id]"
        options={{ title: "Gestión de Materia", headerBackTitle: "Materias" }}
      />

      {/* Listado de estudiantes */}
      <Stack.Screen
        name="course-offerings/[id]/students"
        options={{ title: "Nómina de Estudiantes", headerBackTitle: "Materia" }}
      />

      {/* Registro de asistencia */}
      <Stack.Screen
        name="course-offerings/[id]/attendance"
        options={{ title: "Tomar Asistencia", headerBackTitle: "Materia" }}
      />

      {/* Historial de clases dictadas */}
      <Stack.Screen
        name="course-offerings/[id]/sessions"
        options={{ title: "Libro de Temas", headerBackTitle: "Materia" }}
      />

      {/* Detalle de una clase: ver y corregir / justificar asistencias */}
      <Stack.Screen
        name="course-offerings/[id]/class-sessions/[sessionId]"
        options={{ title: "Detalle de Clase", headerBackTitle: "Clases" }}
      />
    </Stack>
  );
}
