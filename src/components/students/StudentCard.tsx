import { Text, StyleSheet, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { EnrolledStudent } from '@/features/courses/courses.types';
import { theme } from '@/constants/theme';

import { makeStyles } from '@/lib/theme/use-app-theme';
/**
 * CAPA DE COMPONENTES (StudentCard):
 * Tarjeta presentacional institucional que muestra el apellido, nombre, DNI y legajo
 * de un estudiante inscripto con estética recta y profesional.
 */
type Props = {
  student: EnrolledStudent;
};

export function StudentCard({ student }: Props) {
  const styles = useStyles();
  const fullName =
    [student.lastName, student.firstName].filter(Boolean).join(', ') || 'Estudiante';

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{fullName}</Text>
        <View style={styles.statusChip}>
          <Text style={styles.statusChipText}>REGULAR</Text>
        </View>
      </View>
      <View style={styles.detailsRow}>
        <View style={styles.tag}>
          <Text style={styles.tagLabel}>DNI</Text>
          <Text style={styles.tagValue}>{student.documentNumber || '-'}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagLabel}>LEGAJO</Text>
          <Text style={styles.tagValue}>{student.studentNumber || '-'}</Text>
        </View>
      </View>
    </Card>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
  card: {
    borderLeftWidth: 4,
    borderLeftColor: c.primary,
    borderColor: c.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: c.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: c.text,
    letterSpacing: -0.2,
  },
  statusChip: {
    borderWidth: 1,
    borderColor: c.success,
    backgroundColor: c.successSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: c.success,
    letterSpacing: 0.5,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.background,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  tagLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: c.textSecondary,
  },
  tagValue: {
    fontSize: 11,
    fontWeight: '700',
    color: c.text,
  },
}),
);

