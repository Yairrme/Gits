import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useCourseStudents } from '@/features/courses/useCourseStudents';
import { StudentCard } from '@/components/students/StudentCard';
import { AppButton } from '@/components/ui/AppButton';
import { FeedbackState } from '@/components/ui/FeedbackState';
import { Screen } from '@/components/ui/Screen';
import { theme } from '@/constants/theme';

import { makeStyles } from '@/lib/theme/use-app-theme';
/**
 * CAPA DE PANTALLAS - Visualización de Estudiantes Inscriptos (`students.tsx`):
 * Consume el hook `useCourseStudents(id)` y renderiza cada alumno mediante `StudentCard`.
 */
export default function CourseStudentsScreen() {
  const styles = useStyles();
  const { id } = useLocalSearchParams<{ id: string }>(); // UUID de la materia
  const { students, isLoading, error, reload } = useCourseStudents(id);

  // Spinner de carga mientras obtiene los datos del servidor
  if (isLoading) {
    return (
      <Screen>
        <FeedbackState title="Cargando estudiantes..." isLoading />
      </Screen>
    );
  }

  // Error al comunicarse con la API
  if (error) {
    return (
      <Screen>
        <FeedbackState title="Error" description={error} />
        <AppButton title="Reintentar" onPress={reload} variant="primary" />
      </Screen>
    );
  }

  // Caso en que no haya alumnos inscriptos
  if (students.length === 0) {
    return (
      <Screen>
        <FeedbackState
          title="Sin estudiantes"
          description="No hay inscriptos en esta materia."
        />
        <AppButton title="Actualizar" onPress={reload} variant="secondary" />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.headerBox}>
        <Text style={styles.headerTag}>CURSO REGULAR • LISTADO OFICIAL</Text>
        <Text style={styles.header}>Nómina de Estudiantes ({students.length})</Text>
      </View>
      {/* Lista de estudiantes con sus tarjetas informativas */}
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StudentCard student={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshing={isLoading}
        onRefresh={reload}
      />
    </Screen>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
  headerBox: {
    backgroundColor: c.card,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: c.primary,
    borderColor: c.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  headerTag: {
    fontSize: 10,
    fontWeight: '700',
    color: c.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: c.text,
    letterSpacing: -0.2,
  },
  listContainer: {
    paddingBottom: theme.spacing.xl,
  },
}),
);

