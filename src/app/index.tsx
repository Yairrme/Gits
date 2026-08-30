import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const handleLogin = async () => {
    // Aquí pondremos el fetch() real a tu API más adelante
    setStatus('Conectando...');
    console.log('Email:', email, 'Password:', password);

    // Simulación temporal para que veas que funciona el botón
    setTimeout(() => {
      setStatus('¡Datos listos para enviar a la API!');
    }, 1000);
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safeArea}>

        <ThemedText type="title" style={styles.title}>Iniciar Sesión</ThemedText>

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none" // Para que no ponga mayúscula inicial en el correo
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry // Para ocultar la contraseña con puntitos
        />

        {/* Botón personalizado */}
        <Pressable style={styles.button} onPress={handleLogin}>
          <ThemedText style={styles.buttonText}>Entrar</ThemedText>
        </Pressable>

        <ThemedText style={styles.statusText}>{status}</ThemedText>

      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', // Esto centra todo verticalmente
    paddingHorizontal: 30, // Margen a los costados
  },
  title: {
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#E0E1E6', // Fondo de la caja de texto
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: '#000',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#208AEF', // Azul por defecto, puedes cambiarlo al color de tu marca
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff', // Texto blanco en el botón
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusText: {
    marginTop: 20,
    color: '#60646C',
  }
});
