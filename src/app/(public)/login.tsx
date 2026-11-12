/**
 * PANTALLA DE LOGIN  (ruta: /login)
 *
 * Está dentro del grupo "(public)", así que se puede ver sin haber iniciado sesión.
 * Qué hace:
 *  1. Muestra el logo, un formulario (correo + contraseña) y un footer con redes y contacto.
 *  2. Al tocar "Ingresar" llama a la API de login.
 *  3. Si sale bien, guarda la sesión con signIn(). No navega desde acá:
 *     el _layout.tsx raíz detecta que ahora hay usuario y lo manda a su sección
 *     (/student, /teacher o /academic) según su rol.
 *  4. Permite cambiar entre modo claro y oscuro (se aplica a toda la app).
 */

// --- Imports propios del proyecto ("@/" apunta a la carpeta src/) ---
import { BRAND, palettes } from "@/constants/theme"; // Colores de la marca y paletas claro/oscuro
import { login as loginApi } from "@/features/auth/auth.service"; // Pedido HTTP al backend (se renombra para no chocar con otros "login")
import { useSession } from "@/features/auth/useSession"; // Hook para leer/guardar la sesión del usuario
import {
  setAppColorScheme, // Cambia el tema de toda la app
  useAppColorScheme, // Devuelve el tema actual: "light" o "dark"
} from "@/lib/theme/use-app-theme";

// --- Librerías de Expo ---
import { Ionicons } from "@expo/vector-icons"; // Íconos (sol, luna, redes sociales, teléfono...)
import { Image } from "expo-image"; // Imagen optimizada (cache, transiciones)
import { LinearGradient } from "expo-linear-gradient"; // Fondo degradado del botón "Ingresar"
import { Stack } from "expo-router"; // Para configurar el header de esta pantalla

// --- React y componentes básicos de React Native ---
import { useEffect, useState } from "react";
import {
  Animated, // Animaciones (la entrada suave del logo y la tarjeta)
  KeyboardAvoidingView, // Sube el contenido cuando aparece el teclado
  Linking, // Abre links externos: web, teléfono, mail
  Platform, // Saber si estamos en "ios", "android" o "web"
  Pressable, // Cualquier cosa que se pueda tocar
  ScrollView, // Contenedor con scroll
  StatusBar, // Barra superior del celular (hora, batería)
  StyleSheet,
  Switch, // Interruptor del tema claro/oscuro
  Text,
  TextInput, // Campos de texto del formulario
  useWindowDimensions, // Ancho/alto de la pantalla (se actualiza si cambia)
  View,
} from "react-native";

// Evita que el contenido quede debajo del notch, la cámara o la barra de gestos
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// ============================================================================
// 1. CONFIGURACIÓN Y TEMAS
// ============================================================================
// Todo lo de esta sección está FUERA del componente: son datos fijos que no
// cambian, así no se vuelven a crear cada vez que la pantalla se redibuja.

// Colores: BRAND y palettes vienen de src/constants/theme.ts (los comparte toda la app)
// A cada paleta se le suma el logo correspondiente (claro u oscuro).
// "...palettes.light" copia todas las propiedades de la paleta (spread operator).
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

// Redes sociales del footer. Se recorren con .map() más abajo para dibujar un ícono por cada una.
// "as const" le dice a TypeScript que el nombre del ícono es exactamente ese texto,
// así Ionicons puede verificar que el ícono existe.
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
  // LinkedIn todavía no tiene URL: el ícono se muestra pero al tocarlo no hace nada
  { id: "linkedin", icon: "logo-linkedin" as const, url: "" },
];

// Datos de contacto del footer. Las URLs especiales abren otras apps:
//  - "tel:"    → abre el marcador de teléfono
//  - "mailto:" → abre la app de correo
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

// "export default" es obligatorio: Expo Router usa el componente exportado por
// defecto de cada archivo de src/app como la pantalla de esa ruta.
export default function LoginScreen() {
  // --- Sesión ---
  // signIn: guarda el token y el usuario (después del login exitoso)
  // sessionNotice: aviso cuando la sesión venció (token inválido) y la app volvió al login
  // clearSessionNotice: borra ese aviso
  const { signIn, sessionNotice, clearSessionNotice } = useSession();

  // --- Medidas de pantalla ---
  // insets: cuánto espacio ocupa el notch / barra de estado arriba (insets.top), abajo, etc.
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLarge = width > 768; // Tablet grande / web: tarjeta centrada y footer en fila
  const isSmall = width < 360; // Celulares chicos (ej. 320 px): menos margen e íconos más chicos

  // Tema (Claro / Oscuro): se comparte con el resto de la app
  const scheme = useAppColorScheme(); // "light" | "dark"
  const isDark = scheme === "dark";
  const theme = THEMES[scheme]; // Paleta de colores + logo del tema actual

  // Cambia el tema. Se puede usar de dos formas:
  //  - toggleTheme(true / false) → fuerza oscuro / claro (lo usan el sol, la luna y el Switch)
  //  - toggleTheme()             → invierte el tema actual
  const toggleTheme = (val?: boolean) => {
    const next =
      val !== undefined ? (val ? "dark" : "light") : isDark ? "light" : "dark";
    setAppColorScheme(next);
  };

  // --- Estado (useState) ---
  // Cada vez que se llama a un "set...", React vuelve a dibujar la pantalla con el valor nuevo.

  // Estado unificado del formulario: un solo objeto en vez de un useState por campo
  const [form, setForm] = useState({ email: "", password: "" });
  // Qué campo tiene el foco ahora (para pintarle el borde azul)
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(
    null,
  );
  // Mensaje debajo del botón: "Conectando...", errores, campos vacíos
  const [status, setStatus] = useState("");
  // true mientras se espera la respuesta del servidor (desactiva el botón)
  const [isLoading, setIsLoading] = useState(false);

  // Sombreado del recuadro "Iniciá sesión" al pasar el mouse (web) o al tocarlo (celular)
  const [isBadgeHovered, setIsBadgeHovered] = useState(false);

  // Animación de entrada única (controla opacidad y posición Y al mismo tiempo)
  // Animated.Value es un número que va de 0 (inicio) a 1 (fin).
  // Se crea dentro de useState(() => ...) para que se cree UNA sola vez y no en cada redibujado.
  const [entranceAnim] = useState(() => new Animated.Value(0));

  // useEffect con [entranceAnim]: se ejecuta una vez, cuando la pantalla aparece.
  useEffect(() => {
    Animated.timing(entranceAnim, {
      toValue: 1, // De 0 a 1...
      duration: 600, // ...en 600 milisegundos
      // El "native driver" corre la animación en el hilo nativo (más fluida),
      // pero no existe en web, por eso se desactiva ahí.
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [entranceAnim]);

  // Estilo que depende del valor animado:
  //  - opacity: 0 → 1  (aparece de a poco)
  //  - translateY: 20 → 0  (sube 20 px hasta su lugar)
  // interpolate convierte el rango 0..1 de la animación en el rango 20..0 de píxeles.
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

  // --- Login ---
  // "async" porque espera la respuesta del servidor con "await".
  const handleLogin = async () => {
    clearSessionNotice(); // el aviso de "sesión vencida" se reemplaza por el nuevo estado

    // Validación simple: si falta algún campo, muestra el mensaje y corta acá (return)
    if (!form.email || !form.password) {
      return setStatus("Por favor completá todos los campos");
    }

    setIsLoading(true);
    setStatus("Conectando...");

    try {
      // 1. Pide al backend que valide correo y contraseña.
      //    Devuelve el token (la "llave" para las próximas peticiones) y los datos del usuario.
      const { accessToken, user } = await loginApi(form);
      // 2. Guarda la sesión. A partir de acá el _layout.tsx raíz ve que hay
      //    usuario y redirige automáticamente a la sección de su rol.
      await signIn(accessToken, user);
    } catch (error) {
      // Si algo falla (contraseña incorrecta, sin internet...), se muestra el mensaje del error
      setStatus(
        error instanceof Error ? error.message : "No se pudo iniciar sesión.",
      );
    } finally {
      // "finally" se ejecuta siempre, haya salido bien o mal: vuelve a habilitar el botón
      setIsLoading(false);
    }
  };

  // --- Lo que se dibuja en pantalla (JSX) ---
  // Los estilos se pasan como arrays: [estiloBase, estiloExtra, condición && estiloCondicional].
  // Los que van después pisan a los anteriores; si la condición es false, se ignora.
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Íconos de la barra superior: claros en modo oscuro, oscuros en modo claro */}
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      {/* Oculta el header de navegación (la pantalla dibuja su propio diseño) */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* Selector de tema flotante (arriba a la derecha): ☀ [switch] ☾ */}
      <View
        style={[
          styles.themeToggle,
          // Si hay notch (insets.top > 0) se baja para no quedar debajo; si no, 16 px
          { top: insets.top > 0 ? insets.top + 8 : 16 },
        ]}
      >
        {/* hitSlop agranda el área tocable 8 px alrededor del ícono */}
        <Pressable onPress={() => toggleTheme(false)} hitSlop={8}>
          <Ionicons
            name="sunny"
            size={18}
            color={isDark ? theme.textSecondary : BRAND.sun} // Resaltado cuando está activo
          />
        </Pressable>
        <Switch
          value={isDark}
          onValueChange={toggleTheme} // Recibe true/false según la nueva posición
          style={{ transform: [{ scale: 0.8 }] }} // Un poco más chico que el tamaño normal
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

      {/* Cuando se abre el teclado, empuja el contenido hacia arriba para que no tape los campos.
          iOS y Android lo hacen distinto, por eso cambia "behavior" según la plataforma. */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <SafeAreaView
          style={[styles.safeArea, isSmall && styles.safeAreaSmall]}
        >
          {/* Scroll para que en pantallas bajas (o con el teclado abierto) se pueda bajar.
              keyboardShouldPersistTaps="handled": permite tocar el botón sin que el
              primer toque solo cierre el teclado. */}
          <ScrollView
            style={styles.wFull}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Bloque Central Animado (Logo + Tarjeta)
                Animated.View en vez de View para poder aplicarle animatedStyle */}
            <Animated.View style={[styles.mainBlock, animatedStyle]}>
              <Image
                source={theme.logo} // Cambia de logo según el tema
                style={[styles.logo, isLarge && styles.logoLarge]}
                contentFit="contain" // Entra completo sin recortarse
                transition={200} // Fundido de 200 ms al cambiar de logo
                accessibilityLabel="Logo GIT Cipolletti" // Lo lee el lector de pantalla
              />

              {/* Tarjeta: en celular es transparente; en pantallas grandes
                  tiene fondo, sombra y ancho fijo de 500 px */}
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
                    onHoverIn={() => setIsBadgeHovered(true)} // Mouse entra (solo web)
                    onHoverOut={() => setIsBadgeHovered(false)} // Mouse sale
                    accessibilityRole="header" // Para lectores de pantalla: es un título
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

                {/* ---------- FORMULARIO ---------- */}
                <View style={[styles.form, isLarge && { maxWidth: "100%" }]}>
                  {/* Campo CORREO
                      Es un "input controlado": muestra lo que hay en form.email (value)
                      y cada tecla actualiza el estado (onChangeText). */}
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.input,
                        borderColor: theme.border,
                        color: theme.text,
                      },
                      focusedField === "email" && styles.inputFocused, // Borde azul si está activo
                    ]}
                    placeholder="Correo electrónico"
                    placeholderTextColor={theme.textSecondary}
                    value={form.email}
                    // prev = estado anterior. Se copia todo (...prev) y solo se reemplaza email.
                    onChangeText={(email) =>
                      setForm((prev) => ({ ...prev, email }))
                    }
                    keyboardType="email-address" // Teclado con @ y .com
                    autoCapitalize="none" // No pone la primera letra en mayúscula
                    onFocus={() => setFocusedField("email")} // El usuario toca el campo
                    onBlur={() => setFocusedField(null)} // El usuario sale del campo
                  />

                  {/* Campo CONTRASEÑA (igual que el de correo) */}
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
                    secureTextEntry // Oculta lo que se escribe (●●●●)
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                  />

                  {/* "¿Olvidaste tu contraseña?": por ahora no tiene onPress, no hace nada */}
                  <Pressable style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>
                      ¿Olvidaste tu contraseña?
                    </Text>
                  </Pressable>

                  {/* Botón INGRESAR
                      style puede ser una función: Pressable le pasa { pressed } para
                      saber si el dedo está apretando, y así bajarle la opacidad. */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.loginButton,
                      (pressed || isLoading) && {
                        opacity: isLoading ? 0.7 : 0.9,
                      },
                    ]}
                    onPress={handleLogin}
                    disabled={isLoading} // Evita mandar el login dos veces
                  >
                    {/* Degradado horizontal de azul a verde (start x:0 → end x:1) */}
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

                  {/* Mensaje de estado / error.
                      "condición && <Componente/>" = solo se dibuja si la condición es verdadera.
                      "!!" convierte el texto a true/false (evita que React intente dibujar un "" suelto).
                      Muestra el status propio o, si no hay, el aviso de sesión vencida. */}
                  {!!(status || sessionNotice) && (
                    <Text
                      accessibilityRole="alert" // El lector de pantalla lo anuncia enseguida
                      style={[
                        styles.statusText,
                        {
                          // Gris mientras carga ("Conectando..."), rojo si es un error
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

            {/* Footer Institucional
                Pantalla grande: 3 columnas en fila (logo | redes | contacto).
                Celular: apilado en columna y sin el logo. */}
            <View
              style={[
                styles.footer,
                { borderTopColor: theme.border },
                !isLarge && styles.footerMobile,
              ]}
            >
              {/* El logo del footer solo aparece en pantallas grandes */}
              {isLarge && (
                <View style={styles.footerSection}>
                  <Image
                    source={theme.logo}
                    style={styles.footerLogo}
                    contentFit="contain"
                  />
                </View>
              )}

              {/* Redes sociales: un ícono por cada elemento de SOCIAL_NETWORKS.
                  "key" es obligatorio en listas: React lo usa para identificar cada elemento. */}
              <View style={[styles.footerSection, styles.footerSocials]}>
                {SOCIAL_NETWORKS.map((s) => (
                  <Pressable
                    key={s.id}
                    // Solo abre el link si la url no está vacía (por eso LinkedIn no hace nada)
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

              {/* Datos de contacto: alineados a la derecha en pantalla grande, centrados en celular */}
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
                    onPress={() => c.url && Linking.openURL(c.url)} // Abre mapa, teléfono o mail
                    style={[
                      styles.contactRow,
                      !isLarge && { justifyContent: "center" },
                    ]}
                  >
                    <Ionicons
                      name={c.icon}
                      size={c.id === "address" ? 20 : 18} // El de ubicación un poco más grande
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
// StyleSheet.create agrupa los estilos fijos. Los que dependen del tema
// (colores) se pasan directo en el JSX porque cambian en tiempo de ejecución.
// Recordatorio de flexbox:
//  - flex: 1            → ocupa todo el espacio disponible
//  - flexDirection      → "column" (por defecto en RN) apila hacia abajo, "row" pone en fila
//  - justifyContent     → alinea en el eje principal
//  - alignItems         → alinea en el eje cruzado
//  - gap                → espacio entre hijos

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  wFull: { width: "100%" },
  // Diseño pensado para celular: márgenes de 24 px (16 px en celulares chicos)
  safeArea: { flex: 1, paddingHorizontal: 24 },
  safeAreaSmall: { paddingHorizontal: 16 },
  // flexGrow: 1 hace que el contenido del scroll ocupe al menos toda la pantalla,
  // así se puede centrar verticalmente y el footer queda abajo
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // "absolute" lo saca del flujo normal: flota encima de todo en la esquina superior derecha
  themeToggle: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 50, // Por encima del resto del contenido
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
  // Sombra: "elevation" es para Android; las "shadow..." son para iOS y web
  cardLarge: {
    elevation: 10,
    padding: 48,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    width: 500,
    maxWidth: "90%",
  },

  // (No se usa actualmente en el JSX)
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
    borderRadius: 999, // Valor muy alto = bordes totalmente redondeados (forma de píldora)
    borderWidth: 2,
    borderColor: BRAND.blue,
    backgroundColor: "rgba(17,110,179,0.08)", // fondo fijo: se ve como placa, no como botón
    cursor: "auto", // en web, sin la "manito" de botón
  },
  // Se suma a subtitleBadge cuando el mouse está encima: fondo más fuerte + sombra azul
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

  // Formulario: máximo 320 px de ancho para que los campos no queden gigantes
  form: { width: "100%", maxWidth: 320, alignItems: "center", gap: 16 },
  input: {
    width: "100%",
    height: 52,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  inputFocused: { borderColor: BRAND.blue },

  // alignSelf: "flex-end" lo manda a la derecha; marginTop negativo lo acerca al campo de arriba
  forgotPassword: { alignSelf: "flex-end", marginTop: -4, marginBottom: 12 },
  forgotPasswordText: { color: BRAND.blue, fontSize: 13, fontWeight: "600" },

  // overflow: "hidden" recorta el degradado para que no se salga del botón
  loginButton: { width: "100%", overflow: "hidden" },
  loginButtonGradient: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },

  statusText: { fontSize: 14, textAlign: "center", marginTop: 4 },

  // marginTop: "auto" empuja el footer al fondo de la pantalla
  footer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 24,
    marginTop: "auto",
    borderTopWidth: 1, // Línea separadora arriba del footer
    gap: 24,
  },
  footerMobile: { flexDirection: "column" }, // En celular: secciones una debajo de otra
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
