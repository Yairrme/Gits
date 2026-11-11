# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

<!-- Recorded as `web` because the app uses one custom brand design language on every target, not per-OS native conventions (user decision, 2026-11-10). It still ships as an Expo native app: Android and iOS phones come first, the browser build comes second. Touch targets, safe areas, the keyboard and one-handed use on a phone are the baseline. -->

## Users

Three groups of users at ITS Cipolletti. All three count equally (user decision); none outranks the others:

- **Students:** check their enrolled subjects and their attendance record (present / absent / percentage) to know where they stand, and show their credential.
- **Teachers:** see their course offerings (comisiones) and student lists, take attendance during class (date, topic, a status for each student, sent in one batch), keep the topic log (libro de temas), and correct or excuse attendance records.
- **Academic staff / admins:** enroll students in course offerings, assign careers and study plans, and register new students (optionally with a login account) and new teachers.

Each user only sees their own role's section. After login the app sends them straight to their role's panel.

## Product Purpose

Gits is the institute's app for managing courses and attendance. It replaces paper and scattered records: teachers record attendance, students check it, and academic staff keep enrollments up to date, all from the same system. It counts as a success when the people at the institute actually use it every day for these jobs.

## Positioning

Gits is built for ITS Cipolletti's own academic structure: careers, study plans, course offerings, class sessions and the topic log. It runs on the institute's own API, not on a generic LMS or attendance tool.

## Operating Context

- It started as a class project for the Desarrollo Móvil course (third year, Full Stack), and the goal is for real students and teachers to use it against the real API (user decision).
- Teachers take attendance on a phone during class, under time pressure.
- Students mostly use it on their phones. Academic staff may also use the web build.
- The app keeps the user logged in when they reopen it, and sends them back to login when their token expires.

## Capabilities and Constraints

- Stack already in place: Expo SDK 58, Expo Router (file-based routes, typed routes), TypeScript, Axios, React Compiler. Read the versioned docs at https://docs.expo.dev/versions/v58.0.0/ before writing code (AGENTS.md).
- The backend is `https://api-gits.innovaweb.com.ar`, which can be changed with `EXPO_PUBLIC_API_URL`. The endpoints are listed in README.md. The app works with the API as it is and doesn't define it.
- Roles: `STUDENT`, `TEACHER`, `ACADEMIC`, `ADMIN` (ACADEMIC and ADMIN share `/academic`). The route guard blocks access to other roles' sections.
- Teachers can correct or excuse attendance records until the day after the class. Reopening a closed class requires a reason.
- Light and dark mode follow the system setting and can also be switched by hand. The choice applies to the whole app.
- The token is stored in SecureStore on phones and in localStorage on web.
- Known open issues (`⚠️ REVISAR` in the code): if saving attendance fails, the class session has already been created with no records; "¿Olvidaste tu contraseña?" doesn't do anything yet.

## Brand Commitments

- App name: **Gits**. Institution: **ITS Cipolletti** (domain itscipolletti.edu.ar). Note: README.md says "GIT Cipolletti". This mismatch has not been resolved.
- The institutional logo comes in light and dark versions. The brand colors come from the logo (blue `#116EB3`, green `#47F54E`) and are already defined in `src/constants/theme.ts`.
- Voice: Rioplatense Spanish with voseo ("Iniciá sesión", "completá todos los campos"). Direct and plain.

## Evidence on Hand

- Logos: `assets/images/logo-light.webp`, `assets/images/logo-dark.webp`. App icons and splash are in `assets/images/` and `assets/expo.icon/`.
- Real institutional contact details, shown in the login footer: Calles Perú y Río Salado, Cipolletti, Río Negro · 0299 477-1976 · direccion@itscipolletti.edu.ar.
- Social links: Instagram, Facebook, YouTube, X. LinkedIn is listed but has no URL.
- There are no usage numbers, testimonials or user research yet. Don't make any up.

## Product Principles

1. **Each role finishes its own job without detours.** Every role gets only its own section and tasks. Students, teachers and academic staff are designed for with the same care.
2. **Attendance data has to be trustworthy.** Saving, correcting and excusing records must be clear and reversible within the allowed window. Failures must never be hidden.
3. **Built for the real classroom.** Taking attendance has to be fast and reliable on a phone, in the middle of a class.
4. **The institute's identity, not a generic template.** The logo, colors and voice belong to ITS Cipolletti.
