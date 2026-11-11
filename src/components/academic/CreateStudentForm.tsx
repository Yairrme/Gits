import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { FormCard, FormSectionTitle } from '@/components/academic/FormCard';
import { BRAND, theme } from '@/constants/theme';
import { createStudent, createStudentAccount } from '@/features/academic/academic.service';
import { showAlert } from '@/lib/alert';
import { makeStyles, useAppTheme } from '@/lib/theme/use-app-theme';
import {
  cleanDni,
  required,
  validateDni,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validatePastDate,
} from '@/lib/validation';

const EMPTY = {
  firstName: '',
  lastName: '',
  documentNumber: '',
  studentNumber: '',
  email: '',
  phone: '',
  birthDate: '',
  password: '',
  passwordRepeat: '',
};
type FormValues = typeof EMPTY;
type FormErrors = Partial<Record<keyof FormValues, string>>;

/**
 * Formulario para dar de alta un alumno (solo ADMIN / ACADEMIC).
 * 1. Crea el perfil (POST /students).
 * 2. Si se marca "Crear cuenta", crea su usuario para iniciar sesión (POST /students/:id/account).
 */
export function CreateStudentForm() {
  const styles = useStyles();
  const { colors } = useAppTheme();
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [withAccount, setWithAccount] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Actualiza un campo y borra su error
  const set = (field: keyof FormValues) => (text: string) => {
    setValues((prev) => ({ ...prev, [field]: text }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): FormErrors => {
    const e: FormErrors = {
      firstName: required(values.firstName, 'el nombre'),
      lastName: required(values.lastName, 'el apellido'),
      documentNumber: validateDni(values.documentNumber),
      studentNumber: required(values.studentNumber, 'el legajo'),
      // Con cuenta de acceso el email es obligatorio (lo usa para iniciar sesión)
      email: validateEmail(values.email, !withAccount),
      birthDate: validatePastDate(values.birthDate),
    };
    if (withAccount) {
      e.password = validatePassword(values.password);
      e.passwordRepeat = e.password ? '' : validatePasswordMatch(values.password, values.passwordRepeat);
    }
    return Object.fromEntries(Object.entries(e).filter(([, msg]) => msg)) as FormErrors;
  };

  const submit = async () => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      showAlert('Revisá el formulario', 'Hay campos incompletos o con errores.');
      return;
    }

    setIsSaving(true);
    const fullName = `${values.lastName.trim()}, ${values.firstName.trim()}`;
    try {
      // Paso 1: perfil del alumno
      const student = await createStudent({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        documentNumber: cleanDni(values.documentNumber),
        studentNumber: values.studentNumber.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        birthDate: values.birthDate.trim(),
      });

      // Paso 2 (opcional): cuenta para iniciar sesión
      if (withAccount) {
        try {
          await createStudentAccount(student.id, {
            email: values.email.trim(),
            password: values.password,
          });
        } catch (accountError) {
          const msg = accountError instanceof Error ? accountError.message : 'Error desconocido.';
          showAlert(
            'Alumno creado sin cuenta',
            `${fullName} se creó, pero no se pudo crear su cuenta de acceso: ${msg}`,
          );
          setValues(EMPTY);
          return;
        }
      }

      showAlert(
        'Alumno creado',
        withAccount
          ? `${fullName} ya puede iniciar sesión con ${values.email.trim()}. Se le va a pedir cambiar la contraseña en el primer ingreso.`
          : `${fullName} se creó. Ya podés inscribirlo en una comisión.`,
      );
      setValues(EMPTY);
    } catch (error) {
      showAlert('No se pudo crear el alumno', error instanceof Error ? error.message : 'Ocurrió un error inesperado.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormCard
      title="Alta de Alumno"
      description="Registra un nuevo estudiante. Los campos con * son obligatorios."
      accentColor={colors.primary}
    >
      <FormSectionTitle>DATOS PERSONALES</FormSectionTitle>
      <AppInput label="Nombre *" value={values.firstName} onChangeText={set('firstName')} error={errors.firstName} placeholder="María" autoCapitalize="words" />
      <AppInput label="Apellido *" value={values.lastName} onChangeText={set('lastName')} error={errors.lastName} placeholder="García" autoCapitalize="words" />
      <AppInput label="DNI *" value={values.documentNumber} onChangeText={set('documentNumber')} error={errors.documentNumber} placeholder="40123456" keyboardType="number-pad" maxLength={10} />
      <AppInput label="Legajo *" value={values.studentNumber} onChangeText={set('studentNumber')} error={errors.studentNumber} placeholder="STU-2026-001" autoCapitalize="characters" />
      <AppInput label="Fecha de nacimiento (AAAA-MM-DD)" value={values.birthDate} onChangeText={set('birthDate')} error={errors.birthDate} placeholder="2004-05-15" keyboardType="numbers-and-punctuation" maxLength={10} />
      <AppInput label="Teléfono" value={values.phone} onChangeText={set('phone')} placeholder="299 477-1976" keyboardType="phone-pad" />
      <AppInput label={withAccount ? 'Email *' : 'Email'} value={values.email} onChangeText={set('email')} error={errors.email} placeholder="maria.garcia@mail.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />

      {/* Cuenta de acceso */}
      <View style={styles.switchRow}>
        <View style={styles.switchText}>
          <Text style={styles.switchTitle}>Crear cuenta para iniciar sesión</Text>
          <Text style={styles.switchHint}>
            El alumno entra con su email y esta contraseña. Se le pide cambiarla la primera vez.
          </Text>
        </View>
        <Switch
          value={withAccount}
          onValueChange={setWithAccount}
          trackColor={{ false: '#ccc', true: BRAND.blue }}
          thumbColor="#fff"
        />
      </View>

      {withAccount ? (
        <>
          <AppInput label="Contraseña inicial *" value={values.password} onChangeText={set('password')} error={errors.password} placeholder="Mínimo 6 caracteres" secureTextEntry autoCapitalize="none" />
          <AppInput label="Repetir contraseña *" value={values.passwordRepeat} onChangeText={set('passwordRepeat')} error={errors.passwordRepeat} placeholder="Repetí la contraseña" secureTextEntry autoCapitalize="none" />
        </>
      ) : null}

      <AppButton
        title={isSaving ? 'Creando alumno...' : 'Crear Alumno'}
        onPress={submit}
        disabled={isSaving}
        icon={<Ionicons name="person-add-sharp" size={16} color={colors.onPrimary} />}
      />
    </FormCard>
  );
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.md,
      padding: theme.spacing.sm,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background,
    },
    switchText: {
      flex: 1,
    },
    switchTitle: {
      color: c.text,
      fontSize: 14,
      fontWeight: '700',
    },
    switchHint: {
      color: c.textSecondary,
      fontSize: 12,
      marginTop: 2,
      lineHeight: 16,
    },
  }),
);
