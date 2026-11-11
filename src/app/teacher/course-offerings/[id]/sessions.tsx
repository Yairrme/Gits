import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatLongDate } from '@/lib/dates';
import { getClassSessions } from '@/features/attendance/attendance.service';
import { ClassSession } from '@/features/attendance/attendance.types';
import { AppButton } from '@/components/ui/AppButton';
import { Card } from '@/components/ui/Card';
import { FeedbackState } from '@/components/ui/FeedbackState';
import { Screen } from '@/components/ui/Screen';
import { theme } from '@/constants/theme';

import { makeStyles, useAppTheme } from '@/lib/theme/use-app-theme';
/**
 * Pantalla de Historial de Clases:
 * Muestra el registro cronológico de sesiones dadas en la materia seleccionada.
 */
export default function CourseSessionsScreen() {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const { id } = useLocalSearchParams<{ id: string }>(); // UUID de la materia
  const router = useRouter();
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [error, setError] = useState('');

  // Recarga manual (pull-to-refresh o botón Reintentar)
  const loadSessions = useCallback(async () => {
    if (!id) {
      setSessions([]);
      setIsLoading(false);
      return;
    }

    try {
      setError('');
      setIsLoading(true);
      const data = await getClassSessions(id);
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las clases.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    async function fetchSessions() {
      if (!id) {
        if (isMounted) {
          setSessions([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        const data = await getClassSessions(id);
        if (isMounted) {
          setSessions(Array.isArray(data) ? data : []);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : 'No se pudieron cargar las clases.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchSessions();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <Screen>
        <FeedbackState title="Cargando historial de clases..." isLoading />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <FeedbackState title="Error" description={error} />
        <AppButton title="Reintentar" onPress={loadSessions} variant="primary" />
      </Screen>
    );
  }

  if (sessions.length === 0) {
    return (
      <Screen>
        <FeedbackState
          title="Sin clases registradas"
          description="Aún no has registrado ninguna sesión de clase para esta materia."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.headerBox}>
        <Text style={styles.headerTag}>LIBRO DE TEMAS • CLASES DICTADAS</Text>
        <Text style={styles.header}>Registro de Sesiones</Text>
      </View>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isClosed = item.status === 'CLOSED';
          const rawDate = item.date ? String(item.date).split('T')[0] : '';
          return (
            <Card
              // Tocar la clase abre su detalle para ver / corregir la asistencia
              onPress={() =>
                router.push({
                  pathname: '/teacher/course-offerings/[id]/class-sessions/[sessionId]',
                  params: { id: id ?? '', sessionId: item.id },
                })
              }
              style={[
                styles.sessionCard,
                { borderLeftColor: isClosed ? colors.success : colors.warning },
              ]}
            >
              <View style={styles.row}>
                <View style={styles.dateBlock}>
                  <Text style={styles.dateText}>{rawDate || 'S/D'}</Text>
                </View>

                <View style={styles.topicCol}>
                  <Text style={styles.topic}>{item.topic || 'Sin tema especificado'}</Text>
                  <Text style={styles.longDate}>{rawDate ? formatLongDate(rawDate) : ''}</Text>
                </View>

                {/* Etiqueta de estado de la clase (Abierta / Cerrada) */}
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: isClosed ? colors.successSoft : colors.warningSoft,
                      borderColor: isClosed ? colors.success : colors.warning,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: isClosed ? colors.success : colors.warning },
                    ]}
                  >
                    {isClosed ? 'CERRADA' : 'ABIERTA'}
                  </Text>
                </View>
              </View>
              <View style={styles.openRow}>
                <Text style={styles.openText}>Ver asistencia / corregir</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </View>
            </Card>
          );
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshing={isLoading}
        onRefresh={loadSessions}
      />
    </Screen>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
  headerBox: {
    backgroundColor: c.card,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: c.primary,
    borderColor: c.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  headerTag: {
    fontSize: 10,
    fontWeight: '700',
    color: c.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: c.text,
    letterSpacing: -0.2,
  },
  listContainer: {
    paddingBottom: theme.spacing.xl,
  },
  sessionCard: {
    marginBottom: 8,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: c.border,
    padding: theme.spacing.md,
    backgroundColor: c.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateBlock: {
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '700',
    color: c.primary,
    letterSpacing: 0.5,
  },
  topicCol: {
    flex: 1,
  },
  topic: {
    fontSize: 14,
    fontWeight: '700',
    color: c.text,
  },
  longDate: {
    fontSize: 12,
    color: c.textSecondary,
    marginTop: 2,
  },
  openRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  openText: {
    fontSize: 13,
    fontWeight: '600',
    color: c.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
}),
);
