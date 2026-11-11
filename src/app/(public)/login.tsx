import { BRAND, palettes } from "@/constants/theme";
import { login as loginApi } from "@/features/auth/auth.service";
import { useSession } from "@/features/auth/useSession";
import {
  setAppColorScheme,
  useAppColorScheme,
} from "@/lib/theme/use-app-theme";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  Animated,
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

// ============================================================================
// 1. CONFIGURACIÓN Y TEMAS
// ============================================================================

// Colores: BRAND y palettes vienen de src/constants/theme.ts (los comparte toda la app)
const THEMES = {
  light: {
    ...palettes.light,
    logo: require("../../../assets/images/logo-light.webp"),
  },
  dark: {
    ...palettes.dark,
    logo: require("../../../assets/images/logo-dark.webp"),
  },
};

const SOCIAL_NETWORKS = [
  {
    id: "instagram",
    icon: "logo-instagram" as const,
    url: "https://www.instagram.com/its_cipolletti/",
  },
  {
    id: "facebook",
    icon: "logo-facebook" as const,
    url: "https://www.facebook.com/profile.php?id=100042874851211",
  },
  {
    id: "youtube",
    icon: "logo-youtube" as const,
    url: "https://www.youtube.com/channel/UCkj71ff5W1nIeL5p4E-m5Hw",
  },
  {
    id: "twitter",
    icon: "logo-twitter" as const,
    url: "https://x.com/itscipolletti",
  },
  { id: "linkedin", icon: "logo-linkedin" as const, url: "" },
];

const CONTACT_INFO = [
  {
    id: "address",
    icon: "location-sharp" as const,
    text: "Calles Perú y Río Salado Cipolletti, Río Negro",
    url: "https://www.google.com/search?q=its+cipolletti+direcci%C3%B3n",
  },
  {
    id: "phone",
    icon: "call-sharp" as const,
    text: "0299 477-1976",
    url: "tel:02994771976",
  },
  {
    id: "email",
    icon: "mail-sharp" as const,
    text: "direccion@itscipolletti.edu.ar",
    url: "mailto:direccion@itscipolletti.edu.ar",
  },
];

// ============================================================================
// 2. PANTALLA PRINCIPAL
// ============================================================================

export default function LoginScreen() {
  // sessionNotice: aviso cuando la sesión venció (token inválido) y la app volvió al login
  const { signIn, sessionNotice, clearSessionNotice } = useSession();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLarge = width > 768; // Tablet grande / web: tarjeta centrada y footer en fila
  const isSmall = width < 360; // Celulares chicos (ej. 320 px): menos margen e íconos más chicos

  // Tema (Claro / Oscuro): se comparte con el resto de la app
  const scheme = useAppColorScheme();
  const isDark = scheme === "dark";
  const theme = THEMES[scheme];

  const toggleTheme = (val?: boolean) => {
    const next =
      val !== undefined ? (val ? "dark" : "light") : isDark ? "light" : "dark";
    setAppColorScheme(next);
  };

  // Estado unificado del formulario
  const [form, setForm] = useState({ email: "", password: "" });
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(
    null,
  );
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sombreado del recuadro "Iniciá sesión" al pasar el mouse (web) o al tocarlo (celular)
  const [isBadgeHovered, setIsBadgeHovered] = useState(false);

  // Animación de entrada única (controla opacidad y posición Y al mismo tiempo)
  const [entranceAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(entranceAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [entranceAnim]);

  const animatedStyle = {
    opacity: entranceAnim,
    transform: [
      {
        translateY: entranceAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  const handleLogin = async () => {
    clearSessionNotice(); // el aviso de "sesión vencida" se reemplaza por el nuevo estado
    if (!form.email || !form.password) {
      return setStatus("Por favor completá todos los campos");
    }

    setIsLoading(true);
    setStatus("Conectando...");

    try {
      const { accessToken, user } = await loginApi(form);
      await signIn(accessToken, user);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "No se pudo iniciar sesión.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Selector de tema flotante */}
      <View
        style={[
          styles.themeToggle,
          { top: insets.top > 0 ? insets.top + 8 : 16 },
        ]}
      >
        <Pressable onPress={() => toggleTheme(false)} hitSlop={8}>
          <Ionicons
            name="sunny"
            size={18}
            color={isDark ? theme.textSecondary : BRAND.sun}
          />
        </Pressable>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          style={{ transform: [{ scale: 0.8 }] }}
          trackColor={{ false: "#ccc", true: BRAND.blue }}
          thumbColor="#fff"
        />
        <Pressable onPress={() => toggleTheme(true)} hitSlop={8}>
          <Ionicons
            name="moon"
            size={18}
            color={isDark ? BRAND.green : theme.textSecondary}
          />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <SafeAreaView
          style={[styles.safeArea, isSmall && styles.safeAreaSmall]}
        >
          <ScrollView
            style={styles.wFull}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Bloque Central Animado (Logo + Tarjeta) */}
            <Animated.View style={[styles.mainBlock, animatedStyle]}>
              <Image
                source={theme.logo}
                style={[styles.logo, isLarge && styles.logoLarge]}
                contentFit="contain"
                transition={200}
                accessibilityLabel="Logo GIT Cipolletti"
              />

              <View
                style={[
                  styles.card,
                  isLarge && [
                    styles.cardLarge,
                    { backgroundColor: theme.card, shadowColor: theme.shadow },
                  ],
                ]}
              >
                {/* Cartel "Iniciá sesión" + texto descriptivo.
                    No es un botón: no hace nada al tocarlo, solo se sombrea al pasar el mouse (web). */}
                <View style={styles.signBlock}>
                  <Pressable
                    onHoverIn={() => setIsBadgeHovered(true)}
                    onHoverOut={() => setIsBadgeHovered(false)}
                    accessibilityRole="header"
                    style={[
                      styles.subtitleBadge,
                      isBadgeHovered && styles.subtitleBadgeHovered,
                    ]}
                  >
                    <Text style={styles.subtitleText}>Iniciá sesión</Text>
                  </Pressable>
                  <Text style={[styles.signCaption, { color: theme.textSecondary }]}>
                    Plataforma educativa
                  </Text>
                </View>

                <View style={[styles.form, isLarge && { maxWidth: "100%" }]}>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.input,
                        borderColor: theme.border,
                        color: theme.text,
                      },
                      focusedField === "email" && styles.inputFocused,
                    ]}
                    placeholder="Correo electrónico"
                    placeholderTextColor={theme.textSecondary}
                    value={form.email}
                    onChangeText={(email) =>
                      setForm((prev) => ({ ...prev, email }))
                    }
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                  />

                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.input,
                        borderColor: theme.border,
                        color: theme.text,
                      },
                      focusedField === "password" && styles.inputFocused,
                    ]}
                    placeholder="Contraseña"
                    placeholderTextColor={theme.textSecondary}
                    value={form.password}
                    onChangeText={(password) =>
                      setForm((prev) => ({ ...prev, password }))
                    }
                    secureTextEntry
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                  />

                  <Pressable style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>
                      ¿Olvidaste tu contraseña?
                    </Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.loginButton,
                      (pressed || isLoading) && {
                        opacity: isLoading ? 0.7 : 0.9,
                      },
                    ]}
                    onPress={handleLogin}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={[BRAND.blue, BRAND.green]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.loginButtonGradient}
                    >
                      <Text style={styles.loginButtonText}>
                        {isLoading ? "Ingresando..." : "Ingresar"}
                      </Text>
                    </LinearGradient>
                  </Pressable>

                  {!!(status || sessionNotice) && (
                    <Text
                      accessibilityRole="alert"
                      style={[
                        styles.statusText,
                        {
                          color: isLoading ? theme.textSecondary : BRAND.error,
                        },
                      ]}
                    >
                      {status || sessionNotice}
                    </Text>
                  )}
                </View>
              </View>
            </Animated.View>

            {/* Footer Institucional */}
            <View
              style={[
                styles.footer,
                { borderTopColor: theme.border },
                !isLarge && styles.footerMobile,
              ]}
            >
              {isLarge && (
                <View style={styles.footerSection}>
                  <Image
                    source={theme.logo}
                    style={styles.footerLogo}
                    contentFit="contain"
                  />
                </View>
              )}

              <View style={[styles.footerSection, styles.footerSocials]}>
                {SOCIAL_NETWORKS.map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() => s.url && Linking.openURL(s.url)}
                    hitSlop={6}
                  >
                    <Ionicons
                      name={s.icon}
                      size={isSmall ? 28 : 32}
                      color={theme.textSecondary}
                    />
                  </Pressable>
                ))}
              </View>

              <View
                style={[
                  styles.footerSection,
                  isLarge
                    ? { alignItems: "flex-end" }
                    : { alignItems: "center" },
                ]}
              >
                {CONTACT_INFO.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => c.url && Linking.openURL(c.url)}
                    style={[
                      styles.contactRow,
                      !isLarge && { justifyContent: "center" },
                    ]}
                  >
                    <Ionicons
                      name={c.icon}
                      size={c.id === "address" ? 20 : 18}
                      color={theme.textSecondary}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.footerText,
                        {
                          color: theme.textSecondary,
                          textAlign: isLarge ? "right" : "center",
                        },
                      ]}
                    >
                      {c.text}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ============================================================================
// 3. ESTILOS
// ============================================================================

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  wFull: { width: "100%" },
  // Diseño pensado para celular: márgenes de 24 px (16 px en celulares chicos)
  safeArea: { flex: 1, paddingHorizontal: 24 },
  safeAreaSmall: { paddingHorizontal: 16 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  themeToggle: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 50,
  },

  mainBlock: {
    width: "100%",
    alignItems: "center",
    paddingTop: 48,
  },
  // El logo se adapta al ancho disponible (proporción 2:1) sin pasar de 300 / 420 px
  logo: { width: "100%", maxWidth: 300, aspectRatio: 2, marginBottom: 32 },
  logoLarge: { maxWidth: 420 },

  // Esquinas rectas, igual que el resto de la plataforma
  card: { alignItems: "center", width: "100%" },
  cardLarge: {
    elevation: 10,
    padding: 48,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    width: 500,
    maxWidth: "90%",
  },

  welcomeText: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 4,
    textAlign: "center",
  },
  // Cartel "Iniciá sesión": única pieza redondeada del login (pedido de diseño)
  signBlock: {
    alignItems: "center",
    marginBottom: 40,
    gap: 10,
  },
  subtitleBadge: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: BRAND.blue,
    backgroundColor: "rgba(17,110,179,0.08)", // fondo fijo: se ve como placa, no como botón
    cursor: "auto", // en web, sin la "manito" de botón
  },
  subtitleBadgeHovered: {
    backgroundColor: "rgba(17,110,179,0.16)",
    shadowColor: BRAND.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  subtitleText: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.3,
    textAlign: "center",
    color: BRAND.blue,
  },
  signCaption: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.5,
    textAlign: "center",
  },

  form: { width: "100%", maxWidth: 320, alignItems: "center", gap: 16 },
  input: {
    width: "100%",
    height: 52,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  inputFocused: { borderColor: BRAND.blue },

  forgotPassword: { alignSelf: "flex-end", marginTop: -4, marginBottom: 12 },
  forgotPasswordText: { color: BRAND.blue, fontSize: 13, fontWeight: "600" },

  loginButton: { width: "100%", overflow: "hidden" },
  loginButtonGradient: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },

  statusText: { fontSize: 14, textAlign: "center", marginTop: 4 },

  footer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 24,
    marginTop: "auto",
    borderTopWidth: 1,
    gap: 24,
  },
  footerMobile: { flexDirection: "column" },
  footerSection: { flex: 1, minWidth: 200, justifyContent: "center", gap: 8 },
  footerLogo: { width: 140, height: 70 },
  // Si no entran en una fila (celular muy angosto), los íconos bajan a la siguiente
  footerSocials: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  footerText: { fontSize: 15 },
});
