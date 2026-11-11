import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import { makeStyles, useAppTheme } from '@/lib/theme/use-app-theme';

type Props = {
  title: string;
  description?: string;
  isLoading?: boolean;
};

/**
 * Mensaje centrado para estados de la pantalla: cargando, error o lista vacía.
 * Con `isLoading` muestra además un spinner.
 */
export function FeedbackState({ title, description, isLoading }: Props) {
  const styles = useStyles();
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      {isLoading && (
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      )}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    spinner: {
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.subtitle,
      fontWeight: '700',
      color: c.text,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    description: {
      fontSize: theme.typography.body,
      color: c.textSecondary,
      textAlign: 'center',
    },
  }),
);
