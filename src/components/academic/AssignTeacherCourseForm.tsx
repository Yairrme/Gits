import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isAxiosError } from 'axios';
import { FormCard, FormSectionTitle } from '@/components/academic/FormCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { SelectField, SelectOption } from '@/components/ui/SelectField';
import { theme } from '@/constants/theme';
import {
  changeCourseOfferingTeacher,
  createCourseOffering,
  getAcademicYears,
  getCourseOfferings,
  getSubjects,
  getTeachers,
} from '@/features/academic/academic.service';
import { CourseOfferingDetail, TeacherSummary } from '@/features/academic/academic.types';
import { COURSE_SHIFT_LABELS, CourseShift } from '@/features/courses/courses.types';
import { showAlert, showConfirm } from '@/lib/alert';
import { makeStyles, useAppTheme } from '@/lib/theme/use-app-theme';

type Mode = 'create' | 'change';

const SHIFTS = Object.keys(COURSE_SHIFT_LABELS) as CourseShift[];

/** Días de cursada (la API usa 1 = lunes … 7 = domingo) */
const DAYS = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
];

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/; // "HH:MM" de 00:00 a 23:59

const EMPTY_DETAILS = { commission: '', startTime: '', endTime: '', classroom: '', maxCapacity: '' };
type Details = typeof EMPTY_DETAILS;
type Errors = Partial<Record<keyof Details | 'teacher' | 'subject' | 'year' | 'shift', string>>;

function toTeacherOption(t: TeacherSummary): SelectOption {
  return {
    id: t.id,
    label: `${t.lastName}, ${t.firstName}`,
    description: `DNI ${t.documentNumber} · Legajo ${t.employeeNumber}`,
  };
}

function toCourseOption(c: CourseOfferingDetail): SelectOption {
  const teacher = c.teacher ? `Titular: ${c.teacher.lastName}, ${c.teacher.firstName}` : 'Sin titular';
  return {
    id: c.id,
    label: `${c.subject?.name ?? 'Materia'} — Com. ${c.commission}`,
    description: [COURSE_SHIFT_LABELS[c.shift] ?? c.shift, c.academicYear?.year, teacher]
      .filter(Boolean)
      .join(' · '),
  };
}

/**
 * Formulario para asignar una materia a un profesor (solo ADMIN / ACADEMIC).
 * - "Nueva comisión": crea la cursada de la materia en un año lectivo con su profesor (POST /course-offerings).
 * - "Cambiar titular": cambia el profesor de una comisión que ya existe (PATCH /course-offerings/:id).
 * Al profesor le aparece la materia en "Portal Docente" la próxima vez que entra.
 */
export function AssignTeacherCourseForm() {
  const styles = useStyles();
  const { colors } = useAppTheme();
  const [mode, setMode] = useState<Mode>('create');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  // --- Nueva comisión ---
  const [teacher, setTeacher] = useState<SelectOption | null>(null);
  const [subject, setSubject] = useState<SelectOption | null>(null);
  const [academicYear, setAcademicYear] = useState<SelectOption | null>(null);
  const [shift, setShift] = useState<CourseShift | null>(null);
  const [dayOfWeek, setDayOfWeek] = useState<number | null>(null);
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);

  // --- Cambiar titular ---
  const [course, setCourse] = useState<SelectOption | null>(null);
  const [newTeacher, setNewTeacher] = useState<SelectOption | null>(null);
  // Comisiones cargadas en el selector, para saber quién es el titular actual
  const coursesById = useRef(new Map<string, CourseOfferingDetail>());

  const clearError = (field: keyof Errors) => setErrors((prev) => ({ ...prev, [field]: undefined }));

  const setDetail = (field: keyof Details) => (text: string) => {
    setDetails((prev) => ({ ...prev, [field]: text }));
    clearError(field);
  };

  // --- Cargadores de las listas (se llaman al abrir cada selector) ---

  const loadTeachers = useCallback(
    async () =>
      (await getTeachers())
        .filter((t) => t.isActive !== false) // La API solo acepta docentes activos
        .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, 'es'))
        .map(toTeacherOption),
    [],
  );

  const loadSubjects = useCallback(
    async () =>
      (await getSubjects())
        .filter((s) => s.isActive !== false)
        .sort((a, b) => a.name.localeCompare(b.name, 'es'))
        .map((s) => ({
          id: s.id,
          label: s.name,
          description: [s.career?.name, s.year ? `${s.year}° año` : null, `Código ${s.code}`]
            .filter(Boolean)
            .join(' · '),
        })),
    [],
  );

  // Años lectivos: el vigente primero, después del más nuevo al más viejo
  const loadAcademicYears = useCallback(
    async () =>
      (await getAcademicYears())
        .sort((a, b) => Number(b.isActive) - Number(a.isActive) || b.year - a.year)
        .map((y) => ({
          id: y.id,
          label: y.name || String(y.year),
          description: `${y.year}${y.isActive ? ' · Vigente' : ''}`,
        })),
    [],
  );

  const loadCourses = useCallback(async () => {
    const list = (await getCourseOfferings()).filter((c) => c.isActive !== false);
    coursesById.current = new Map(list.map((c) => [c.id, c]));
    return list.map(toCourseOption);
  }, []);

  // --- Validaciones ---

  const validateCreate = (): Errors => {
    const e: Errors = {
      teacher: teacher ? '' : 'Elegí un profesor.',
      subject: subject ? '' : 'Elegí una materia.',
      year: academicYear ? '' : 'Elegí el año lectivo.',
      shift: shift ? '' : 'Elegí el turno.',
      commission: details.commission.trim() ? '' : 'Completá la comisión (ej. A).',
    };

    const start = details.startTime.trim();
    const end = details.endTime.trim();
    if (start && !TIME_REGEX.test(start)) e.startTime = 'Usá el formato HH:MM (ej. 08:00).';
    if (end && !TIME_REGEX.test(end)) e.endTime = 'Usá el formato HH:MM (ej. 10:00).';
    if (!e.startTime && !e.endTime) {
      if (start && !end) e.endTime = 'Completá también la hora de fin.';
      if (end && !start) e.startTime = 'Completá también la hora de inicio.';
      if (start && end && end <= start) e.endTime = 'La hora de fin debe ser posterior al inicio.';
    }

    const cap = details.maxCapacity.trim();
    if (cap && (!/^\d+$/.test(cap) || Number(cap) < 1)) e.maxCapacity = 'El cupo debe ser un número mayor a 0.';

    return Object.fromEntries(Object.entries(e).filter(([, msg]) => msg)) as Errors;
  };

  // --- Envíos ---

  const submitCreate = async () => {
    const found = validateCreate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      showAlert('Revisá el formulario', 'Hay campos incompletos o con errores.');
      return;
    }

    const commission = details.commission.trim().toUpperCase();
    setIsSaving(true);
    try {
      await createCourseOffering({
        teacherId: teacher!.id,
        subjectId: subject!.id,
        academicYearId: academicYear!.id,
        commission,
        shift: shift!,
        ...(dayOfWeek ? { dayOfWeek } : {}),
        startTime: details.startTime.trim(),
        endTime: details.endTime.trim(),
        classroom: details.classroom.trim(),
        ...(details.maxCapacity.trim() ? { maxCapacity: Number(details.maxCapacity) } : {}),
      });
      showAlert(
        'Materia asignada',
        `${teacher!.label} quedó a cargo de ${subject!.label} (Com. ${commission}, ${academicYear!.label}).`,
      );
      // Se mantiene el profesor y el año para asignarle otra materia más rápido
      setSubject(null);
      setShift(null);
      setDayOfWeek(null);
      setDetails(EMPTY_DETAILS);
    } catch (error) {
      const message =
        isAxiosError(error) && error.response?.status === 409
          ? `Ya existe la comisión ${commission} de esa materia en ese año lectivo. ` +
            'Para cambiarle el profesor, usá "Cambiar titular".'
          : error instanceof Error
            ? error.message
            : 'Ocurrió un error inesperado.';
      showAlert('No se pudo asignar la materia', message);
    } finally {
      setIsSaving(false);
    }
  };

  const submitChange = async () => {
    if (!course || !newTeacher) {
      showAlert('Datos incompletos', 'Elegí la comisión y el nuevo profesor.');
      return;
    }
    const current = coursesById.current.get(course.id);
    const currentTeacherId = current?.teacherId ?? current?.teacher?.id;
    if (currentTeacherId && currentTeacherId === newTeacher.id) {
      showAlert('Sin cambios', `${newTeacher.label} ya es el titular de esa comisión.`);
      return;
    }

    const currentName = current?.teacher ? `${current.teacher.lastName}, ${current.teacher.firstName}` : null;
    const confirmed = await showConfirm(
      'Cambiar titular',
      `${course.label}\n` +
        (currentName ? `Titular actual: ${currentName}\n` : '') +
        `Nuevo titular: ${newTeacher.label}\n\n` +
        'Es un cambio definitivo y queda registrado. Para una suplencia temporal no uses esta opción.',
      'Cambiar',
    );
    if (!confirmed) return;

    setIsSaving(true);
    try {
      await changeCourseOfferingTeacher(course.id, newTeacher.id);
      showAlert('Titular actualizado', `${newTeacher.label} ahora está a cargo de ${course.label}.`);
      setCourse(null);
      setNewTeacher(null);
    } catch (error) {
      showAlert('No se pudo cambiar el titular', error instanceof Error ? error.message : 'Ocurrió un error inesperado.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormCard
      title="Asignar Materia a Profesor"
      description="Crea la comisión de una materia con su profesor, o cambia el titular de una comisión existente."
      accentColor={colors.warning}
    >
      {/* Selector de modo */}
      <View style={styles.modeRow} accessibilityRole="tablist">
        {(
          [
            { key: 'create', label: 'NUEVA COMISIÓN', icon: 'add-sharp' },
            { key: 'change', label: 'CAMBIAR TITULAR', icon: 'swap-horizontal-sharp' },
          ] as const
        ).map((m) => {
          const isActive = mode === m.key;
          return (
            <Pressable
              key={m.key}
              onPress={() => {
                setMode(m.key);
                setErrors({});
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={[styles.modeBtn, isActive && styles.modeBtnActive]}
            >
              <Ionicons name={m.icon} size={14} color={isActive ? colors.onPrimary : colors.textSecondary} />
              <Text style={[styles.modeText, isActive && styles.modeTextActive]}>{m.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {mode === 'create' ? (
        <>
          <FormSectionTitle>QUÉ Y QUIÉN</FormSectionTitle>
          {/* Cada selector lleva su propio `key`: sin eso, al cambiar de modo React reutiliza
              el mismo componente y por un instante muestra la lista del otro selector. */}
          <SelectField
            key="create-teacher"
            label="PROFESOR *"
            placeholder="Elegí un profesor"
            searchPlaceholder="Buscar por apellido, nombre o DNI"
            value={teacher}
            onChange={(o) => {
              setTeacher(o);
              clearError('teacher');
            }}
            loadOptions={loadTeachers}
          />
          {errors.teacher ? <Text style={styles.error}>{errors.teacher}</Text> : null}

          <SelectField
            key="create-subject"
            label="MATERIA *"
            placeholder="Elegí una materia"
            searchPlaceholder="Buscar por nombre, carrera o código"
            value={subject}
            onChange={(o) => {
              setSubject(o);
              clearError('subject');
            }}
            loadOptions={loadSubjects}
          />
          {errors.subject ? <Text style={styles.error}>{errors.subject}</Text> : null}

          <SelectField
            key="create-year"
            label="AÑO LECTIVO *"
            placeholder="Elegí el año lectivo"
            value={academicYear}
            onChange={(o) => {
              setAcademicYear(o);
              clearError('year');
            }}
            loadOptions={loadAcademicYears}
          />
          {errors.year ? <Text style={styles.error}>{errors.year}</Text> : null}

          <FormSectionTitle>COMISIÓN</FormSectionTitle>
          <AppInput
            label="Comisión *"
            value={details.commission}
            onChangeText={setDetail('commission')}
            error={errors.commission}
            placeholder="A"
            autoCapitalize="characters"
            maxLength={10}
          />

          <Text style={styles.chipLabel}>Turno *</Text>
          <View style={styles.chipRow}>
            {SHIFTS.map((s) => (
              <Chip
                key={s}
                label={COURSE_SHIFT_LABELS[s]}
                selected={shift === s}
                onPress={() => {
                  setShift(s);
                  clearError('shift');
                }}
              />
            ))}
          </View>
          {errors.shift ? <Text style={styles.error}>{errors.shift}</Text> : null}

          <FormSectionTitle>HORARIO (OPCIONAL)</FormSectionTitle>
          <Text style={styles.chipLabel}>Día</Text>
          <View style={styles.chipRow}>
            {DAYS.map((d) => (
              <Chip
                key={d.value}
                label={d.label}
                selected={dayOfWeek === d.value}
                // Tocar el día elegido lo desmarca
                onPress={() => setDayOfWeek((prev) => (prev === d.value ? null : d.value))}
              />
            ))}
          </View>
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <AppInput
                label="Desde"
                value={details.startTime}
                onChangeText={setDetail('startTime')}
                error={errors.startTime}
                placeholder="08:00"
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
            </View>
            <View style={styles.rowItem}>
              <AppInput
                label="Hasta"
                value={details.endTime}
                onChangeText={setDetail('endTime')}
                error={errors.endTime}
                placeholder="10:00"
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <AppInput
                label="Aula"
                value={details.classroom}
                onChangeText={setDetail('classroom')}
                placeholder="Aula 12"
              />
            </View>
            <View style={styles.rowItem}>
              <AppInput
                label="Cupo"
                value={details.maxCapacity}
                onChangeText={setDetail('maxCapacity')}
                error={errors.maxCapacity}
                placeholder="Sin límite"
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
          </View>

          <AppButton
            title={isSaving ? 'Asignando materia...' : 'Asignar Materia'}
            onPress={submitCreate}
            disabled={isSaving}
            icon={<Ionicons name="checkmark-sharp" size={16} color={colors.onPrimary} />}
          />
        </>
      ) : (
        <>
          <Text style={styles.note}>
            Cambio definitivo del profesor titular. El nuevo titular pasa a ver la materia en su
            portal y el anterior deja de verla.
          </Text>
          <SelectField
            key="change-course"
            label="COMISIÓN"
            placeholder="Elegí una comisión"
            searchPlaceholder="Buscar por materia, comisión o docente"
            value={course}
            onChange={setCourse}
            loadOptions={loadCourses}
          />
          <SelectField
            key="change-teacher"
            label="NUEVO PROFESOR TITULAR"
            placeholder="Elegí un profesor"
            searchPlaceholder="Buscar por apellido, nombre o DNI"
            value={newTeacher}
            onChange={setNewTeacher}
            loadOptions={loadTeachers}
          />

          <AppButton
            title={isSaving ? 'Cambiando titular...' : 'Cambiar Titular'}
            onPress={submitChange}
            disabled={isSaving}
            variant="secondary"
            icon={<Ionicons name="swap-horizontal-sharp" size={16} color={colors.onPrimary} />}
          />
        </>
      )}
    </FormCard>
  );
}

/** Botón chico seleccionable (turno, día) */
function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && { opacity: 0.8 }]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    modeRow: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: theme.spacing.sm,
    },
    modeBtn: {
      flex: 1,
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingHorizontal: 6,
      backgroundColor: c.input,
    },
    modeBtnActive: {
      backgroundColor: c.primary,
    },
    modeText: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.5,
      color: c.textSecondary,
    },
    modeTextActive: {
      color: c.onPrimary,
    },
    chipLabel: {
      color: c.text,
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 6,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: theme.spacing.sm,
    },
    chip: {
      minHeight: 36,
      paddingHorizontal: 12,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.input,
    },
    chipSelected: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    chipText: {
      fontSize: 12,
      fontWeight: '600',
      color: c.text,
    },
    chipTextSelected: {
      color: c.onPrimary,
    },
    row: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    rowItem: {
      flex: 1,
    },
    error: {
      color: c.danger,
      fontSize: 12,
      marginTop: -4,
      marginBottom: theme.spacing.sm,
    },
    note: {
      color: c.textSecondary,
      fontSize: 12,
      lineHeight: 18,
      marginBottom: theme.spacing.sm,
    },
  }),
);
