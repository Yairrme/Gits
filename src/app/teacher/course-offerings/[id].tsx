import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCourseOffering } from '@/features/courses/useCourseOffering';
import { CourseOfferingCard } from '@/components/courses/CourseOfferingCard';
import { AppButton } from '@/components/ui/AppButton';
import { Screen } from '@/components/ui/Screen';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

import { makeStyles, useAppTheme } from '@/lib/theme/use-app-theme';
/**
 * CAPA DE PANTALLAS - Detalle de una Materia (`[id].tsx`):
 * Recibe el parámetro dinámico `id` (courseOfferingId) desde la ruta,
 * muestra los datos de la materia y ofrece las acciones docentes con estética recta.
 */
export default function CourseDetailScreen() {
  const styles = useStyles();
  const { colors } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { course, isLoading } = useCourseOffering(id);

  return (
    <Screen>
      <View style={styles.headerBox}>
        <Text style={styles.headerTag}>PANEL DOCENTE DE COMISIÓN</Text>
        <Text style={styles.header}>Gestión de Cursada</Text>
      </View>

      {/* Información de la materia seleccionada */}
      <View style={styles.courseInfoSection}>
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Cargando datos de la materia...</Text>
          </View>
        ) : course ? (
          <CourseOfferingCard course={course} />
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>OPERACIONES DISPONIBLES</Text>

      <View style={styles.actions}>
        <AppButton
          title="Tomar Asistencia en Vivo"
          onPress={() => router.push(`/teacher/course-offerings/${id}/attendance`)}
          variant="primary"
          icon={<Ionicons name="checkbox-sharp" size={18} color={colors.onPrimary} />}
        />
        <AppButton
          title="Ver Nómina de Estudiantes"
          onPress={() => router.push(`/teacher/course-offerings/${id}/students`)}
          variant="secondary"
          icon={<Ionicons name="people-sharp" size={18} color={colors.onPrimary} />}
        />
        <AppButton
          title="Libro de Temas y Clases Dictadas"
          onPress={() => router.push(`/teacher/course-offerings/${id}/sessions`)}
          variant="outline"
          icon={<Ionicons name="journal-sharp" size={18} color={colors.text} />}
        />
      </View>
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
  courseInfoSection: {
    marginBottom: theme.spacing.md,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  loadingText: {
    fontSize: theme.typography.small,
    color: c.textSecondary,
  },
  sectionTitle: {
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
    color: c.text,
    marginBottom: theme.spacing.xs,
  },
  actions: {
    gap: theme.spacing.sm,
  },
}),
);

