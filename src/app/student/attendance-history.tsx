import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useStudentAttendance } from '@/features/attendance/useStudentAttendance';
import { AttendanceStatus } from '@/features/attendance/attendance.types';
import { Card } from '@/components/ui/Card';
import { FeedbackState } from '@/components/ui/FeedbackState';
import { AppButton } from '@/components/ui/AppButton';
import { Screen } from '@/components/ui/Screen';
import { AppColors, theme } from '@/constants/theme';
import { formatLongDate } from '@/lib/dates';

import { makeStyles, useAppTheme } from '@/lib/theme/use-app-theme';
/**
 * Colores de cada estado de asistencia, tomados del tema (claro / oscuro).
 */
type StatusStyle = { bg: string; border: string; text: string; label: string; accent: string };

function getStatusStyle(c: AppColors, status: string): StatusStyle {
  switch (status as AttendanceStatus) {
    case 'PRESENT':
      return { bg: c.successSoft, border: c.success, text: c.success, label: 'PRESENTE', accent: c.success };
    case 'ABSENT':
      return { bg: c.dangerSoft, border: c.danger, text: c.danger, label: 'AUSENTE', accent: c.danger };
    case 'LATE':
      return { bg: c.warningSoft, border: c.warning, text: c.warning, label: 'TARDE', accent: c.warning };
    case 'JUSTIFIED':
      return { bg: c.primarySoft, border: c.primary, text: c.primary, label: 'JUSTIFICADO', accent: c.primary };
    default:
      return { bg: c.input, border: c.border, text: c.textSecondary, label: status, accent: c.textSecondary };
  }
}

/**
 * Separa una fecha en día y mes abreviado para el bloque cuadrado de cada registro.
 * Acepta "AAAA-MM-DD" (o ISO "AAAA-MM-DDTHH:mm...") y "DD/MM/AAAA".
 * Ej: "2026-08-06" → { day: "06", month: "AGO" }
 */
function parseDateParts(dateStr: string) {
  if (!dateStr) return { day: '--', month: 'CLASE' };
  try {
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const monthNum = parseInt(parts[1], 10);
        const day = parts[2].slice(0, 2);
        const months = [
          'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
          'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
        ];
        const month = months[monthNum - 1] || parts[1];
        return { day, month };
      }
    }
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length >= 2) {
        const day = parts[0];
        const monthNum = parseInt(parts[1], 10);
        const months = [
          'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
          'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
        ];
        const month = months[monthNum - 1] || parts[1];
        return { day, month };
      }
    }
  } catch {
    // fallback
  }
  return { day: dateStr.slice(-2), month: 'FECHA' };
}

/**
 * Pantalla de historial de asistencias del alumno.
 * Si recibe `courseOfferingId` por parámetro muestra una materia; si no, el historial general.
 */
export default function StudentAttendanceHistoryScreen() {
  const styles = useStyles();
  const { colors } = useAppTheme();
  // Parámetros enviados desde la pantalla de inicio del alumno
  const { courseOfferingId, subjectName, commission } = useLocalSearchParams<{
    courseOfferingId?: string;
    subjectName?: string;
    commission?: string;
  }>();

  const {
    records,
    isLoading,
    error,
    total,
    presentCount,
    percentage,
    reload,
  } = useStudentAttendance(courseOfferingId);

  if (isLoading) {
    return (
      <Screen>
        <FeedbackState title="Cargando asistencias..." isLoading />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <View style={styles.errorBanner}>
          <Text style={styles.errorTitle}>Error al sincronizar asistencias</Text>
          <Text style={styles.errorDescription}>{error}</Text>
        </View>
        <View style={styles.actionContainer}>
          <AppButton
            title="Reintentar consulta"
            onPress={reload}
            variant="primary"
          />
        </View>
      </Screen>
    );
  }

  // Métricas para el panel superior (presentes = Presente + Tarde + Justificado).
  const absentCount = records.filter((r) => r.status === 'ABSENT').length;
  // Condición: sin clases todavía, regular (75% o más) o en riesgo
  const condition =
    total === 0
      ? { color: colors.textSecondary, soft: colors.input, title: 'SIN CLASES REGISTRADAS', note: 'Todavía no hay asistencias cargadas' }
      : percentage >= 75
        ? { color: colors.success, soft: colors.successSoft, title: 'CONDICIÓN: REGULAR', note: 'Mínimo 75% alcanzado' }
        : { color: colors.danger, soft: colors.dangerSoft, title: 'CONDICIÓN: EN RIESGO', note: 'Por debajo del 75%' };
  const isGeneralHistory = !courseOfferingId; // historial de todas las materias

  return (
    <Screen>
      {/* Cabecera Técnica de Materia */}
      <View style={styles.headerBox}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTag}>HISTORIAL DE ASISTENCIA</Text>
          {commission ? (
            <View style={styles.commissionTag}>
              <Text style={styles.commissionText}>COMISIÓN {commission}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.title}>{subjectName || 'Historial General'}</Text>
      </View>

      {/* Panel de Métricas de Asistencia Recto y Estructurado */}
      <Card
        style={[
          styles.metricsCard,
          { borderLeftColor: condition.color },
        ]}
      >
        <View style={styles.metricsTop}>
          <View>
            <Text style={styles.metricBigPercent}>{percentage}%</Text>
            <Text style={styles.metricSubtitle}>ASISTENCIA TOTAL</Text>
          </View>
          <View
            style={[
              styles.conditionBadge,
              {
                backgroundColor: condition.soft,
                borderColor: condition.color,
              },
            ]}
          >
            <Text
              style={[
                styles.conditionText,
                { color: condition.color },
              ]}
            >
              {condition.title}
            </Text>
            <Text style={styles.conditionNote}>
              {condition.note}
            </Text>
          </View>
        </View>

        {/* Barra de progreso recta con marcador de regularidad */}
        <View style={styles.progressSection}>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: condition.color,
                },
              ]}
            />
            {/* Línea de corte 75% */}
            <View style={styles.marker75} />
          </View>
          <View style={styles.trackLegend}>
            <Text style={styles.trackText}>0%</Text>
            <Text style={styles.trackMarkerLabel}>75% Req.</Text>
            <Text style={styles.trackText}>100%</Text>
          </View>
        </View>

        {/* Grilla técnica de 3 columnas */}
        <View style={styles.statsGrid}>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{total}</Text>
            <Text style={styles.statKey}>CLASES DICTADAS</Text>
          </View>
          <View style={styles.gridDivider} />
          <View style={styles.statCol}>
            <Text style={[styles.statVal, { color: colors.success }]}>
              {presentCount}
            </Text>
            <Text style={styles.statKey}>ASISTENCIAS</Text>
          </View>
          <View style={styles.gridDivider} />
          <View style={styles.statCol}>
            <Text style={[styles.statVal, { color: colors.danger }]}>
              {absentCount}
            </Text>
            <Text style={styles.statKey}>AUSENCIAS</Text>
          </View>
        </View>
      </Card>

      {/* Listado de Clases tipo Libro de Actas / Ledger */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>LIBRO DE ASISTENCIAS</Text>
        <Text style={styles.recordCounter}>{records.length} registros</Text>
      </View>

      {records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FeedbackState
            title="Sin asistencias registradas"
            description={isGeneralHistory ? 'Todavía no hay asistencias cargadas en tus materias.' : 'El docente aún no ha cargado registros de asistencia para esta materia.'}
          />
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const statusConfig = getStatusStyle(colors, item.status);
            const dateParts = parseDateParts(item.date);

            return (
              <Card
                style={[
                  styles.recordCard,
                  { borderLeftColor: statusConfig.accent },
                ]}
              >
                <View style={styles.recordContent}>
                  {/* Bloque de Fecha Cuadrado */}
                  <View style={styles.dateBlock}>
                    <Text style={styles.dateDay}>{dateParts.day}</Text>
                    <Text style={styles.dateMonth}>{dateParts.month}</Text>
                  </View>

                  {/* Detalle de clase */}
                  <View style={styles.topicBlock}>
                    {isGeneralHistory && item.subjectName ? (
                      <Text style={styles.recordSubject}>{item.subjectName}</Text>
                    ) : null}
                    <Text style={styles.recordTopic}>
                      {item.topic || 'Clase regular'}
                    </Text>
                    {item.observation ? (
                      <Text style={styles.recordObs}>
                        Nota: {item.observation}
                      </Text>
                    ) : (
                      <Text style={styles.recordDateFull}>{formatLongDate(item.date)}</Text>
                    )}
                  </View>

                  {/* Sello de Estado Rectangular */}
                  <View
                    style={[
                      styles.statusStamp,
                      {
                        backgroundColor: statusConfig.bg,
                        borderColor: statusConfig.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusStampText,
                        { color: statusConfig.text },
                      ]}
                    >
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={reload}
        />
      )}
    </Screen>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
  headerBox: {
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTag: {
    fontSize: 10,
    fontWeight: '700',
    color: c.textSecondary,
    letterSpacing: 1,
  },
  commissionTag: {
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: c.background,
  },
  commissionText: {
    fontSize: 10,
    fontWeight: '700',
    color: c.text,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: c.text,
    letterSpacing: -0.3,
  },
  metricsCard: {
    marginBottom: theme.spacing.md,
    backgroundColor: c.card,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: c.border,
    padding: theme.spacing.md,
  },
  metricsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  metricBigPercent: {
    fontSize: 36,
    fontWeight: '700',
    color: c.text,
    lineHeight: 38,
  },
  metricSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: c.textSecondary,
    letterSpacing: 0.8,
    marginTop: 2,
  },
  conditionBadge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'flex-end',
  },
  conditionText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  conditionNote: {
    fontSize: 10,
    color: c.textSecondary,
    marginTop: 2,
  },
  progressSection: {
    marginBottom: theme.spacing.md,
  },
  track: {
    height: 8,
    backgroundColor: c.input,
    borderWidth: 1,
    borderColor: c.border,
    position: 'relative',
  },
  fill: {
    height: '100%',
  },
  marker75: {
    position: 'absolute',
    left: '75%',
    top: -2,
    bottom: -2,
    width: 2,
    backgroundColor: c.primary,
  },
  trackLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  trackText: {
    fontSize: 10,
    fontWeight: '700',
    color: c.textSecondary,
  },
  trackMarkerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: c.text,
    marginLeft: '50%',
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: c.border,
    paddingTop: theme.spacing.sm,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '700',
    color: c.text,
  },
  statKey: {
    fontSize: 10,
    fontWeight: '700',
    color: c.textSecondary,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  gridDivider: {
    width: 1,
    height: 28,
    backgroundColor: c.border,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textSecondary,
    letterSpacing: 1.2,
  },
  recordCounter: {
    fontSize: 11,
    fontWeight: '700',
    color: c.textSecondary,
  },
  list: {
    paddingBottom: theme.spacing.xl,
  },
  recordCard: {
    marginBottom: 8,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: c.border,
    padding: theme.spacing.sm,
    backgroundColor: c.card,
  },
  recordContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateBlock: {
    width: 46,
    height: 46,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    fontSize: 16,
    fontWeight: '700',
    color: c.text,
    lineHeight: 18,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '700',
    color: c.textSecondary,
    letterSpacing: 0.5,
  },
  topicBlock: {
    flex: 1,
  },
  recordSubject: {
    fontSize: 11,
    fontWeight: '700',
    color: c.primary,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  recordTopic: {
    fontSize: 14,
    fontWeight: '700',
    color: c.text,
  },
  recordDateFull: {
    fontSize: 11,
    color: c.textSecondary,
    marginTop: 2,
  },
  recordObs: {
    fontSize: 11,
    color: c.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  statusStamp: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statusStampText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
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
  },
  errorDescription: {
    fontSize: 13,
    color: c.danger,
  },
  actionContainer: {
    marginTop: theme.spacing.md,
  },
  emptyContainer: {
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.card,
    padding: theme.spacing.md,
  },
}),
);
