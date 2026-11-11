import { Alert, Platform } from 'react-native';

/** Muestra un aviso: window.alert en web, Alert.alert en Android / iOS */
export function showAlert(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
}

/**
 * Pide confirmación con dos opciones: window.confirm en web, Alert.alert con botones en Android / iOS.
 * Devuelve true si el usuario eligió `confirmLabel`.
 */
export function showConfirm(
  title: string,
  message: string,
  confirmLabel = 'Aceptar',
  cancelLabel = 'Cancelar',
): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
