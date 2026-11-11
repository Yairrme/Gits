import { PropsWithChildren } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '@/constants/theme';
import { makeStyles } from '@/lib/theme/use-app-theme';

type Props = PropsWithChildren<{
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}>;

/**
 * Contenedor tipo tarjeta: fondo de tarjeta del login y esquinas rectas.
 * Si recibe `onPress` se vuelve presionable (Pressable); si no, es una View común.
 */
export function Card({ children, onPress, style }: Props) {
  const styles = useStyles();
  const cardStyle = [styles.card, style];

  // Versión presionable: baja la opacidad mientras se mantiene apretada
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [cardStyle, pressed && styles.pressed]}>
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    pressed: {
      opacity: 0.85,
    },
  }),
);
