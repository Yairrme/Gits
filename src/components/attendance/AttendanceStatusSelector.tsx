import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AttendanceStatus } from '@/features/attendance/attendance.types';
import {
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_SHORT_LABELS,
} from '@/features/attendance/attendance.constants';
import { makeStyles } from '@/lib/theme/use-app-theme';

type Props = {
  currentStatus: AttendanceStatus;                     // Estado actualmente elegido
  onSelectStatus: (status: AttendanceStatus) => void;  // Se llama al tocar un botón
  studentName?: string;   // Para el lector de pantalla: "Presente, Pérez, Juan"
  stretch?: boolean;      // true: los 4 botones ocupan todo el ancho (celulares angostos)
};

// Orden en que se muestran los botones
const STATUS_KEYS: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'JUSTIFIED'];

/** Lado mínimo de cada botón: 44 px, cómodo para el pulgar en plena clase */
export const ATTENDANCE_TOGGLE_SIZE = 44;

/**
 * Fila de 4 botones (P / A / T / J) para elegir el estado de asistencia de un alumno.
 * El botón seleccionado se pinta con el color de su estado.
 * Para el lector de pantalla es un grupo de opciones (radio) con el nombre del alumno.
 */
export function AttendanceStatusSelector({
  currentStatus,
  onSelectStatus,
  studentName,
  stretch = false,
}: Props) {
  const styles = useStyles();

  return (
    <View
      style={[styles.container, stretch && styles.containerStretch]}
      accessibilityRole="radiogroup"
      accessibilityLabel={studentName ? `Asistencia de ${studentName}` : 'Asistencia'}
    >
      {STATUS_KEYS.map((status) => {
        const isSelected = currentStatus === status;
        const colorConfig = ATTENDANCE_STATUS_COLORS[status];
        const label = ATTENDANCE_STATUS_LABELS[status];

        return (
          <Pressable
            key={status}
            onPress={() => onSelectStatus(status)}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={studentName ? `${label}, ${studentName}` : label}
            style={({ pressed }) => [
              styles.button,
              stretch && styles.buttonStretch,
              isSelected
                ? { backgroundColor: colorConfig.bg, borderColor: colorConfig.bg }
                : styles.buttonUnselected,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.text,
                isSelected ? { color: colorConfig.text } : styles.textUnselected,
              ]}
            >
              {ATTENDANCE_STATUS_SHORT_LABELS[status]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: 4,
      alignItems: 'center',
    },
    containerStretch: {
      alignSelf: 'stretch',
    },
    // minWidth / minHeight (no width / height fijos): si el sistema agranda la letra, el botón crece
    button: {
      minWidth: ATTENDANCE_TOGGLE_SIZE,
      minHeight: ATTENDANCE_TOGGLE_SIZE,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonStretch: {
      flex: 1,
    },
    buttonUnselected: {
      backgroundColor: c.background,
      borderColor: c.textSecondary,
    },
    pressed: {
      opacity: 0.7,
    },
    text: {
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    textUnselected: {
      color: c.textSecondary,
    },
  }),
);
