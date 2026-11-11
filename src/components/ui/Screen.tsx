import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { makeStyles } from '@/lib/theme/use-app-theme';

type Props = PropsWithChildren<{
  style?: ViewStyle | ViewStyle[];
  edges?: Edge[];
}>;

/**
 * Contenedor base de cada pantalla: respeta las zonas seguras (notch, barra inferior)
 * y aplica el fondo del modo actual (blanco / negro, como el login) y el padding común.
 * Por defecto NO incluye el borde superior porque el header del Stack ya lo cubre.
 *
 * Diseño pensado para celular: en pantallas anchas (tablet / web) el contenido
 * no se estira, queda centrado con un ancho máximo de MAX_CONTENT_WIDTH.
 */
const MAX_CONTENT_WIDTH = 600;

export function Screen({ children, style, edges = ['bottom', 'left', 'right'] }: Props) {
  const styles = useStyles();

  return (
    <SafeAreaView edges={edges} style={styles.safeArea}>
      <View style={[styles.container, style]}>{children}</View>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    container: {
      flex: 1,
      width: '100%',
      maxWidth: MAX_CONTENT_WIDTH,
      alignSelf: 'center',
      padding: theme.spacing.md,
    },
  }),
);
