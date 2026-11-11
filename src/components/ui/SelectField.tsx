import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { makeStyles, useAppTheme } from '@/lib/theme/use-app-theme';

/** Una opción de la lista: el id es lo que se envía a la API, el resto se muestra */
export type SelectOption = {
  id: string;
  label: string;        // Texto principal (ej. "Pérez, Juan")
  description?: string; // Texto secundario (ej. "DNI 40123456 · Legajo 1234")
};

type Props = {
  label: string;
  placeholder: string;
  value: SelectOption | null;
  onChange: (option: SelectOption) => void;
  /** Trae las opciones. Recibe lo que se escribió en el buscador (para búsquedas en la API). */
  loadOptions: (search: string) => Promise<SelectOption[]>;
  searchPlaceholder?: string;
  disabled?: boolean;
  disabledHint?: string; // Texto a mostrar cuando está deshabilitado (ej. "Elegí primero una carrera")
  /**
   * true (por defecto): filtra la lista en el celular con lo que se escribe.
   * false: la búsqueda la hace la API (ej. alumnos) y se muestra lo que devuelve.
   */
  filterLocally?: boolean;
};

/** Pasa a minúsculas y quita tildes, para que "gomez" encuentre "Gómez" */
function normalize(text: string) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * Campo para elegir un elemento de una lista traída de la API, en lugar de escribir su UUID.
 * Al tocarlo se abre una lista a pantalla completa (pensada para celular) con buscador.
 */
export function SelectField({
  label,
  placeholder,
  value,
  onChange,
  loadOptions,
  searchPlaceholder = 'Buscar...',
  disabled,
  disabledHint,
  filterLocally = true,
}: Props) {
  const styles = useStyles();
  const { colors } = useAppTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0); // Para ignorar respuestas viejas si se escribe rápido

  // Carga las opciones al abrir y cada vez que cambia la búsqueda (esperando 300 ms de pausa)
  useEffect(() => {
    if (!isOpen) return;
    const currentRequest = ++requestId.current;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await loadOptions(search);
        if (currentRequest === requestId.current) setOptions(result);
      } catch (e) {
        if (currentRequest === requestId.current) {
          setError(e instanceof Error ? e.message : 'No se pudo cargar la lista.');
        }
      } finally {
        if (currentRequest === requestId.current) setIsLoading(false);
      }
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [isOpen, search, loadOptions]);

  // Filtro local (para listas que no se buscan en la API), sin distinguir tildes ni mayúsculas
  const term = normalize(search.trim());
  const visibleOptions =
    term && filterLocally
      ? options.filter((o) => normalize(`${o.label} ${o.description ?? ''}`).includes(term))
      : options;

  const open = () => {
    if (disabled) return;
    setSearch('');
    setIsOpen(true);
  };

  const choose = (option: SelectOption) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        onPress={open}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value?.label ?? placeholder}`}
        style={({ pressed }) => [
          styles.field,
          disabled && styles.fieldDisabled,
          pressed && styles.fieldPressed,
        ]}
      >
        <View style={styles.fieldText}>
          {value ? (
            <>
              <Text style={styles.valueLabel} numberOfLines={1}>
                {value.label}
              </Text>
              {value.description ? (
                <Text style={styles.valueDescription} numberOfLines={1}>
                  {value.description}
                </Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.placeholder} numberOfLines={1}>
              {disabled && disabledHint ? disabledHint : placeholder}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
      </Pressable>

      <Modal
        visible={isOpen}
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <SafeAreaView style={styles.modal} edges={['top', 'bottom', 'left', 'right']}>
          <View style={styles.modalInner}>
            {/* Encabezado */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {label}
              </Text>
              <Pressable
                onPress={() => setIsOpen(false)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
              >
                <Ionicons name="close" size={26} color={colors.text} />
              </Pressable>
            </View>

            {/* Buscador */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={searchPlaceholder}
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.searchInput}
              />
              {search ? (
                <Pressable onPress={() => setSearch('')} hitSlop={8} accessibilityLabel="Borrar búsqueda">
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </Pressable>
              ) : null}
            </View>

            {/* Lista */}
            {isLoading && options.length === 0 ? (
              <View style={styles.stateBox}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.stateText}>Cargando...</Text>
              </View>
            ) : error ? (
              <View style={styles.stateBox}>
                <Text style={[styles.stateText, { color: colors.danger }]}>{error}</Text>
              </View>
            ) : (
              <FlatList
                data={visibleOptions}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                  isLoading ? (
                    <ActivityIndicator color={colors.primary} style={styles.inlineSpinner} />
                  ) : undefined
                }
                ListEmptyComponent={
                  <View style={styles.stateBox}>
                    <Text style={styles.stateText}>
                      {term ? 'No hay resultados para esa búsqueda.' : 'No hay elementos para mostrar.'}
                    </Text>
                  </View>
                }
                renderItem={({ item }) => {
                  const isSelected = item.id === value?.id;
                  return (
                    <Pressable
                      onPress={() => choose(item)}
                      style={({ pressed }) => [
                        styles.option,
                        isSelected && styles.optionSelected,
                        pressed && styles.fieldPressed,
                      ]}
                    >
                      <View style={styles.fieldText}>
                        <Text style={styles.optionLabel}>{item.label}</Text>
                        {item.description ? (
                          <Text style={styles.optionDescription}>{item.description}</Text>
                        ) : null}
                      </View>
                      {isSelected ? (
                        <Ionicons name="checkmark" size={20} color={colors.primary} />
                      ) : null}
                    </Pressable>
                  );
                }}
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.sm,
    },
    label: {
      color: c.text,
      fontWeight: '700',
      fontSize: 11,
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    field: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.input,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    fieldDisabled: {
      opacity: 0.55,
    },
    fieldPressed: {
      opacity: 0.8,
    },
    fieldText: {
      flex: 1,
      minWidth: 0,
    },
    valueLabel: {
      color: c.text,
      fontSize: 15,
      fontWeight: '600',
    },
    valueDescription: {
      color: c.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    placeholder: {
      color: c.textSecondary,
      fontSize: 15,
    },

    // Lista (modal a pantalla completa)
    modal: {
      flex: 1,
      backgroundColor: c.background,
    },
    modalInner: {
      flex: 1,
      width: '100%',
      maxWidth: 600, // en tablet / web no se estira
      alignSelf: 'center',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    modalTitle: {
      flex: 1,
      color: c.text,
      fontSize: 17,
      fontWeight: '700',
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      margin: theme.spacing.md,
      paddingHorizontal: 12,
      minHeight: 48,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.input,
    },
    searchInput: {
      flex: 1,
      color: c.text,
      fontSize: 15,
      paddingVertical: 10,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    optionSelected: {
      backgroundColor: c.primarySoft,
      borderLeftWidth: 4,
      borderLeftColor: c.primary,
    },
    optionLabel: {
      color: c.text,
      fontSize: 15,
      fontWeight: '600',
    },
    optionDescription: {
      color: c.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    stateBox: {
      alignItems: 'center',
      gap: 8,
      padding: theme.spacing.xl,
    },
    stateText: {
      color: c.textSecondary,
      fontSize: 14,
      textAlign: 'center',
    },
    inlineSpinner: {
      marginVertical: 8,
    },
  }),
);
