import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useLocalSearchParams, usePreventRemove } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AttendanceStatusSelector } from '@/components/attendance/AttendanceStatusSelector';
import { COMPACT_ROW_MAX_WIDTH } from '@/components/students/StudentAttendanceRow';
import { AttendanceSummaryCard } from '@/components/attendance/AttendanceSummaryCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { Card } from '@/components/ui/Card';
import { FeedbackState } from '@/components/ui/FeedbackState';
import { Screen } from '@/components/ui/Screen';
import { theme } from '@/constants/theme';
import {
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_STATUS_LABELS,
} from '@/features/attendance/attendance.constants';
import { useClassSessionEditor } from '@/features/attendance/useClassSessionEditor';
import { showAlert, showConfirm } from '@/lib/alert';
import { formatLongDate } from '@/lib/dates';
import { makeStyles, useAppTheme } from '@/lib/theme/use-app-theme';

/**
 * Detalle de una clase dictada (docente): muestra la asistencia de cada alumno
 * y permite corregirla o justificar ausencias.
 * Ruta: /teacher/course-offerings/[id]/class-sessions/[sessionId]
 */
export default function ClassSessionDetailScreen() {
  const styles = useStyles();
  const { colors } = useAppTheme();
  const { sessionId } = useLocalSearchParams<{ id: string; sessionId: string }>();
  const editor = useClassSessionEditor(sessionId || '');
  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  // true cuando el docente aceptó descartar sus cambios: no se vuelve a preguntar
  const [isLeaving, setIsLeaving] = useState(false);
  const { width } = useWindowDimensions();
  const isCompact = width < COMPACT_ROW_MAX_WIDTH;

  const { session, records, isLoading, error, isEditing, isClosed, canEdit, changedIds } = editor;

  // Correcciones sin guardar: volver atrás pide confirmación (en web, también al cerrar la pestaña)
  usePreventRemove(isEditing && changedIds.length > 0 && !isLeaving, ({ repeat }) => {
    showConfirm(
      '¿Descartar los cambios?',
      `Tenés ${changedIds.length === 1 ? '1 corrección' : `${changedIds.length} correcciones`} sin guardar. Si salís ahora, se pierden.`,
      'Descartar y salir',
      'Seguir corrigiendo',
    ).then((wantsToLeave) => {
      if (wantsToLeave) {
        setIsLeaving(true);
        repeat();
      }
    });
  });

  if (isLoading) {
    return (
      <Screen>
        <FeedbackState title="Cargando clase..." isLoading />
      </Screen>
    );
  }

  if (error || !session) {
    return (
      <Screen>
        <FeedbackState title="No se pudo cargar la clase" description={error} />
        <AppButton title="Reintentar" onPress={editor.reload} />
      </Screen>
    );
  }

  const classDate = String(session.date).slice(0, 10);

  // Guarda: si la clase está cerrada primero se pide el motivo (queda en la auditoría)
  const onSavePress = () => {
    if (changedIds.length === 0) {
      showAlert('Sin cambios', 'No modificaste ninguna asistencia.');
      return;
    }
    if (editor.missingJustification.length > 0) {
      showAlert('Falta el motivo', 'Escribí el motivo en la observación de cada alumno justificado.');
      return;
    }
    if (isClosed) {
      setReason('');
      setReasonError('');
      setIsReasonOpen(true);
    } else {
      runSave('');
    }
  };

  const runSave = async (motivo: string) => {
    const result = await editor.save(motivo);
    if (result.ok) {
      showAlert(
        'Asistencia corregida',
        `Se ${result.updated === 1 ? 'actualizó 1 registro' : `actualizaron ${result.updated} registros`}.`,
      );
    } else {
      showAlert('No se pudo guardar', result.message);
    }
  };

  const confirmReason = () => {
    if (reason.trim().length < 5) {
      setReasonError('Escribí un motivo de al menos 5 caracteres.');
      return;
    }
    setIsReasonOpen(false);
    runSave(reason);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <Screen>
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              {/* Datos de la clase */}
              <View style={[styles.headerBox, { borderLeftColor: isClosed ? colors.success : colors.warning }]}>
                <View style={styles.headerTop}>
                  <Text style={styles.date} accessibilityRole="header">
                    {formatLongDate(classDate)}
                  </Text>
                  {/* Estado de la clase: cuadradito de color + etiqueta en el color de texto (se lee en ambos modos) */}
                  <View
                    style={styles.statusBadge}
                    accessible
                    accessibilityLabel={isClosed ? 'Clase cerrada' : 'Clase abierta'}
                  >
                    <View
                      style={[styles.statusDot, { backgroundColor: isClosed ? colors.success : colors.warning }]}
                    />
                    <Text style={styles.statusBadgeText}>{isClosed ? 'CERRADA' : 'ABIERTA'}</Text>
                  </View>
                </View>
                <Text style={styles.topic}>{session.topic || 'Sin tema especificado'}</Text>
              </View>

              <AttendanceSummaryCard
                attendanceMap={editor.statusMap}
                title={isEditing ? 'RESUMEN (CON TUS CAMBIOS)' : 'RESUMEN DE LA CLASE'}
              />

              {/* Aviso de edición / plazo vencido */}
              {isEditing ? (
                <View style={[styles.notice, { borderLeftColor: colors.primary, backgroundColor: colors.primarySoft }]}>
                  <Ionicons name="create-outline" size={18} color={colors.primary} />
                  <Text style={styles.noticeText}>
                    Modo corrección: cambiá el estado o la observación. Para justificar, elegí J y escribí el motivo.
                  </Text>
                </View>
              ) : !canEdit ? (
                <View style={[styles.notice, { borderLeftColor: colors.warning, backgroundColor: colors.warningSoft }]}>
                  <Ionicons name="time-outline" size={18} color={colors.warning} />
                  <Text style={styles.noticeText}>
                    Pasó el plazo para corregir esta clase (hasta el {formatLongDate(editor.deadline)}). Pedile la
                    corrección a Gestión Académica.
                  </Text>
                </View>
              ) : null}

              <Text style={styles.sectionTitle} accessibilityRole="header">
                ALUMNOS ({records.length})
              </Text>
            </View>
          }
          ListEmptyComponent={
            <FeedbackState title="Sin registros" description="Esta clase no tiene asistencias cargadas." />
          }
          renderItem={({ item }) => {
            const value = editor.valueOf(item);
            const changed = changedIds.includes(item.id);
            const needsReason = editor.missingJustification.includes(item.id);
            const colorConfig = ATTENDANCE_STATUS_COLORS[value.status];
            const name = item.student
              ? `${item.student.lastName}, ${item.student.firstName}`
              : 'Alumno';

            const isJustified = value.status === 'JUSTIFIED';
            const stackSelector = isEditing && isCompact; // celular angosto: P / A / T / J en su propia fila

            return (
              <Card style={[styles.row, changed && { borderLeftColor: colors.primary, borderLeftWidth: 4 }]}>
                <View style={[styles.rowTop, stackSelector && styles.rowTopStacked]}>
                  <View style={styles.rowInfo}>
                    <Text style={styles.name} numberOfLines={2}>
                      {name}
                    </Text>
                    <Text style={styles.details}>
                      LEG: {item.student?.studentNumber || '-'}
                      {changed ? '  •  modificado' : ''}
                    </Text>
                  </View>

                  {isEditing ? (
                    <AttendanceStatusSelector
                      currentStatus={value.status}
                      onSelectStatus={(status) => editor.setStatus(item.id, status)}
                      studentName={name}
                      stretch={stackSelector}
                    />
                  ) : (
                    <View
                      style={[styles.stamp, { backgroundColor: colorConfig.bg }]}
                      accessible
                      accessibilityLabel={`${ATTENDANCE_STATUS_LABELS[value.status]}, ${name}`}
                    >
                      <Text style={[styles.stampText, { color: colorConfig.text }]}>
                        {ATTENDANCE_STATUS_LABELS[value.status].toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                {isEditing ? (
                  <TextInput
                    value={value.observation}
                    onChangeText={(text) => editor.setObservation(item.id, text)}
                    placeholder={isJustified ? 'Motivo (obligatorio), ej. certificado médico' : 'Observación (opcional)'}
                    placeholderTextColor={colors.textSecondary}
                    accessibilityLabel={
                      isJustified
                        ? `Motivo de la justificación de ${name}, obligatorio`
                        : `Observación de ${name}, opcional`
                    }
                    style={[styles.observationInput, needsReason && { borderColor: colors.danger }]}
                  />
                ) : item.observation ? (
                  <Text style={styles.observation}>Nota: {item.observation}</Text>
                ) : null}
              </Card>
            );
          }}
          ListFooterComponent={
            <View style={styles.footer}>
              {isEditing ? (
                <>
                  <AppButton
                    title={
                      editor.isSaving
                        ? 'Guardando...'
                        : changedIds.length > 0
                          ? `Guardar cambios (${changedIds.length})`
                          : 'Guardar cambios'
                    }
                    onPress={onSavePress}
                    disabled={editor.isSaving}
                    icon={<Ionicons name="save-outline" size={16} color={colors.onPrimary} />}
                  />
                  <AppButton title="Cancelar" variant="outline" onPress={editor.cancelEditing} disabled={editor.isSaving} />
                </>
              ) : (
                <AppButton
                  title="Corregir asistencia"
                  onPress={editor.startEditing}
                  disabled={!canEdit || records.length === 0}
                  icon={<Ionicons name="create-outline" size={16} color={colors.onPrimary} />}
                />
              )}
            </View>
          }
        />
      </Screen>

      {/* Motivo de la corrección (se pide al reabrir una clase cerrada) */}
      <Modal visible={isReasonOpen} transparent animationType="fade" onRequestClose={() => setIsReasonOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsReasonOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}} accessibilityViewIsModal>
            <Text style={styles.sheetTitle}>Motivo de la corrección</Text>
            <Text style={styles.sheetText}>
              La clase está cerrada: se va a reabrir para guardar {changedIds.length === 1 ? '1 cambio' : `${changedIds.length} cambios`} y
              se vuelve a cerrar. El motivo queda registrado.
            </Text>
            <AppInput
              label="Motivo *"
              value={reason}
              onChangeText={(t) => {
                setReason(t);
                setReasonError('');
              }}
              placeholder="Ej. Error al tomar asistencia"
              error={reasonError}
            />
            <AppButton title="Reabrir y guardar" onPress={confirmReason} />
            <AppButton title="Cancelar" variant="outline" onPress={() => setIsReasonOpen(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    flex: { flex: 1 },
    headerBox: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderLeftWidth: 4,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    // Insignia de estado (patrón de la app): cuadradito de 6 px + etiqueta, sobre el tono de campo
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.input,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    statusDot: {
      width: 6,
      height: 6,
    },
    statusBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: c.text,
      letterSpacing: 0.5,
    },
    date: {
      flexShrink: 1,
      fontSize: 17,
      fontWeight: '700',
      color: c.text,
    },
    topic: {
      fontSize: 14,
      color: c.textSecondary,
      marginTop: 2,
    },
    notice: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'flex-start',
      borderLeftWidth: 4,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    noticeText: {
      flex: 1,
      color: c.text,
      fontSize: 13,
      lineHeight: 18,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textSecondary,
      letterSpacing: 0.6,
      marginTop: 4,
      marginBottom: theme.spacing.sm,
    },
    row: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      marginBottom: 6,
    },
    rowTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    rowTopStacked: {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    rowInfo: {
      flex: 1,
      minWidth: 0,
    },
    name: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
    },
    details: {
      fontSize: 11,
      color: c.textSecondary,
      marginTop: 2,
    },
    stamp: {
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    stampText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.4,
    },
    observation: {
      fontSize: 12,
      color: c.textSecondary,
      fontStyle: 'italic',
      marginTop: 6,
    },
    observationInput: {
      marginTop: 8,
      minHeight: 44,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.input,
      color: c.text,
      fontSize: 13,
      paddingHorizontal: 10,
    },
    footer: {
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xl,
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    sheet: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: c.background,
      borderWidth: 1,
      borderColor: c.border,
      borderTopWidth: 4,
      borderTopColor: c.primary,
      padding: theme.spacing.md,
    },
    sheetTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: c.text,
      marginBottom: 6,
    },
    sheetText: {
      fontSize: 13,
      color: c.textSecondary,
      lineHeight: 18,
      marginBottom: theme.spacing.md,
    },
  }),
);
