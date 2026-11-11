import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { EnrolledStudent } from '@/features/courses/courses.types';
import { AttendanceStatus } from '@/features/attendance/attendance.types';
import { AttendanceStatusSelector } from '@/components/attendance/AttendanceStatusSelector';
import { makeStyles } from '@/lib/theme/use-app-theme';

type Props = {
  student: EnrolledStudent;
  status: AttendanceStatus;
  onChangeStatus: (status: AttendanceStatus) => void;
};

/**
 * Debajo de este ancho de pantalla, el selector P / A / T / J baja a su propia fila
 * y ocupa todo el ancho: así los botones mantienen 44 px y el nombre no se corta.
 */
export const COMPACT_ROW_MAX_WIDTH = 380;

/**
 * Fila de la lista de "Tomar Asistencia": nombre, legajo y DNI del alumno
 * más el selector P / A / T / J.
 */
export function StudentAttendanceRow({ student, status, onChangeStatus }: Props) {
  const styles = useStyles();
  const { width } = useWindowDimensions();
  const isCompact = width < COMPACT_ROW_MAX_WIDTH;
  const fullName = `${student.lastName}, ${student.firstName}`;

  return (
    <Card style={styles.card}>
      <View style={[styles.content, isCompact && styles.contentCompact]}>
        <View style={styles.info}>
          {/* Hasta 2 líneas: el docente tiene que poder reconocer al alumno por su nombre completo */}
          <Text style={styles.name} numberOfLines={2}>
            {fullName}
          </Text>
          <Text style={styles.details}>
            LEG: {student.studentNumber || '-'}
            {'  •  '}
            DNI: {student.documentNumber || '-'}
          </Text>
        </View>
        <AttendanceStatusSelector
          currentStatus={status}
          onSelectStatus={onChangeStatus}
          studentName={fullName}
          stretch={isCompact}
        />
      </View>
    </Card>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    card: {
      marginBottom: 6,
      paddingVertical: 10,
      paddingHorizontal: 12,
    },
    content: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
    },
    contentCompact: {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 8,
    },
    info: {
      flexShrink: 1,
      flexGrow: 1,
      minWidth: 0,
    },
    name: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
      marginBottom: 2,
    },
    details: {
      fontSize: 11,
      color: c.textSecondary,
      fontWeight: '600',
    },
  }),
);
