import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { FormCard, FormSectionTitle } from '@/components/academic/FormCard';
import { createTeacher } from '@/features/academic/academic.service';
import { showAlert } from '@/lib/alert';
import { useAppTheme } from '@/lib/theme/use-app-theme';
import {
  cleanDni,
  required,
  validateDni,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
} from '@/lib/validation';

const EMPTY = {
  firstName: '',
  lastName: '',
  documentNumber: '',
  employeeNumber: '',
  phone: '',
  institutionalEmail: '',
  email: '',
  password: '',
  passwordRepeat: '',
};
type FormValues = typeof EMPTY;
type FormErrors = Partial<Record<keyof FormValues, string>>;

/**
 * Formulario para dar de alta un profesor (solo ADMIN / ACADEMIC).
 * POST /teachers crea en un solo paso su usuario (para iniciar sesión) y su perfil.
 */
export function CreateTeacherForm() {
  const { colors } = useAppTheme();
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // Actualiza un campo y borra su error
  const set = (field: keyof FormValues) => (text: string) => {
    setValues((prev) => ({ ...prev, [field]: text }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): FormErrors => {
    const password = validatePassword(values.password);
    const e: FormErrors = {
      firstName: required(values.firstName, 'el nombre'),
      lastName: required(values.lastName, 'el apellido'),
      documentNumber: validateDni(values.documentNumber),
      employeeNumber: required(values.employeeNumber, 'el número de empleado'),
      institutionalEmail: validateEmail(values.institutionalEmail, true),
      email: validateEmail(values.email),
      password,
      passwordRepeat: password ? '' : validatePasswordMatch(values.password, values.passwordRepeat),
    };
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
    try {
      const teacher = await createTeacher({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        documentNumber: cleanDni(values.documentNumber),
        employeeNumber: values.employeeNumber.trim(),
        phone: values.phone.trim(),
        institutionalEmail: values.institutionalEmail.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      showAlert(
        'Profesor creado',
        `${teacher.lastName}, ${teacher.firstName} ya puede iniciar sesión con ${values.email.trim()}.`,
      );
      setValues(EMPTY);
    } catch (error) {
      showAlert('No se pudo crear el profesor', error instanceof Error ? error.message : 'Ocurrió un error inesperado.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormCard
      title="Alta de Profesor"
      description="Crea el usuario y el perfil del docente. Los campos con * son obligatorios."
      accentColor={colors.secondary}
    >
      <FormSectionTitle>DATOS PERSONALES</FormSectionTitle>
      <AppInput label="Nombre *" value={values.firstName} onChangeText={set('firstName')} error={errors.firstName} placeholder="Juan" autoCapitalize="words" />
      <AppInput label="Apellido *" value={values.lastName} onChangeText={set('lastName')} error={errors.lastName} placeholder="Pérez" autoCapitalize="words" />
      <AppInput label="DNI *" value={values.documentNumber} onChangeText={set('documentNumber')} error={errors.documentNumber} placeholder="30111222" keyboardType="number-pad" maxLength={10} />
      <AppInput label="Número de empleado *" value={values.employeeNumber} onChangeText={set('employeeNumber')} error={errors.employeeNumber} placeholder="EMP-001" autoCapitalize="characters" />
      <AppInput label="Teléfono" value={values.phone} onChangeText={set('phone')} placeholder="299 477-1976" keyboardType="phone-pad" />
      <AppInput label="Email institucional" value={values.institutionalEmail} onChangeText={set('institutionalEmail')} error={errors.institutionalEmail} placeholder="jperez@its.edu.ar" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />

      <FormSectionTitle>CUENTA PARA INICIAR SESIÓN</FormSectionTitle>
      <AppInput label="Email de acceso *" value={values.email} onChangeText={set('email')} error={errors.email} placeholder="profesor@its.edu.ar" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
      <AppInput label="Contraseña inicial *" value={values.password} onChangeText={set('password')} error={errors.password} placeholder="Mínimo 6 caracteres" secureTextEntry autoCapitalize="none" />
      <AppInput label="Repetir contraseña *" value={values.passwordRepeat} onChangeText={set('passwordRepeat')} error={errors.passwordRepeat} placeholder="Repetí la contraseña" secureTextEntry autoCapitalize="none" />

      <AppButton
        title={isSaving ? 'Creando profesor...' : 'Crear Profesor'}
        onPress={submit}
        disabled={isSaving}
        icon={<Ionicons name="person-add-sharp" size={16} color={colors.onPrimary} />}
      />
    </FormCard>
  );
}
