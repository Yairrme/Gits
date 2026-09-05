import { login as loginApi } from "@/api/auth";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  Animated,
  Appearance,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

// Paleta de colores ITS Cipolletti
const COLORS = {
  green: "#47F54E",
  blue: "#116EB3",
  lightBackground: "#FFFFFF",
  lightCard: "#F5F5F5",
  lightInput: "#F0F0F0",
  lightText: "#111111",
  lightTextSecondary: "#666666",
  darkBackground: "#000000ff",
  darkCard: "#1A1A1A",
  darkInput: "#222222",
  darkText: "#FFFFFF",
  darkTextSecondary: "#A0A0A0",
};

export default function LoginScreen() {
  const { signIn } = useAuth();
  const systemColorScheme = useColorScheme() ?? "light";
  const [localColorScheme, setLocalColorScheme] = useState(systemColorScheme);
  const isDark = localColorScheme === "dark";
  const insets = useSafeAreaInsets();

  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;

  const theme = {
    background: isDark ? COLORS.darkBackground : COLORS.lightBackground,
    card: isDark ? COLORS.darkCard : COLORS.lightCard,
    input: isDark ? COLORS.darkInput : COLORS.lightInput,
    text: isDark ? COLORS.darkText : COLORS.lightText,
    textSecondary: isDark
      ? COLORS.darkTextSecondary
      : COLORS.lightTextSecondary,
    border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
    shadow: isDark ? "#000" : "#ccc",
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
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
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleLogin = async () => {
    if (!email || !password) {
      setStatus("Por favor completá todos los campos");
      return;
    }

    setIsLoading(true);
    setStatus("Conectando...");

    try {
      // Simulación de llamada a API si aún no está el backend
      const response = await loginApi({ email, password }).catch(() => {
        // En caso de que falle la API porque no está levantada
        console.log("Falla API, usando mock");
        return {
          access_token: "fake-jwt-token-123",
          user: { email, name: "Estudiante" },
        };
      });

      await signIn(
        response.access_token || "fake-jwt-token-123",
        response.user || { email, name: "Estudiante" },
      );
    } catch (error) {
      setStatus("Error de conexión. Revisa tus datos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={{ width: "100%" }}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Theme Toggle (Solo PC) */}
            {isLargeScreen && (
              <View
                style={[
                  styles.themeToggleContainer,
                  { top: Math.max(insets.top, 8) },
                ]}
              >
                <Ionicons
                  name="sunny"
                  size={16}
                  color={isDark ? theme.textSecondary : "#FFD700"}
                />
                <Switch
                  value={isDark}
                  onValueChange={(value) => {
                    const newTheme = value ? "dark" : "light";
                    setLocalColorScheme(newTheme);
                    try {
                      Appearance.setColorScheme(newTheme);
                    } catch (error) {
                      if (Platform.OS !== "web") {
                        console.log("Error setting color scheme:", error);
                      }
                    }
                  }}
                  style={{ transform: [{ scale: 0.8 }] }}
                  trackColor={{ false: "#ccc", true: COLORS.blue }}
                  thumbColor={"#fff"}
                />
                <Ionicons
                  name="moon"
                  size={16}
                  color={isDark ? "#47F54E" : theme.textSecondary}
                />
              </View>
            )}

            {/* Logo (Fuera de la tarjeta) */}
            <Animated.View
              style={[
                {
                  alignItems: "center",
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Image
                source={
                  isDark
                    ? require("../../../assets/images/its logo oscuro.jpg")
                    : require("../../../assets/images/its-logo.jpg")
                }
                style={[styles.logo, isLargeScreen && styles.logoLarge]}
                resizeMode="contain"
              />
            </Animated.View>

            {/* Responsive Card Container */}
            <View
              style={[
                styles.cardContainer,
                isLargeScreen && {
                  backgroundColor: theme.card,
                  shadowColor: theme.shadow,
                  elevation: 10,
                  padding: 48,
                  borderRadius: 24,
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.1,
                  shadowRadius: 20,
                  width: 500,
                  maxWidth: "90%",
                },
              ]}
            >
              {/* Título */}
              <Animated.View
                style={[
                  styles.headerContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <Text style={[styles.welcomeText, { color: theme.text }]}>
                  Campus Virtual ITS Cipolletti
                </Text>
                <Text
                  style={[styles.subtitleText, { color: theme.textSecondary }]}
                >
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
                  isLargeScreen && { maxWidth: "100%" }, // Expand to fill the card
                ]}
              >
                <View style={styles.inputWrapperContainer}>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: theme.input,
                        borderColor: theme.border,
                      },
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
                      {
                        backgroundColor: theme.input,
                        borderColor: theme.border,
                      },
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
                  <Text style={styles.forgotPasswordText}>
                    ¿Olvidaste tu contraseña?
                  </Text>
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
                      {isLoading ? "Ingresando..." : "Ingresar"}
                    </Text>
                  </LinearGradient>
                </Pressable>

                {status ? (
                  <View style={styles.statusContainer}>
                    <Text
                      style={[
                        styles.statusText,
                        status.includes("listos") && styles.statusSuccess,
                        status.includes("completá") && styles.statusError,
                      ]}
                    >
                      {status}
                    </Text>
                  </View>
                ) : null}
              </Animated.View>
            </View>

            {/* Footer */}
            <View
              style={[
                styles.footerContainer,
                { borderTopColor: theme.border },
                !isLargeScreen && {
                  flexDirection: "column",
                  alignItems: "center",
                },
              ]}
            >
              {/* Left: Mini Logo */}
              {isLargeScreen && (
                <View
                  style={[
                    styles.footerSection,
                    !isLargeScreen && { alignItems: "center" },
                  ]}
                >
                  <Image
                    source={
                      isDark
                        ? require("../../../assets/images/its logo oscuro.jpg")
                        : require("../../../assets/images/its-logo.jpg")
                    }
                    style={styles.footerLogo}
                    resizeMode="contain"
                  />
                </View>
              )}

              {/* Middle: Socials */}
              <View style={[styles.footerSection, styles.footerSocials]}>
                <Pressable
                  onPress={() =>
                    Linking.openURL("https://www.instagram.com/its_cipolletti/")
                  }
                >
                  <Ionicons
                    name="logo-instagram"
                    size={36}
                    color={theme.textSecondary}
                  />
                </Pressable>
                <Pressable
                  onPress={() =>
                    Linking.openURL(
                      "https://www.facebook.com/profile.php?id=100042874851211",
                    )
                  }
                >
                  <Ionicons
                    name="logo-facebook"
                    size={36}
                    color={theme.textSecondary}
                  />
                </Pressable>
                <Pressable
                  onPress={() =>
                    Linking.openURL(
                      "https://www.youtube.com/channel/UCkj71ff5W1nIeL5p4E-m5Hw",
                    )
                  }
                >
                  <Ionicons
                    name="logo-youtube"
                    size={36}
                    color={theme.textSecondary}
                  />
                </Pressable>
                <Pressable
                  onPress={() => Linking.openURL("https://x.com/itscipolletti")}
                >
                  <Ionicons
                    name="logo-twitter"
                    size={36}
                    color={theme.textSecondary}
                  />
                </Pressable>
                <Pressable onPress={() => Linking.openURL("")}>
                  <Ionicons
                    name="logo-linkedin"
                    size={36}
                    color={theme.textSecondary}
                  />
                </Pressable>
              </View>

              {/* Right: Address & Phone */}
              <View
                style={[
                  styles.footerSection,
                  styles.footerContact,
                  !isLargeScreen && { alignItems: "center" },
                ]}
              >
                <Pressable
                  onPress={() =>
                    Linking.openURL(
                      "https://www.google.com/search?q=its+cipolletti+direcci%C3%B3n",
                    )
                  }
                  style={[
                    styles.contactRow,
                    !isLargeScreen && { justifyContent: "center" },
                  ]}
                >
                  <Ionicons
                    name="location-sharp"
                    size={20}
                    color={theme.textSecondary}
                    style={styles.contactIcon}
                  />
                  <Text
                    style={[
                      styles.footerText,
                      { color: theme.textSecondary },
                      !isLargeScreen && { textAlign: "center" },
                    ]}
                  >
                    Perú, Río Salado y, Cipolletti, Río Negro
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => Linking.openURL("tel:02994771976")}
                  style={[
                    styles.contactRow,
                    { marginTop: 8 },
                    !isLargeScreen && { justifyContent: "center" },
                  ]}
                >
                  <Ionicons
                    name="call-sharp"
                    size={18}
                    color={theme.textSecondary}
                    style={styles.contactIcon}
                  />
                  <Text
                    style={[
                      styles.footerText,
                      { color: theme.textSecondary },
                      !isLargeScreen && { textAlign: "center" },
                    ]}
                  >
                    Teléfono: 0299 477-1976
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    Linking.openURL("mailto:direccion@itscipolletti.edu.ar")
                  }
                  style={[
                    styles.contactRow,
                    { marginTop: 8 },
                    !isLargeScreen && { justifyContent: "center" },
                  ]}
                >
                  <Ionicons
                    name="mail-sharp"
                    size={18}
                    color={theme.textSecondary}
                    style={styles.contactIcon}
                  />
                  <Text
                    style={[
                      styles.footerText,
                      { color: theme.textSecondary },
                      !isLargeScreen && { textAlign: "center" },
                    ]}
                  >
                    direccion@itscipolletti.edu.ar
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
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
    paddingHorizontal: 32, // More padding horizontally makes inputs narrower
  },

  // Responsive Card
  cardContainer: {
    alignItems: "center",
    width: "100%",
  },

  // Theme Toggle
  themeToggleContainer: {
    position: "absolute",
    top: 10,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 10,
  },
  themeToggleText: {
    fontSize: 16,
  },

  // Header
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
    width: "100%",
  },
  logo: {
    width: 300, // Reduced base size for mobile to avoid overflowing
    height: 300,
    marginBottom: 20,
  },
  logoLarge: {
    width: 400, // Keep large size for web
    height: 400,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 15,
    textAlign: "center",
  },

  // Form
  formContainer: {
    width: "100%",
    maxWidth: 320, // Constrain width for a minimalist look on mobile
    alignItems: "center",
  },
  inputWrapperContainer: {
    width: "100%",
    gap: 16,
  },
  inputWrapper: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  inputWrapperFocused: {
    borderColor: "#116EB3",
  },
  input: {
    flex: 1,
    fontSize: 15,
  },

  // Forgot password
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 12,
    marginBottom: 28,
  },
  forgotPasswordText: {
    color: "#116EB3",
    fontSize: 13,
    fontWeight: "600",
  },

  // Login button
  loginButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  loginButtonPressed: {
    opacity: 0.9,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Status
  statusContainer: {
    marginTop: 20,
  },
  statusText: {
    fontSize: 14,
    textAlign: "center",
  },
  statusSuccess: {
    color: "#47F54E",
  },
  statusError: {
    color: "#EF4444",
  },

  // Footer
  footerContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 24,
    marginTop: "auto", // push to bottom
    borderTopWidth: 1,
    gap: 24,
  },
  footerSection: {
    flex: 1,
    minWidth: 200,
    justifyContent: "center",
  },
  footerLogo: {
    width: 100,
    height: 100,
  },
  footerSocials: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  footerContact: {
    alignItems: "flex-end",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  contactIcon: {
    marginRight: 6,
  },
  footerText: {
    fontSize: 15,
    textAlign: "right",
  },
});
