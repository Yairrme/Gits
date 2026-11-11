import { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, usePreventRemove, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAttendanceSession } from '@/features/attendance/useAttendanceSession';
import {
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_STATUS_LABELS,
} from '@/features/attendance/attendance.constants';
import { AttendanceStatus } from '@/features/attendance/attendance.types';
import { EnrolledStudent } from '@/features/courses/courses.types';
import { AttendanceSummaryCard } from '@/components/attendance/AttendanceSummaryCard';
import { StudentAttendanceRow } from '@/components/students/StudentAttendanceRow';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { formatLongDate, todayString } from '@/lib/dates';
import { showAlert, showConfirm } from '@/lib/alert';
import { FeedbackState } from '@/components/ui/FeedbackState';
import { Screen } from '@/components/ui/Screen';
import { theme } from '@/constants/theme';

import { makeStyles, useAppTheme } from '@/lib/theme/use-app-theme';

/** La clase se cierra automáticamente al guardar la asistencia */
const CLOSE_ON_SAVE = true;

/** Acciones rápidas: marcar a toda la nómina con el mismo estado */
const QUICK_ACTIONS: { status: AttendanceStatus; label: string }[] = [
  { status: 'PRESENT', label: 'TODOS PRESENTES' },
  { status: 'ABSENT', label: 'TODOS AUSENTES' },
];

/**
 * Pantalla para Tomar Asistencia en Vivo:
 * Permite registrar la fecha, tema de la clase y el estado individual de cada alumno.
 */
export default function TakeAttendanceScreen() {
  const styles = useStyles();
  const { colors } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>(); // UUID de la materia
  const router = useRouter();
  const listRef = useRef<FlatList<EnrolledStudent>>(null);
  // true cuando el docente ya decidió salir (guardó o aceptó descartar): no se vuelve a preguntar
  const [isLeaving, setIsLeaving] = useState(false);

  // Hook que administra la carga de alumnos, tema, fecha y envío en lote a la API
  const {
    students,
    isLoadingStudents,
    studentsError,
    attendanceMap,
    setStudentStatus,
    markAll,
    topic,
    setTopic,
    topicError,
    date,
    setDate,
    isSaving,
    saveError,
    submitAttendance,
    isSessionLocked,
    hasUnsavedChanges,
  } = useAttendanceSession(id || '');

  // Si hay asistencia marcada sin guardar, volver atrás pide confirmación (en web, también al cerrar la pestaña)
  const disableLeaveGuard = usePreventRemove(hasUnsavedChanges && !isLeaving, ({ repeat }) => {
    showConfirm(
      '¿Salir sin guardar?',
      'La asistencia que marcaste todavía no se guardó. Si salís ahora, se pierde.',
      'Salir sin guardar',
      'Seguir tomando',
    ).then((wantsToLeave) => {
      if (wantsToLeave) {
        setIsLeaving(true);
        repeat();
      }
    });
  });

  /** Sale de la pantalla sin volver a preguntar (después de guardar o al abrir otra clase) */
  const leaveWithoutPrompt = (navigate: () => void) => {
    setIsLeaving(true);
    disableLeaveGuard();
    navigate();
  };

  // Pantalla de carga mientras se obtienen los estudiantes inscriptos
  if (isLoadingStudents) {
    return (
      <Screen>
        <FeedbackState title="Cargando estudiantes..." isLoading />
      </Screen>
    );
  }

  // Error al cargar estudiantes
  if (studentsError) {
    return (
      <Screen>
        <FeedbackState title="Error al cargar alumnos" description={studentsError} />
      </Screen>
    );
  }

  // Si no hay alumnos inscriptos
  if (!students || students.length === 0) {
    return (
      <Screen>
        <FeedbackState
          title="Sin alumnos"
          description="No hay estudiantes inscriptos en esta materia para tomar asistencia."
        />
      </Screen>
    );
  }

  /**
   * Marca a todos con un estado. Si el docente ya había marcado estados distintos
   * a mano, primero confirma, para no borrar ese trabajo con un toque accidental.
   */
  const handleMarkAll = async (status: AttendanceStatus) => {
    const statuses = new Set(Object.values(attendanceMap));
    const toChange = students.filter((s) => attendanceMap[s.id] !== status).length;
    if (toChange === 0) return;

    if (statuses.size > 1) {
      const label = ATTENDANCE_STATUS_LABELS[status].toLowerCase();
      const confirmed = await showConfirm(
        `¿Marcar a todos ${label}?`,
        `Vas a cambiar ${toChange === 1 ? '1 alumno' : `${toChange} alumnos`} que marcaste distinto.`,
        `Marcar ${label}`,
      );
      if (!confirmed) return;
    }
    markAll(status);
  };

  /**
   * Ejecuta el guardado de la clase y las asistencias en la API
   */
  const handleSave = async () => {
    const result = await submitAttendance(CLOSE_ON_SAVE);

    if (result.ok) {
      showAlert(
        'Éxito',
        result.reusedExisting
          ? 'Se guardó la asistencia en la clase que ya estaba abierta para esa fecha.'
          : '¡Asistencia registrada con éxito!',
      );
      leaveWithoutPrompt(() => router.back()); // Vuelve a la pantalla anterior
      return;
    }

    // Falta el tema: el campo está arriba de la lista, se sube hasta él
    if (result.invalidField === 'topic') {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
      return;
    }

    // Ya hay una clase con asistencia en esa fecha: se ofrece abrirla en vez de duplicarla
    const existing = result.existingSession;
    if (existing) {
      const wantsToOpen = await showConfirm(
        'Clase ya registrada',
        `Ya existe una clase el ${formatLongDate(date)}` +
          (existing.topic ? ` ("${existing.topic}")` : '') +
          '. ¿Querés abrirla para ver o corregir la asistencia?',
        'Abrir clase',
      );
      if (wantsToOpen) {
        leaveWithoutPrompt(() =>
          router.replace({
            pathname: '/teacher/course-offerings/[id]/class-sessions/[sessionId]',
            params: { id: id ?? '', sessionId: existing.id },
          }),
        );
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <Screen>
        <FlatList
          ref={listRef}
          data={students}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          // Encabezado de la lista: Formulario de fecha, tema, resumen y botones rápidos
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.title} accessibilityRole="header">
                Tomar Asistencia
              </Text>

              {/* Fecha de la clase: se elige en un calendario (no se puede elegir un día futuro) */}
              <DatePickerField
                label="Fecha de la clase"
                value={date}
                onChange={setDate}
                maxDate={todayString()}
                disabled={isSessionLocked} // La clase ya se creó: no se puede cambiar de día
              />

              {/* Campo para el tema dictado (requerido por el libro de temas) */}
              <AppInput
                label="Tema de la clase (Obligatorio)"
                accessibilityLabel="Tema de la clase, obligatorio"
                value={topic}
                onChangeText={setTopic}
                editable={!isSessionLocked}
                placeholder="Ej. Introducción a componentes y hooks"
                error={topicError || undefined}
              />

              {/* Tarjeta de resumen con conteo en vivo de presentes/ausentes */}
              <AttendanceSummaryCard attendanceMap={attendanceMap} />

              {/* Botones de acción masiva rápida: el cuadradito repite el color del estado */}
              <View style={styles.quickActions}>
                {QUICK_ACTIONS.map(({ status, label }) => (
                  <Pressable
                    key={status}
                    style={({ pressed }) => [styles.quickActionButton, pressed && styles.pressed]}
                    onPress={() => handleMarkAll(status)}
                    accessibilityRole="button"
                    accessibilityLabel={`Marcar a todos ${ATTENDANCE_STATUS_LABELS[status].toLowerCase()}`}
                  >
                    <View
                      style={[
                        styles.quickActionSwatch,
                        { backgroundColor: ATTENDANCE_STATUS_COLORS[status].bg },
                      ]}
                    />
                    <Text style={styles.quickActionText}>{label}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.subHeader} accessibilityRole="header">
                NÓMINA DE ALUMNOS ({students.length})
              </Text>
            </View>
          }
          // Fila individual por cada estudiante con selector P / A / T / J
          renderItem={({ item }) => (
            <StudentAttendanceRow
              student={item}
              status={attendanceMap[item.id] || 'PRESENT'}
              onChangeStatus={(status) => setStudentStatus(item.id, status)}
            />
          )}
          // Pie de lista: el error del guardado aparece acá, junto al botón que se acaba de tocar
          ListFooterComponent={
            <View style={styles.footer}>
              {saveError ? (
                <View
                  style={styles.errorBanner}
                  accessibilityRole="alert"
                  accessibilityLiveRegion="assertive"
                >
                  <Ionicons name="alert-circle" size={18} color={colors.danger} />
                  <Text style={styles.errorText}>{saveError}</Text>
                </View>
              ) : null}
              <AppButton
                title={isSaving ? 'Guardando asistencia...' : 'Guardar y Cerrar Clase'}
                onPress={handleSave}
                disabled={isSaving}
                variant="primary"
              />
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    header: {
      marginBottom: theme.spacing.sm,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: c.text,
      letterSpacing: -0.3,
      marginBottom: theme.spacing.md,
    },
    subHeader: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textSecondary,
      letterSpacing: 1,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    quickActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    quickActionButton: {
      flex: 1,
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: 12,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.textSecondary,
    },
    quickActionSwatch: {
      width: 10,
      height: 10,
    },
    quickActionText: {
      flexShrink: 1,
      fontSize: 11,
      color: c.text,
      fontWeight: '700',
      letterSpacing: 0.6,
    },
    pressed: {
      opacity: 0.8,
    },
    footer: {
      marginTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    listContent: {
      paddingBottom: theme.spacing.lg,
    },
    // Aviso de error (patrón de la app): fondo rojo suave, borde rojo y franja izquierda de 4 px.
    // El texto va en el color de texto normal para que se lea en los dos modos.
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      borderWidth: 1,
      borderLeftWidth: 4,
      borderColor: c.danger,
      backgroundColor: c.dangerSoft,
      padding: theme.spacing.sm,
    },
    errorText: {
      flex: 1,
      color: c.text,
      fontSize: 13,
      lineHeight: 18,
    },
  }),
);
