import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import {
  MONTH_NAMES,
  WEEKDAY_INITIALS_MONDAY_FIRST,
  formatLongDate,
  parseDateString,
  toDateString,
  todayString,
} from '@/lib/dates';
import { makeStyles, useAppTheme } from '@/lib/theme/use-app-theme';

type Props = {
  label: string;
  value: string;                      // Fecha elegida "AAAA-MM-DD"
  onChange: (value: string) => void;
  maxDate?: string;                   // Última fecha que se puede elegir "AAAA-MM-DD" (ej. hoy)
  minDate?: string;                   // Primera fecha que se puede elegir "AAAA-MM-DD"
  error?: string;
  disabled?: boolean;                 // Si es true, no se puede abrir el calendario
};

/**
 * Campo de fecha con calendario (funciona igual en Android, iOS y web).
 * Muestra la fecha en texto ("jueves 6 de agosto de 2026") y al tocarlo abre un calendario mensual.
 */
export function DatePickerField({ label, value, onChange, maxDate, minDate, error, disabled }: Props) {
  const styles = useStyles();
  const { colors } = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Mes que se está viendo en el calendario (primer día del mes)
  const initial = parseDateString(value) ?? new Date();
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(initial.getFullYear(), initial.getMonth(), 1),
  );

  const today = todayString();
  const isDisabled = (day: string) =>
    (maxDate !== undefined && day > maxDate) || (minDate !== undefined && day < minDate);

  const open = () => {
    const selected = parseDateString(value) ?? new Date();
    setVisibleMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    setIsOpen(true);
  };

  const choose = (day: string) => {
    if (isDisabled(day)) return;
    onChange(day);
    setIsOpen(false);
  };

  const moveMonth = (delta: number) => {
    setVisibleMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  };

  // Celdas del mes: huecos vacíos al principio (la semana empieza el lunes) + días del mes
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7; // lunes = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array<null>(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toDateString(new Date(year, month, i + 1))),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  // No dejar avanzar a meses que quedan totalmente fuera del rango
  const lastDayOfMonth = toDateString(new Date(year, month + 1, 0));
  const firstDayOfMonth = toDateString(new Date(year, month, 1));
  const canGoNext = maxDate === undefined || lastDayOfMonth < maxDate;
  const canGoPrev = minDate === undefined || firstDayOfMonth > minDate;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={open}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${formatLongDate(value)}`}
        accessibilityState={{ disabled: Boolean(disabled) }}
        style={({ pressed }) => [
          styles.field,
          error ? styles.fieldError : null,
          pressed && styles.pressed,
          disabled && { opacity: 0.6 },
        ]}
      >
        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        <Text style={styles.fieldText} numberOfLines={1}>
          {value ? formatLongDate(value) : 'Elegí una fecha'}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        {/* Fondo oscuro: tocarlo cierra el calendario */}
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          {/* El calendario no cierra al tocarlo */}
          <Pressable style={styles.sheet} onPress={() => {}}>
            {/* Mes y flechas */}
            <View style={styles.monthRow}>
              <Pressable
                onPress={() => moveMonth(-1)}
                disabled={!canGoPrev}
                hitSlop={8}
                accessibilityLabel="Mes anterior"
                style={[styles.arrow, !canGoPrev && styles.arrowDisabled]}
              >
                <Ionicons name="chevron-back" size={22} color={colors.text} />
              </Pressable>
              <Text style={styles.monthTitle}>
                {MONTH_NAMES[month].charAt(0).toUpperCase() + MONTH_NAMES[month].slice(1)} {year}
              </Text>
              <Pressable
                onPress={() => moveMonth(1)}
                disabled={!canGoNext}
                hitSlop={8}
                accessibilityLabel="Mes siguiente"
                style={[styles.arrow, !canGoNext && styles.arrowDisabled]}
              >
                <Ionicons name="chevron-forward" size={22} color={colors.text} />
              </Pressable>
            </View>

            {/* Iniciales de los días */}
            <View style={styles.weekRow}>
              {WEEKDAY_INITIALS_MONDAY_FIRST.map((d, i) => (
                <Text key={i} style={styles.weekDay}>
                  {d}
                </Text>
              ))}
            </View>

            {/* Días */}
            <View style={styles.grid}>
              {cells.map((day, i) => {
                if (!day) return <View key={`b${i}`} style={styles.cell} />;
                const selected = day === value;
                const isToday = day === today;
                const disabled = isDisabled(day);
                return (
                  <Pressable
                    key={day}
                    onPress={() => choose(day)}
                    disabled={disabled}
                    accessibilityRole="button"
                    accessibilityLabel={formatLongDate(day)}
                    accessibilityState={{ selected, disabled }}
                    style={({ pressed }) => [
                      styles.cell,
                      isToday && !selected && styles.cellToday,
                      selected && styles.cellSelected,
                      pressed && !disabled && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isToday && styles.dayTextToday,
                        selected && styles.dayTextSelected,
                        disabled && styles.dayTextDisabled,
                      ]}
                    >
                      {Number(day.slice(8))}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Acciones */}
            <View style={styles.actions}>
              <Pressable onPress={() => setIsOpen(false)} style={styles.actionBtn} hitSlop={6}>
                <Text style={styles.actionTextMuted}>Cancelar</Text>
              </Pressable>
              {!isDisabled(today) ? (
                <Pressable onPress={() => choose(today)} style={styles.actionBtn} hitSlop={6}>
                  <Text style={styles.actionText}>Hoy</Text>
                </Pressable>
              ) : null}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    container: {
      width: '100%',
      marginBottom: theme.spacing.sm,
    },
    label: {
      fontSize: theme.typography.small,
      fontWeight: '600',
      color: c.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    field: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.input,
      paddingHorizontal: theme.spacing.md,
    },
    fieldError: {
      borderColor: c.danger,
    },
    fieldText: {
      flex: 1,
      color: c.text,
      fontSize: theme.typography.body,
      fontWeight: '600',
    },
    errorText: {
      fontSize: theme.typography.small,
      color: c.danger,
      marginTop: 4,
    },
    pressed: {
      opacity: 0.75,
    },

    // Calendario
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    sheet: {
      width: '100%',
      maxWidth: 380,
      backgroundColor: c.background,
      borderWidth: 1,
      borderColor: c.border,
      borderTopWidth: 4,
      borderTopColor: c.primary,
      padding: theme.spacing.md,
    },
    monthRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    arrow: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.border,
    },
    arrowDisabled: {
      opacity: 0.3,
    },
    monthTitle: {
      color: c.text,
      fontSize: 17,
      fontWeight: '700',
    },
    weekRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      paddingBottom: 6,
      marginBottom: 4,
    },
    weekDay: {
      width: `${100 / 7}%`,
      textAlign: 'center',
      color: c.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    cell: {
      width: `${100 / 7}%`,
      aspectRatio: 1,
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cellToday: {
      borderWidth: 1.5,
      borderColor: c.primary,
    },
    cellSelected: {
      backgroundColor: c.primary,
    },
    dayText: {
      color: c.text,
      fontSize: 15,
    },
    dayTextToday: {
      color: c.primary,
      fontWeight: '700',
    },
    dayTextSelected: {
      color: c.onPrimary,
      fontWeight: '700',
    },
    dayTextDisabled: {
      color: c.textSecondary,
      opacity: 0.4,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: theme.spacing.lg,
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    actionBtn: {
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    actionText: {
      color: c.primary,
      fontSize: 15,
      fontWeight: '700',
    },
    actionTextMuted: {
      color: c.textSecondary,
      fontSize: 15,
      fontWeight: '600',
    },
  }),
);
