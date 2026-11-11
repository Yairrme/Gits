import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BRAND, theme } from '@/constants/theme';
import { makeStyles } from '@/lib/theme/use-app-theme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  icon?: ReactNode;                 // Ícono opcional a la izquierda del texto
  style?: StyleProp<ViewStyle>;     // Estilos extra del contenedor
  textStyle?: StyleProp<TextStyle>; // Estilos extra del texto
};

/**
 * Botón reutilizable con el estilo del login.
 * - primary: degradado azul → verde (igual al botón "Ingresar")
 * - secondary: azul liso
 * - danger: rojo
 * - outline: transparente con borde
 */
export function AppButton({
  title,
  onPress,
  disabled,
  variant = 'primary',
  icon,
  style,
  textStyle,
}: Props) {
  const styles = useStyles();

  const content = (
    <>
      {icon}
      <Text style={[styles.text, variant === 'outline' && styles.outlineText, textStyle]}>
        {title}
      </Text>
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={BRAND.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.inner}
        >
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.inner, styles[variant]]}>{content}</View>
      )}
    </Pressable>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    button: {
      overflow: 'hidden',
      marginTop: theme.spacing.sm,
    },
    inner: {
      minHeight: 52,
      paddingHorizontal: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    secondary: { backgroundColor: c.primary },
    danger: { backgroundColor: c.danger },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: c.primary,
    },
    disabled: { opacity: 0.6 },
    pressed: { opacity: 0.9 },
    text: {
      color: c.onPrimary,
      fontWeight: '600',
      fontSize: 16,
    },
    outlineText: { color: c.primary },
  }),
);
