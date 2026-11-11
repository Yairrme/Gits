import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { theme } from '@/constants/theme';
import { makeStyles } from '@/lib/theme/use-app-theme';

type Props = PropsWithChildren<{
  title: string;
  description: string;
  accentColor: string; // Color de la franja izquierda
}>;

/** Tarjeta de formulario del panel académico: título, descripción y franja de color */
export function FormCard({ title, description, accentColor, children }: Props) {
  const styles = useStyles();
  return (
    <Card style={[styles.card, { borderLeftColor: accentColor }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View>{children}</View>
    </Card>
  );
}

/** Subtítulo para separar bloques dentro de un formulario */
export function FormSectionTitle({ children }: PropsWithChildren) {
  const styles = useStyles();
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: c.border,
      borderLeftWidth: 4,
      padding: theme.spacing.md,
      backgroundColor: c.card,
    },
    title: {
      color: c.text,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 4,
    },
    description: {
      color: c.textSecondary,
      fontSize: 12,
      lineHeight: 18,
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      color: c.textSecondary,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.6,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      paddingBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
  }),
);
