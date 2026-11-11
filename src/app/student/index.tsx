import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useStudentCourses } from '@/features/courses/useStudentCourses';
import { CourseOfferingCard } from '@/components/courses/CourseOfferingCard';
import { FeedbackState } from '@/components/ui/FeedbackState';
import { AppButton } from '@/components/ui/AppButton';
import { Screen } from '@/components/ui/Screen';
import { theme } from '@/constants/theme';
import { useSession } from '@/features/auth/useSession';
import { Ionicons } from '@expo/vector-icons';

import { makeStyles, useAppTheme } from '@/lib/theme/use-app-theme';
/**
 * Pantalla Principal del Estudiante:
 * Presenta una estética institucional y estructurada, con esquinas rectas y
 * arquitectura visual precisa, evitando plantillas genéricas.
 */
export default function StudentHomeScreen() {
  const styles = useStyles();
  const { colors } = useAppTheme();
  const router = useRouter();
  const { user } = useSession();
  const { courses, isLoading, isRefreshing, error, reload, refresh } = useStudentCourses();

  if (isLoading) {
    return (
      <Screen>
        <FeedbackState title="Cargando materias..." isLoading />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <View style={styles.errorBanner}>
          <Text style={styles.errorTitle}>Error al sincronizar materias</Text>
          <Text style={styles.errorDescription}>{error}</Text>
        </View>
        <View style={styles.errorActions}>
          <AppButton
            title="Reintentar conexión"
            onPress={reload}
            variant="primary"
          />
          <AppButton
            title="Ver Asistencias Generales"
            onPress={() => router.push('/student/attendance-history')}
            variant="outline"
          />
        </View>
      </Screen>
    );
  }

  const studentName = user?.profile?.firstName
    ? `${user.profile.firstName} ${user.profile.lastName || ''}`.trim()
    : user?.name
    ? user.name
    : 'Estudiante';

  // Ciclo lectivo de las materias inscriptas (o el año actual si todavía no tiene)
  const academicYear =
    courses.find((c) => c.academicYear?.year)?.academicYear?.year ?? new Date().getFullYear();

  return (
    <Screen>
      {/* Encabezado Institucional con Geometría Recta */}
      <View style={styles.headerBlock}>
        <View style={styles.institutionTag}>
          <Text style={styles.institutionText}>
            PORTAL DEL ESTUDIANTE • ITS CIPOLLETTI
          </Text>
        </View>
        <Text style={styles.studentGreeting}>{studentName}</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusBadge}>
            <View style={styles.statusIndicator} />
            <Text style={styles.statusBadgeText}>CICLO LECTIVO {academicYear}</Text>
          </View>
          <Text style={styles.regularBadge}>ESTUDIANTE</Text>
        </View>
      </View>

      {/* Panel resumen técnico */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryCount}>{courses.length}</Text>
          <Text style={styles.summaryLabel}>
            {courses.length === 1 ? 'Materia inscripta' : 'Materias inscriptas'}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/student/attendance-history')}
          style={styles.summaryAction}
        >
          <Text style={styles.summaryActionText}>Ver historial global</Text>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={colors.primary}
          />
        </Pressable>
      </View>

      {/* Subtítulo de sección */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>MIS CURSADAS</Text>
        <Text style={styles.sectionSubtitle}>
          Selecciona una comisión para consultar clases y porcentaje de asistencia
        </Text>
      </View>

      {courses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FeedbackState
            title="Sin materias asignadas"
            description="No se registran comisiones activas en el período actual."
          />
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CourseOfferingCard
              course={item}
              actionLabel="Ver registro de asistencias"
              onPress={() =>
                router.push({
                  pathname: '/student/attendance-history',
                  params: {
                    courseOfferingId: item.id,
                    subjectName: item.subject?.name || 'Materia',
                    commission: item.commission,
                  },
                })
              }
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshing={isRefreshing}
          onRefresh={refresh}
        />
      )}
    </Screen>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
  headerBlock: {
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
    borderLeftWidth: 4,
    borderLeftColor: c.primary,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  institutionTag: {
    marginBottom: 4,
  },
  institutionText: {
    fontSize: 10,
    fontWeight: '700',
    color: c.textSecondary,
    letterSpacing: 1,
  },
  studentGreeting: {
    fontSize: 22,
    fontWeight: '700',
    color: c.text,
    letterSpacing: -0.3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: c.input,
    borderWidth: 1,
    borderColor: c.border,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    backgroundColor: c.success,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: c.text,
    letterSpacing: 0.5,
  },
  regularBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: c.textSecondary,
    letterSpacing: 0.5,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  summaryInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  summaryCount: {
    fontSize: 20,
    fontWeight: '700',
    color: c.primary,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  summaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.background,
  },
  summaryActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: c.primary,
  },
  sectionHeader: {
    marginBottom: theme.spacing.sm,
    paddingLeft: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textSecondary,
    letterSpacing: 1.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: c.textSecondary,
    marginTop: 2,
  },
  listContainer: {
    paddingBottom: theme.spacing.xl,
  },
  errorBanner: {
    backgroundColor: c.dangerSoft,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: c.danger,
    borderLeftColor: c.danger,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: c.danger,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorDescription: {
    fontSize: 13,
    color: c.danger,
  },
  errorActions: {
    gap: theme.spacing.sm,
  },
  emptyContainer: {
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.card,
    padding: theme.spacing.md,
  },
}),
);
