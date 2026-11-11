import { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { makeStyles, useAppTheme } from '@/lib/theme/use-app-theme';

type Props = {
  label: string;                                   // Texto en mayúsculas, ej: "PERFIL"
  icon: ComponentProps<typeof Ionicons>['name'];   // Ícono de Ionicons
  onPress: () => void;
  variant?: 'default' | 'danger';                  // "danger" = rojo (ej: SALIR)
};

/**
 * Botón chico para el costado derecho del header (headerRight).
 * Lo usan los layouts de cada rol: "PERFIL" (alumno / docente) y "SALIR" (académico).
 */
export function HeaderButton({ label, icon, onPress, variant = 'default' }: Props) {
  const styles = useStyles();
  const { colors } = useAppTheme();
  const isDanger = variant === 'danger';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isDanger && styles.buttonDanger,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
    >
      <Ionicons name={icon} size={14} color={isDanger ? colors.danger : colors.primary} />
      <Text style={[styles.label, isDanger && styles.labelDanger]}>{label}</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    button: {
      marginRight: 6,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.primarySoft,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    buttonDanger: {
      backgroundColor: c.dangerSoft,
    },
    pressed: { opacity: 0.8 },
    label: {
      fontSize: 11,
      fontWeight: '700',
      color: c.primary,
      letterSpacing: 0.4,
    },
    labelDanger: {
      color: c.danger,
    },
  }),
);
