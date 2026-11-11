import { CourseOfferingCard } from "@/components/courses/CourseOfferingCard";
import { AppButton } from "@/components/ui/AppButton";
import { FeedbackState } from "@/components/ui/FeedbackState";
import { Screen } from "@/components/ui/Screen";
import { theme } from "@/constants/theme";
import { useSession } from "@/features/auth/useSession";
import { useTeacherCourses } from "@/features/courses/useTeacherCourses";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { makeStyles, useAppTheme } from '@/lib/theme/use-app-theme';
/**
 * CAPA DE PANTALLAS - Pantalla Inicial del Docente:
 * Presenta las comisiones a cargo con diseño técnico estructurado y esquinas rectas.
 */
export default function TeacherHomeScreen() {
  const styles = useStyles();
  const { colors } = useAppTheme();
  const router = useRouter();
  const { user } = useSession();
  const { courses, isLoading, error, reload } = useTeacherCourses();

  if (isLoading) {
    return (
      <Screen>
        <FeedbackState title="Cargando comisiones docentes..." isLoading />
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
            title="Ir a mi perfil"
            onPress={() => router.push("/teacher/profile")}
            variant="outline"
          />
        </View>
      </Screen>
    );
  }

  const teacherName = user?.profile?.firstName
    ? `${user.profile.firstName} ${user.profile.lastName || ""}`.trim()
    : user?.name || "Profesor";

  return (
    <Screen>
      {/* Encabezado Institucional del Docente */}
      <View style={styles.headerBlock}>
        <View style={styles.institutionTag}>
          <Text style={styles.institutionText}>
            PORTAL DEL DOCENTE • ITS CIPOLLETTI
          </Text>
        </View>
        <Text style={styles.teacherGreeting}>{teacherName}</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusBadge}>
            <View style={styles.statusIndicator} />
            <Text style={styles.statusBadgeText}>CICLO LECTIVO 2026</Text>
          </View>
          <Text style={styles.roleBadge}>CUERPO DOCENTE ACTIVO</Text>
        </View>
      </View>

      {/* Barra de resumen de materias */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryCount}>{courses.length}</Text>
          <Text style={styles.summaryLabel}>
            {courses.length === 1 ? "Comisión a cargo" : "Comisiones a cargo"}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/teacher/profile")}
          style={styles.summaryAction}
        >
          <Text style={styles.summaryActionText}>Mi credencial</Text>
          <Ionicons
            name="person-sharp"
            size={14}
            color={colors.primary}
          />
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>MIS MATERIAS ASIGNADAS</Text>
        <Text style={styles.sectionSubtitle}>
          Selecciona una comisión para tomar asistencia o gestionar alumnos
        </Text>
      </View>

      {courses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FeedbackState
            title="Sin materias asignadas"
            description="No registras comisiones activas a tu cargo en este ciclo."
          />
          <AppButton
            title="Actualizar"
            onPress={reload}
            variant="secondary"
          />
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CourseOfferingCard
              course={item}
              actionLabel="Gestionar comisión"
              onPress={() =>
                router.push(`/teacher/course-offerings/${item.id}`)
              }
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshing={isLoading}
          onRefresh={reload}
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
    fontWeight: "700",
    color: c.textSecondary,
    letterSpacing: 1,
  },
  teacherGreeting: {
    fontSize: 22,
    fontWeight: "700",
    color: c.text,
    letterSpacing: -0.3,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    flexWrap: "wrap",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "700",
    color: c.text,
    letterSpacing: 0.5,
  },
  roleBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: c.textSecondary,
    letterSpacing: 0.5,
  },
  summaryBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  summaryInfo: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  summaryCount: {
    fontSize: 20,
    fontWeight: "700",
    color: c.primary,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: c.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  summaryAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.background,
  },
  summaryActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: c.primary,
  },
  sectionHeader: {
    marginBottom: theme.spacing.sm,
    paddingLeft: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
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
    fontWeight: "700",
    color: c.danger,
    marginBottom: 4,
    textTransform: "uppercase",
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
    gap: theme.spacing.md,
  },
}),
);
