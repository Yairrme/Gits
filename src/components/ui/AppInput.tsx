import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { theme } from '@/constants/theme';
import { makeStyles, useAppTheme } from '@/lib/theme/use-app-theme';

type Props = TextInputProps & {
  label?: string;
  error?: string;
};

/**
 * Campo de texto con el estilo de los inputs del login
 * (fondo gris suave, esquinas rectas y borde azul al enfocar).
 * Acepta todas las props de TextInput (value, onChangeText, placeholder, etc.).
 */
export function AppInput({ label, error, style, onFocus, onBlur, ...props }: Props) {
  const styles = useStyles();
  const { colors } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
          style,
        ]}
        placeholderTextColor={colors.textSecondary}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    container: {
      width: '100%',
      marginBottom: theme.spacing.sm,
    },
    label: {
      fontSize: theme.typography.small,
      fontWeight: '600',
      color: c.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    input: {
      height: 52,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.typography.body,
      color: c.text,
      backgroundColor: c.input,
    },
    inputFocused: {
      borderColor: c.primary,
    },
    inputError: {
      borderColor: c.danger,
    },
    errorText: {
      fontSize: theme.typography.small,
      color: c.danger,
      marginTop: 4,
    },
  }),
);
