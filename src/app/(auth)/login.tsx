import { login as loginApi } from '@/api/auth';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Animated,
  Appearance,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Paleta de colores ITS Cipolletti
const COLORS = {
  green: '#47F54E',
  blue: '#116EB3',
  lightBackground: '#FFFFFF',
  lightCard: '#F5F5F5',
  lightInput: '#F0F0F0',
  lightText: '#111111',
  lightTextSecondary: '#666666',
  darkBackground: '#000000ff',
  darkCard: '#1A1A1A',
  darkInput: '#222222',
  darkText: '#FFFFFF',
  darkTextSecondary: '#A0A0A0',
};

export default function LoginScreen() {
  const { signIn } = useAuth();
  const systemColorScheme = useColorScheme() ?? 'light';
  const [localColorScheme, setLocalColorScheme] = useState(systemColorScheme);
  const isDark = localColorScheme === 'dark';

  const theme = {
    background: isDark ? COLORS.darkBackground : COLORS.lightBackground,
    card: isDark ? COLORS.darkCard : COLORS.lightCard,
    input: isDark ? COLORS.darkInput : COLORS.lightInput,
    text: isDark ? COLORS.darkText : COLORS.lightText,
    textSecondary: isDark ? COLORS.darkTextSecondary : COLORS.lightTextSecondary,
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Sync local scheme with system scheme changes
  useEffect(() => {
    setLocalColorScheme(systemColorScheme);
  }, [systemColorScheme]);

  // Animations
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(20));

  useEffect(() => {
    // Entrance animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleLogin = async () => {
    if (!email || !password) {
      setStatus('Por favor completá todos los campos');
      return;
    }

    setIsLoading(true);
    setStatus('Conectando...');

    try {
      // Simulación de llamada a API si aún no está el backend
      const response = await loginApi({ email, password }).catch(() => {
        // En caso de que falle la API porque no está levantada
        console.log("Falla API, usando mock");
        return { access_token: 'fake-jwt-token-123', user: { email, name: 'Estudiante' } };
      });

      await signIn(response.access_token || 'fake-jwt-token-123', response.user || { email, name: 'Estudiante' });
    } catch (error) {
      setStatus('Error de conexión. Revisa tus datos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Theme Toggle */}
          <View style={styles.themeToggleContainer}>
            <Text style={[styles.themeToggleText, { color: theme.text }]}>☀️</Text>
            <Switch
              value={isDark}
              onValueChange={(value) => {
                const newTheme = value ? 'dark' : 'light';
                setLocalColorScheme(newTheme);
                try {
                  Appearance.setColorScheme(newTheme);
                } catch (error) {
                  console.log('Error setting color scheme:', error);
                }
              }}
              trackColor={{ false: '#ccc', true: COLORS.blue }}
              thumbColor={'#fff'}
            />
            <Text style={[styles.themeToggleText, { color: theme.text }]}>🌙</Text>
          </View>

          {/* Logo y Título */}
          <Animated.View
            style={[
              styles.headerContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Image
              source={isDark ? require('../../../assets/images/its logo oscuro.jpg') : require('../../../assets/images/its-logo.jpg')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.welcomeText, { color: theme.text }]}>Campus Virtual ITS Cipolletti</Text>
            <Text style={[styles.subtitleText, { color: theme.textSecondary }]}>
              Iniciá sesión para continuar
            </Text>
          </Animated.View>

          {/* Formulario */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.inputWrapperContainer}>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: theme.input, borderColor: theme.border },
                  emailFocused && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Correo electrónico"
                  placeholderTextColor={theme.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: theme.input, borderColor: theme.border },
                  passwordFocused && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Contraseña"
                  placeholderTextColor={theme.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
              </View>
            </View>

            <Pressable style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </Pressable>

            {/* Login Button */}
            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.loginButtonPressed,
                isLoading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[COLORS.blue, COLORS.green]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButtonGradient}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Ingresando...' : 'Ingresar'}
                </Text>
              </LinearGradient>
            </Pressable>

            {status ? (
              <View style={styles.statusContainer}>
                <Text
                  style={[
                    styles.statusText,
                    status.includes('listos') && styles.statusSuccess,
                    status.includes('completá') && styles.statusError,
                  ]}
                >
                  {status}
                </Text>
              </View>
            ) : null}
          </Animated.View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32, // More padding horizontally makes inputs narrower
  },

  // Theme Toggle
  themeToggleContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeToggleText: {
    fontSize: 16,
  },

  // Header
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 15,
  },

  // Form
  formContainer: {
    width: '100%',
    maxWidth: 320, // Constrain width for a minimalist look
    alignItems: 'center',
  },
  inputWrapperContainer: {
    width: '100%',
    gap: 16,
  },
  inputWrapper: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  inputWrapperFocused: {
    borderColor: '#116EB3',
  },
  input: {
    flex: 1,
    fontSize: 15,
  },

  // Forgot password
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 28,
  },
  forgotPasswordText: {
    color: '#116EB3',
    fontSize: 13,
    fontWeight: '600',
  },

  // Login button
  loginButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  loginButtonPressed: {
    opacity: 0.9,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Status
  statusContainer: {
    marginTop: 20,
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
  },
  statusSuccess: {
    color: '#47F54E',
  },
  statusError: {
    color: '#EF4444',
  },
});
