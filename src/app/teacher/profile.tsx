import { AppButton } from "@/components/ui/AppButton";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { theme } from "@/constants/theme";
import { useSession } from "@/features/auth/useSession";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { makeStyles, useAppTheme } from '@/lib/theme/use-app-theme';
/**
 * Pantalla de Perfil del Usuario / Docente:
 * Credencial institucional estructurada, con esquinas rectas y validación técnica.
 */
export default function TeacherProfileScreen() {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const { user, signOut } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(public)/login");
  };

  const displayName = user?.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user?.name || "Profesor";

  const initials =
    user?.profile?.firstName && user?.profile?.lastName
      ? `${user.profile.firstName[0]}${user.profile.lastName[0]}`.toUpperCase()
      : (user?.name?.slice(0, 2) || "PR").toUpperCase();

  const teacherId = user?.id
    ? `DOC-${user.id.slice(0, 8).toUpperCase()}`
    : "DOC-2026-ACT";

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* CREDENCIAL DOCENTE DIGITAL */}
        <Card style={styles.idCard}>
          {/* Banda Superior Institucional */}
          <View style={styles.cardHeader}>
            <View style={styles.headerTextBlock}>
              <Text style={styles.institutionTitle}>
                INSTITUTO TÉCNICO SUPERIOR CIPOLLETTI
              </Text>
              <Text style={styles.institutionSubtitle}>
                CREDENCIAL DIGITAL DOCENTE
              </Text>
            </View>
            <View style={styles.yearBadge}>
              <Text style={styles.yearText}>2026</Text>
            </View>
          </View>

          {/* Cuerpo de la credencial */}
          <View style={styles.cardBody}>
            <View style={styles.identityRow}>
              {/* Foto / Caja de Iniciales Cuadrada */}
              <View style={styles.avatarBox}>
                <Text style={styles.avatarText}>{initials}</Text>
                <View style={styles.avatarLabel}>
                  <Text style={styles.avatarLabelText}>DOCENTE</Text>
                </View>
              </View>

              {/* Nombre e Identificador */}
              <View style={styles.nameBlock}>
                <Text style={styles.name}>{displayName}</Text>
                <View style={styles.legajoTag}>
                  <Text style={styles.legajoLabel}>IDENTIFICADOR:</Text>
                  <Text style={styles.legajoNumber}>{teacherId}</Text>
                </View>
                <View style={styles.statusIndicatorRow}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeText}>
                    CUERPO PROFESORAL • ACTIVO
                  </Text>
                </View>
              </View>
            </View>

            {/* Tabla de metadatos con divisores rectos */}
            <View style={styles.metaTable}>
              <View style={styles.metaRow}>
                <Text style={styles.metaKey}>CORREO ELECTRÓNICO</Text>
                <Text style={styles.metaVal}>{user?.email || "-"}</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaRow}>
                <Text style={styles.metaKey}>CARGO INSTITUCIONAL</Text>
                <Text style={styles.metaVal}>Profesor Titular / Docente</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaRow}>
                <Text style={styles.metaKey}>SEDE ACADÉMICA</Text>
                <Text style={styles.metaVal}>
                  Cipolletti, Río Negro (Perú y Río Salado)
                </Text>
              </View>
            </View>

            {/* Código de Validación Técnica Recto */}
            <View style={styles.barcodeSection}>
              <View style={styles.barcodeLines}>
                {[
                  4, 1, 2, 3, 1, 4, 1, 3, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 4, 2,
                ].map((width, i) => (
                  <View
                    key={i}
                    style={[
                      styles.barcodeBar,
                      { width, marginRight: (i % 3) + 2 },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.barcodeCode}>*ITS-CIP-DOC-2026-VAL*</Text>
            </View>
          </View>
        </Card>

        {/* Acciones del Docente */}
        <View style={styles.actions}>
          <AppButton
            title="Cerrar sesión"
            variant="danger"
            icon={<Ionicons name="log-out-outline" size={18} color={colors.onPrimary} />}
            onPress={handleSignOut}
          />
        </View>

        {/* Pie de página institucional */}
        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            GITS Mobile • Gestión Institucional Técnica Superior
          </Text>
          <Text style={styles.footerVersion}>
            Módulo Docente • Versión 1.0.0
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  idCard: {
    padding: 0,
    overflow: "hidden",
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
    marginBottom: theme.spacing.md,
  },
  headerTextBlock: {
    flex: 1,
    flexShrink: 1,
  },
  cardHeader: {
    backgroundColor: c.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
    gap: 12,
  },
  institutionTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.8,
  },
  institutionSubtitle: {
    fontSize: 12,
    fontWeight: "700",
    color: c.onPrimary,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  yearBadge: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  yearText: {
    fontSize: 11,
    fontWeight: "700",
    color: c.onPrimary,
    letterSpacing: 0.5,
  },
  cardBody: {
    padding: theme.spacing.md,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: theme.spacing.md,
  },
  avatarBox: {
    width: 64,
    height: 72,
    backgroundColor: c.input,
    borderWidth: 2,
    borderColor: c.primary,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: c.primary,
  },
  avatarLabel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: c.primary,
    alignItems: "center",
    paddingVertical: 1,
  },
  avatarLabelText: {
    fontSize: 10,
    fontWeight: "700",
    color: c.onPrimary,
    letterSpacing: 0.5,
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: c.text,
    letterSpacing: -0.2,
  },
  legajoTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  legajoLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: c.textSecondary,
  },
  legajoNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: c.primary,
    letterSpacing: 0.8,
  },
  statusIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    backgroundColor: c.success,
  },
  activeText: {
    fontSize: 10,
    fontWeight: "700",
    color: c.success,
    letterSpacing: 0.4,
  },
  metaTable: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: c.border,
    paddingVertical: 8,
    borderWidth: 1,
    backgroundColor: c.background,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  metaRow: {
    paddingVertical: 6,
  },
  metaKey: {
    fontSize: 10,
    fontWeight: "700",
    color: c.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  metaVal: {
    fontSize: 13,
    fontWeight: "700",
    color: c.text,
  },
  metaDivider: {
    height: 1,
    backgroundColor: c.input,
  },
  barcodeSection: {
    alignItems: "center",
    paddingTop: theme.spacing.xs,
  },
  barcodeLines: {
    flexDirection: "row",
    alignItems: "center",
    height: 32,
    justifyContent: "center",
  },
  barcodeBar: {
    height: 28,
    backgroundColor: c.primary,
  },
  barcodeCode: {
    fontSize: 10,
    fontWeight: "700",
    color: c.textSecondary,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  actions: {
    marginTop: theme.spacing.sm,
  },
  footerNote: {
    marginTop: theme.spacing.lg,
    alignItems: "center",
  },
  footerText: {
    textAlign: "center",
    fontSize: 11,
    color: c.textSecondary,
    fontWeight: "600",
  },
  footerVersion: {
    fontSize: 10,
    color: c.textSecondary,
    marginTop: 2,
  },
}),
);
