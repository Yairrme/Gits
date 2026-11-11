import { ComponentProps, useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  assignStudentCareer,
  enrollStudentInCourse,
  getCareers,
  getCourseOfferings,
  getStudyPlans,
  searchStudents,
} from "@/features/academic/academic.service";
import {
  CourseOfferingDetail,
  StudentSummary,
} from "@/features/academic/academic.types";
import { COURSE_SHIFT_LABELS } from "@/features/courses/courses.types";
import { AppButton } from "@/components/ui/AppButton";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { SelectField, SelectOption } from "@/components/ui/SelectField";
import { theme } from "@/constants/theme";
import { CreateStudentForm } from "@/components/academic/CreateStudentForm";
import { CreateTeacherForm } from "@/components/academic/CreateTeacherForm";
import { AssignTeacherCourseForm } from "@/components/academic/AssignTeacherCourseForm";
import { useSession } from "@/features/auth/useSession";
import { showAlert } from "@/lib/alert";
import { Ionicons } from "@expo/vector-icons";

import { makeStyles, useAppTheme } from '@/lib/theme/use-app-theme';

// ---------------------------------------------------------------------------
// Pestañas del panel (grilla de 2 columnas; la última ocupa todo el ancho si queda sola)
// ---------------------------------------------------------------------------
type TabKey = "enrollment" | "career" | "newStudent" | "newTeacher" | "teacherCourse";

const TABS: { key: TabKey; label: string; icon: ComponentProps<typeof Ionicons>["name"] }[] = [
  { key: "enrollment", label: "INSCRIBIR ALUMNO", icon: "school-sharp" },
  { key: "career", label: "ASIGNAR CARRERA", icon: "ribbon-sharp" },
  { key: "newStudent", label: "ALTA ALUMNO", icon: "person-add-sharp" },
  { key: "newTeacher", label: "ALTA PROFESOR", icon: "briefcase-sharp" },
  { key: "teacherCourse", label: "ASIGNAR MATERIA A PROFESOR", icon: "easel-sharp" },
];

// ---------------------------------------------------------------------------
// Cómo se muestra cada elemento en las listas de selección
// ---------------------------------------------------------------------------

function toStudentOption(s: StudentSummary): SelectOption {
  return {
    id: s.id,
    label: `${s.lastName}, ${s.firstName}`,
    description: `DNI ${s.documentNumber} · Legajo ${s.studentNumber}`,
  };
}

function toCourseOption(c: CourseOfferingDetail): SelectOption {
  const shift = COURSE_SHIFT_LABELS[c.shift] ?? c.shift;
  const teacher = c.teacher ? `Prof. ${c.teacher.lastName}` : null;
  return {
    id: c.id,
    label: `${c.subject?.name ?? "Materia"} — Com. ${c.commission}`,
    description: [shift, c.academicYear?.year, teacher].filter(Boolean).join(" · "),
  };
}

/**
 * Pantalla de Gestión Académica (roles ADMIN y ACADEMIC).
 * Los alumnos, comisiones, carreras y planes se eligen de listas traídas de la API,
 * así no hay que escribir los UUID a mano.
 */
export default function AcademicHomeScreen() {
  const styles = useStyles();
  const { colors } = useAppTheme();
  const { user } = useSession();
  const [activeTab, setActiveTab] = useState<TabKey>("enrollment");

  // Inscribir alumno a una comisión
  const [enrollStudent, setEnrollStudent] = useState<SelectOption | null>(null);
  const [courseOffering, setCourseOffering] = useState<SelectOption | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Asignar alumno a una carrera
  const [careerStudent, setCareerStudent] = useState<SelectOption | null>(null);
  const [career, setCareer] = useState<SelectOption | null>(null);
  const [studyPlan, setStudyPlan] = useState<SelectOption | null>(null);
  const [cohortYear, setCohortYear] = useState(String(new Date().getFullYear()));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Cargadores de las listas (se llaman al abrir cada selector) ---

  // Alumnos: la búsqueda se hace en la API (por nombre, apellido o DNI)
  const loadStudents = useCallback(
    async (search: string) => (await searchStudents(search)).map(toStudentOption),
    [],
  );

  // Comisiones activas
  const loadCourseOfferings = useCallback(
    async () =>
      (await getCourseOfferings())
        .filter((c) => c.isActive !== false)
        .map(toCourseOption),
    [],
  );

  // Carreras activas
  const loadCareers = useCallback(
    async () =>
      (await getCareers())
        .filter((c) => c.isActive !== false)
        .map((c) => ({ id: c.id, label: c.name, description: `Código ${c.code}` })),
    [],
  );

  // Planes de la carrera elegida (el vigente aparece primero)
  const careerId = career?.id;
  const loadStudyPlans = useCallback(async () => {
    if (!careerId) return [];
    const plans = await getStudyPlans(careerId);
    return [...plans]
      .sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent))
      .map((p) => ({
        id: p.id,
        label: p.name,
        description: `Código ${p.code}${p.isCurrent ? " · Plan vigente" : ""}`,
      }));
  }, [careerId]);

  // Al cambiar de carrera, el plan elegido ya no corresponde
  const handleCareerChange = (option: SelectOption) => {
    if (option.id !== career?.id) setStudyPlan(null);
    setCareer(option);
  };

  /**
   * Envía la inscripción a materia al endpoint POST /enrollments
   */
  const submitEnrollment = async () => {
    if (!enrollStudent || !courseOffering) {
      showAlert("Datos incompletos", "Elegí un alumno y una comisión.");
      return;
    }

    setIsEnrolling(true);
    try {
      await enrollStudentInCourse({
        studentId: enrollStudent.id,
        courseOfferingId: courseOffering.id,
      });
      showAlert(
        "Éxito",
        `${enrollStudent.label} fue inscripto en ${courseOffering.label}.`,
      );
      setCourseOffering(null); // se mantiene el alumno para inscribirlo en otra comisión
    } catch (error) {
      showAlert("Error", error instanceof Error ? error.message : "Ocurrió un error inesperado.");
    } finally {
      setIsEnrolling(false);
    }
  };

  /**
   * Envía la asignación al endpoint POST /student-careers
   */
  const submitCareer = async () => {
    if (!careerStudent || !career || !studyPlan) {
      showAlert("Datos incompletos", "Elegí el alumno, la carrera y el plan de estudio.");
      return;
    }
    const year = Number(cohortYear);
    if (cohortYear.trim() && (!Number.isInteger(year) || year < 1900 || year > 2100)) {
      showAlert("Dato inválido", "El año de cohorte debe ser un año válido (ej. 2026).");
      return;
    }

    setIsSubmitting(true);
    try {
      await assignStudentCareer({
        studentId: careerStudent.id,
        careerId: career.id,
        studyPlanId: studyPlan.id,
        ...(cohortYear.trim() ? { cohortYear: year } : {}),
      });
      showAlert("Éxito", `${careerStudent.label} fue asignado a ${career.label}.`);
      setCareerStudent(null);
      setCareer(null);
      setStudyPlan(null);
    } catch (error) {
      showAlert("Error", error instanceof Error ? error.message : "Ocurrió un error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const userRole = user?.role || "ADMIN";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.flex}
    >
      <Screen>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Bloque superior institucional */}
          <View style={styles.headerBlock}>
            <View style={styles.headerBadgeRow}>
              <Text style={styles.headerOrg}>SISTEMA DE GESTIÓN ACADÉMICA • GITS</Text>
              <View style={styles.roleChip}>
                <Text style={styles.roleChipText}>ROL: {userRole}</Text>
              </View>
            </View>
            <Text style={styles.headerTitle}>Panel de Operaciones</Text>
            <Text style={styles.headerSubtitle}>
              Usuario: {user?.email || "Administrador"} • Periodo {new Date().getFullYear()}
            </Text>
          </View>

          {/* Pestañas */}
          <View style={styles.tabBar}>
            {TABS.map((tab, index) => {
              const isActive = activeTab === tab.key;
              // Si la cantidad es impar, la última pestaña ocupa toda la fila
              const isLoneLast = index === TABS.length - 1 && TABS.length % 2 === 1;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                  style={[styles.tabBtn, isLoneLast && styles.tabBtnFull, isActive && styles.tabBtnActive]}
                >
                  <Ionicons
                    name={tab.icon}
                    size={14}
                    color={isActive ? colors.onPrimary : colors.textSecondary}
                  />
                  <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* MÓDULO 1: Inscribir alumno a materia */}
          {activeTab === "enrollment" ? (
            <Card style={[styles.sectionCard, styles.enrollmentCard]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Inscripción a Comisión</Text>
              </View>
              <Text style={styles.description}>
                Elegí el alumno y la comisión del ciclo lectivo en la que se inscribe.
              </Text>

              <SelectField
                label="ALUMNO"
                placeholder="Elegí un alumno"
                searchPlaceholder="Buscar por nombre, apellido o DNI"
                value={enrollStudent}
                onChange={setEnrollStudent}
                loadOptions={loadStudents}
                filterLocally={false}
              />
              <SelectField
                label="COMISIÓN"
                placeholder="Elegí una comisión"
                searchPlaceholder="Buscar por materia, comisión o docente"
                value={courseOffering}
                onChange={setCourseOffering}
                loadOptions={loadCourseOfferings}
              />

              <View style={styles.buttonSpacing}>
                <AppButton
                  title={isEnrolling ? "Inscribiendo alumno..." : "Inscribir en Comisión"}
                  onPress={submitEnrollment}
                  disabled={isEnrolling}
                  icon={<Ionicons name="checkmark-sharp" size={16} color={colors.onPrimary} />}
                />
              </View>
            </Card>
          ) : null}

          {/* MÓDULO 2: Asignar alumno a carrera */}
          {activeTab === "career" ? (
            <Card style={[styles.sectionCard, styles.careerCard]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Asignación de Carrera</Text>
              </View>
              <Text style={styles.description}>
                Asocia al estudiante con una carrera, su plan de estudios y el año de cohorte.
              </Text>

              <SelectField
                label="ALUMNO"
                placeholder="Elegí un alumno"
                searchPlaceholder="Buscar por nombre, apellido o DNI"
                value={careerStudent}
                onChange={setCareerStudent}
                loadOptions={loadStudents}
                filterLocally={false}
              />
              <SelectField
                label="CARRERA"
                placeholder="Elegí una carrera"
                value={career}
                onChange={handleCareerChange}
                loadOptions={loadCareers}
              />
              <SelectField
                label="PLAN DE ESTUDIO"
                placeholder="Elegí un plan de estudio"
                disabled={!career}
                disabledHint="Elegí primero una carrera"
                value={studyPlan}
                onChange={setStudyPlan}
                loadOptions={loadStudyPlans}
              />
              <Field
                label="AÑO DE COHORTE"
                value={cohortYear}
                onChangeText={setCohortYear}
                keyboardType="numeric"
                placeholder={String(new Date().getFullYear())}
              />

              <View style={styles.buttonSpacing}>
                <AppButton
                  title={isSubmitting ? "Asignando carrera..." : "Asignar Carrera y Plan"}
                  onPress={submitCareer}
                  disabled={isSubmitting}
                  variant="secondary"
                  icon={<Ionicons name="checkmark-sharp" size={16} color={colors.onPrimary} />}
                />
              </View>
            </Card>
          ) : null}

          {/* MÓDULOS 3 y 4: altas de alumnos y profesores */}
          {activeTab === "newStudent" ? <CreateStudentForm /> : null}
          {activeTab === "newTeacher" ? <CreateTeacherForm /> : null}

          {/* MÓDULO 5: asignar una materia (comisión) a un profesor */}
          {activeTab === "teacherCourse" ? <AssignTeacherCourseForm /> : null}
        </ScrollView>
      </Screen>
    </KeyboardAvoidingView>
  );
}

/**
 * Campo de texto simple (se usa para el año de cohorte)
 */
function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "numeric";
  placeholder?: string;
}) {
  const { colors } = useAppTheme();
  const styles = useStyles();
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize="none"
        maxLength={4}
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
      />
    </View>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  headerBlock: {
    backgroundColor: c.card,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: c.primary,
    borderColor: c.border,
    padding: theme.spacing.md,
    marginBottom: 4,
  },
  headerBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  headerOrg: {
    fontSize: 10,
    fontWeight: "700",
    color: c.textSecondary,
    letterSpacing: 0.8,
  },
  roleChip: {
    borderWidth: 1,
    borderColor: c.primary,
    backgroundColor: c.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  roleChipText: {
    fontSize: 10,
    fontWeight: "700",
    color: c.primary,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: c.text,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    color: c.textSecondary,
    marginTop: 2,
  },
  // Grilla de 2 x 2: entra en celulares de 320 px sin cortar los textos
  tabBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: c.border,
    backgroundColor: c.card,
    marginBottom: 6,
  },
  tabBtn: {
    width: "50%",
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: c.border,
    backgroundColor: c.card,
  },
  tabBtnFull: {
    width: "100%",
  },
  tabBtnActive: {
    backgroundColor: c.primary,
  },
  tabBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: c.textSecondary,
    letterSpacing: 0.5,
  },
  tabBtnTextActive: {
    color: c.onPrimary,
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: c.border,
    padding: theme.spacing.md,
    backgroundColor: c.card,
    borderLeftWidth: 4,
  },
  enrollmentCard: {
    borderLeftColor: c.primary,
  },
  careerCard: {
    borderLeftColor: c.secondary,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionTitle: {
    color: c.text,
    fontSize: 16,
    fontWeight: "700",
  },
  description: {
    color: c.textSecondary,
    fontSize: 12,
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  fieldContainer: {
    marginBottom: theme.spacing.sm,
  },
  label: {
    color: c.text,
    fontWeight: "700",
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: c.border,
    color: c.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    backgroundColor: c.input,
  },
  buttonSpacing: {
    marginTop: theme.spacing.xs,
  },
}),
);

