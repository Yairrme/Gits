import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { theme } from '@/constants/theme';
import { COURSE_SHIFT_LABELS, CourseOffering } from '@/features/courses/courses.types';
import { makeStyles, useAppTheme } from '@/lib/theme/use-app-theme';

/**
 * Tarjeta de una materia / comisión (nombre, código, comisión, turno y ciclo lectivo).
 * La usan el inicio del alumno y el del docente.
 */
type Props = {
  course: CourseOffering;
  onPress?: () => void;
  actionLabel?: string;
};

export function CourseOfferingCard({ course, onPress, actionLabel }: Props) {
  const styles = useStyles();
  const { colors } = useAppTheme();

  const shiftLabel = COURSE_SHIFT_LABELS[course.shift] ?? course.shift ?? '-';
  const subjectName = course.subject?.name ?? 'Materia sin nombre';
  const subjectCode = course.subject?.code;
  const year = course.academicYear?.year ?? course.academicYear?.name ?? '-';

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.titleContainer}>
        {subjectCode ? (
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{subjectCode}</Text>
          </View>
        ) : null}
        <Text style={styles.title}>{subjectName}</Text>
      </View>

      <View style={styles.tagsRow}>
        <View style={styles.metaTag}>
          <Text style={styles.metaLabel}>COMISIÓN</Text>
          <Text style={styles.metaValue}>{course.commission || '-'}</Text>
        </View>
        <View style={styles.metaTag}>
          <Text style={styles.metaLabel}>TURNO</Text>
          <Text style={styles.metaValue}>{shiftLabel}</Text>
        </View>
        <View style={styles.metaTag}>
          <Text style={styles.metaLabel}>CICLO</Text>
          <Text style={styles.metaValue}>{year}</Text>
        </View>
      </View>

      {actionLabel || onPress ? (
        <View style={styles.footerRow}>
          <Text style={styles.actionText}>{actionLabel ?? 'Consultar asistencias'}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </View>
      ) : null}
    </Card>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    card: {
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderLeftWidth: 4,
      borderLeftColor: c.primary,
    },
    titleContainer: {
      gap: 6,
      marginBottom: theme.spacing.sm,
    },
    title: {
      fontSize: 17,
      fontWeight: '700',
      color: c.text,
      letterSpacing: -0.2,
    },
    codeBadge: {
      alignSelf: 'flex-start',
      backgroundColor: c.primarySoft,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    codeText: {
      fontSize: 11,
      fontWeight: '700',
      color: c.primary,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginVertical: 4,
    },
    metaTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: c.input,
    },
    metaLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: c.textSecondary,
      letterSpacing: 0.5,
    },
    metaValue: {
      fontSize: 12,
      fontWeight: '700',
      color: c.text,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    actionText: {
      fontSize: 13,
      fontWeight: '600',
      color: c.primary,
    },
  }),
);
