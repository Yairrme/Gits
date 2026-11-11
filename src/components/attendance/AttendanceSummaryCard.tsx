import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { AttendanceStatus } from '@/features/attendance/attendance.types';
import {
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_STATUS_LABELS,
} from '@/features/attendance/attendance.constants';
import { theme } from '@/constants/theme';
import { makeStyles } from '@/lib/theme/use-app-theme';

type Props = {
  attendanceMap: Record<string, AttendanceStatus>;
  title?: string; // Título de la tarjeta (por defecto: el de "Tomar Asistencia")
};

const STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'JUSTIFIED'];

/**
 * Tarjeta con el conteo en vivo de presentes / ausentes / tardes / justificados
 * mientras el docente toma asistencia.
 */
export function AttendanceSummaryCard({
  attendanceMap,
  title = 'RESUMEN DE ASISTENCIA EN VIVO',
}: Props) {
  const styles = useStyles();
  // Cuenta cuántos alumnos hay en cada estado: { PRESENT: 20, ABSENT: 3, ... }
  const counts = Object.values(attendanceMap).reduce(
    (acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<AttendanceStatus, number>,
  );

  const total = Object.keys(attendanceMap).length;

  // El lector de pantalla lee la tarjeta entera de una vez:
  // "Resumen: 24 alumnos. Presente 20, Ausente 2, Tarde 1, Justificado 1"
  const spokenSummary =
    `Resumen: ${total} ${total === 1 ? 'alumno' : 'alumnos'}. ` +
    STATUSES.map((s) => `${ATTENDANCE_STATUS_LABELS[s]} ${counts[s] || 0}`).join(', ');

  return (
    <Card style={styles.card}>
      <View accessible accessibilityLabel={spokenSummary}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.totalText}>Total alumnos: {total}</Text>
        </View>
        <View style={styles.statsRow}>
          {STATUSES.map((status) => {
            const colorConfig = ATTENDANCE_STATUS_COLORS[status];
            const count = counts[status] || 0;
            return (
              <View key={status} style={styles.statItem}>
                <View style={[styles.badge, { backgroundColor: colorConfig.bg }]}>
                  <Text style={[styles.badgeText, { color: colorConfig.text }]}>{count}</Text>
                </View>
                <Text style={styles.statLabel}>{ATTENDANCE_STATUS_LABELS[status]}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </Card>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    card: {
      marginBottom: theme.spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      paddingBottom: 6,
    },
    headerTitle: {
      flexShrink: 1,
      fontSize: 10,
      fontWeight: '700',
      color: c.textSecondary,
      letterSpacing: 0.8,
    },
    totalText: {
      flexShrink: 0, // el total no se parte en dos líneas; si falta lugar, se ajusta el título
      fontSize: 11,
      fontWeight: '700',
      color: c.text,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      minWidth: 32,
      alignItems: 'center',
      marginBottom: 4,
    },
    badgeText: {
      fontWeight: '700',
      fontSize: 13,
      fontVariant: ['tabular-nums'],
    },
    statLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: c.textSecondary,
      letterSpacing: 0.3,
    },
  }),
);
