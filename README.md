# Gits · GIT Cipolletti

App móvil (Android, iOS y web) del instituto para gestionar cursadas y asistencias.
Hecha con **Expo SDK 58**, **Expo Router** (rutas por archivos), **TypeScript** y **Axios**.
Se conecta a la API `https://api-gits.innovaweb.com.ar`, que se puede cambiar con la variable `EXPO_PUBLIC_API_URL` en `.env`.

## Cómo correrla

```bash
npm install
npx expo start
```

Después se abre en Expo Go, en un emulador o en el navegador (tecla `w`).

## Estructura

```
PRODUCT.md           qué es la app, para quién y sus restricciones (contexto para diseñar)
DESIGN.md            sistema visual: colores, tipografía, componentes y reglas (con .impeccable/design.json)
assets/
  images/            logos (logo-light.webp / logo-dark.webp), íconos y splash
  expo.icon/         ícono de iOS
src/
  app/               PANTALLAS (cada archivo es una ruta)
    _layout.tsx      raíz: SessionProvider + guard (sin sesión → login; con sesión → solo su sección)
    index.tsx        "/" → redirige al login
    (public)/        sin sesión (grupo: no aparece en la URL → /login)
      login.tsx      login con modo claro/oscuro, logo y footer institucional
    student/         rol STUDENT → URLs /student/...
      index.tsx              /student                     mis materias
      attendance-history.tsx /student/attendance-history  historial de asistencias
      profile.tsx            /student/profile             credencial + cerrar sesión
    teacher/         rol TEACHER → URLs /teacher/...
      index.tsx                         /teacher                  mis comisiones
      course-offerings/[id].tsx         detalle de la comisión
      course-offerings/[id]/students    nómina de alumnos
      course-offerings/[id]/attendance  tomar asistencia
      course-offerings/[id]/sessions    libro de temas (clases dictadas)
      course-offerings/[id]/class-sessions/[sessionId]  detalle de una clase: ver y corregir / justificar asistencias
      profile.tsx                       /teacher/profile          credencial + cerrar sesión
    academic/        roles ACADEMIC y ADMIN → URL /academic
      index.tsx      4 pestañas: asignar materia, asignar carrera, alta de alumno, alta de profesor + salir
  components/        piezas visuales reutilizables
    ui/              AppButton, AppInput, Card, Screen, FeedbackState, SelectField (lista con buscador), DatePickerField (calendario),
                     HeaderButton (botón PERFIL / SALIR del header)
    courses/         CourseOfferingCard
    academic/        FormCard, CreateStudentForm, CreateTeacherForm (altas del panel de admin)
    students/        StudentCard, StudentAttendanceRow
    attendance/      AttendanceStatusSelector, AttendanceSummaryCard
  features/          LÓGICA por módulo: *.service.ts (llamadas a la API),
                     *.types.ts (tipos) y use*.ts (hooks para las pantallas)
    auth/            login, SessionProvider, useSession
    courses/         comisiones del docente/alumno, detalle, alumnos inscriptos
    attendance/      clases, asistencia en lote, historial del alumno; colores de P / A / T / J
                     (attendance.constants.ts, paleta propia legible en modo claro y oscuro)
    academic/        inscripciones y asignación de carreras
  lib/
    api/api.client.ts           Axios: agrega el token y desempaqueta { success, data }
    alert.ts, validation.ts     avisos (web / celular) y validaciones de formularios (DNI, email, contraseña)
    storage/secure-storage.ts   token y usuario (SecureStore en celular, localStorage en web)
    hooks/use-color-scheme*     modo claro/oscuro del sistema
    theme/use-app-theme.ts      useAppTheme(), makeStyles() y el selector claro/oscuro compartido
  constants/
    theme.ts         paleta de toda la app (la del login): BRAND, palettes.light / .dark, espaciados y radios
    navigation.ts    useStackHeaderOptions(): header común de los Stack de cada rol
```

Cada pantalla llama a un hook (`features/*/use*.ts`). El hook llama a un service (`*.service.ts`), y el service usa `api.client.ts`.

## Qué se puede hacer hoy

| Rol               | Funciones                                                                                                                                                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Todos             | Iniciar sesión, sesión guardada al reabrir la app, vuelta automática al login si el token vence, redirección automática al panel del rol (y bloqueo de las secciones de otros roles), cerrar sesión, modo claro/oscuro en el login                           |
| Alumno            | Ver sus materias, ver el historial de asistencias con resumen (presentes / ausentes / porcentaje), ver su credencial                                                                                                                                         |
| Docente           | Ver sus comisiones, ver el detalle y la nómina de alumnos, tomar asistencia (fecha, tema y estado por alumno, enviada en lote), ver el libro de temas, corregir o justificar asistencias de una clase (hasta el día siguiente a la clase), ver su credencial. Al tomar o corregir asistencia: aviso antes de salir sin guardar, confirmación al marcar "todos presentes / ausentes" si ya había estados distintos, error del guardado junto al botón, botones P / A / T / J de 44 px con nombre del alumno para el lector de pantalla |
| Académico / Admin | Inscribir un alumno a una comisión y asignarle carrera y plan (eligiendo de listas con buscador), dar de alta alumnos (con su cuenta de acceso opcional) y profesores                                                                                        |

### Endpoints que usa

| Método     | Ruta                                                                      | Para qué                                                                  |
| ---------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| POST       | `/auth/login`                                                             | iniciar sesión                                                            |
| GET        | `/teachers/me/course-offerings`                                           | comisiones del docente                                                    |
| GET        | `/course-offerings/:id`                                                   | detalle de una comisión                                                   |
| GET        | `/course-offerings/:id/students`                                          | alumnos inscriptos                                                        |
| GET / POST | `/course-offerings/:id/class-sessions`                                    | listar y crear clases                                                     |
| POST       | `/class-sessions/:id/attendance/bulk`                                     | guardar la asistencia de toda la clase                                    |
| PATCH      | `/class-sessions/:id/close`                                               | cerrar la clase                                                           |
| GET        | `/class-sessions/:id`, `/class-sessions/:id/attendance`                   | detalle de una clase y la asistencia de cada alumno                       |
| PATCH      | `/class-sessions/:id/reopen`, `/attendance/:id`                           | reabrir una clase (con motivo) y corregir / justificar un registro        |
| GET        | `/students/me/enrollments`                                                | materias del alumno (solo inscripciones activas, con la comisión anidada) |
| GET        | `/students/me`                                                            | perfil del alumno (legajo, DNI, estado)                                   |
| GET        | `/students/me/attendance`                                                 | historial de asistencias del alumno                                       |
| GET        | `/students?q=`, `/course-offerings`, `/careers`, `/study-plans?careerId=` | listas para los selectores del panel académico                            |
| POST       | `/enrollments`, `/student-careers`                                        | gestión académica                                                         |
| POST       | `/students`, `/students/:id/account`, `/teachers`                         | altas de alumnos (y su cuenta) y de profesores                            |

## Pendientes conocidos

Están marcados en el código con `⚠️ REVISAR`:

1. Si falla el guardado de la asistencia, la clase ya quedó creada sin registros (`useAttendanceSession.ts`).
2. "¿Olvidaste tu contraseña?" todavía no hace nada.
