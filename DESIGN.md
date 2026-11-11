---
name: Gits
description: Institutional course and attendance app for ITS Cipolletti — square, bordered, record-like.
colors:
  azul-patagonico: "#116EB3"
  verde-valle: "#47F54E"
  rojo-alerta: "#EF4444"
  arena-sol: "#CCC7A9"
  papel: "#FFFFFF"
  papel-tarjeta: "#F5F5F5"
  papel-campo: "#F0F0F0"
  tinta: "#111111"
  tinta-suave: "#666666"
  linea-clara: "rgba(0,0,0,0.05)"
  noche: "#000000"
  noche-tarjeta: "#1A1A1A"
  noche-campo: "#222222"
  tiza: "#FFFFFF"
  tiza-suave: "#A0A0A0"
  linea-oscura: "rgba(255,255,255,0.08)"
  exito-claro: "#16A34A"
  aviso-claro: "#D97706"
  aviso-oscuro: "#FBBF24"
  azul-velo-claro: "rgba(17,110,179,0.10)"
  azul-velo-oscuro: "rgba(17,110,179,0.25)"
  rojo-velo-claro: "rgba(239,68,68,0.10)"
  rojo-velo-oscuro: "rgba(239,68,68,0.18)"
  asistencia-presente: "#15803D"
  asistencia-ausente: "#DC2626"
  asistencia-tarde: "#B45309"
  asistencia-justificado: "#2563EB"
typography:
  display:
    fontFamily: "system-ui, -apple-system, Roboto, sans-serif"
    fontSize: "36px"
    fontWeight: 700
  headline:
    fontFamily: "system-ui, -apple-system, Roboto, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    letterSpacing: "-0.3px"
  title:
    fontFamily: "system-ui, -apple-system, Roboto, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    letterSpacing: "-0.2px"
  body:
    fontFamily: "system-ui, -apple-system, Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 400
  body-sm:
    fontFamily: "system-ui, -apple-system, Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 600
  button:
    fontFamily: "system-ui, -apple-system, Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 600
  label:
    fontFamily: "system-ui, -apple-system, Roboto, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    letterSpacing: "0.8px"
  mono:
    fontFamily: "Menlo, monospace"
    fontSize: "12px"
    fontWeight: 700
rounded:
  none: "0px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    textColor: "{colors.papel}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    height: "52px"
    padding: "0 16px"
  button-secondary:
    backgroundColor: "{colors.azul-patagonico}"
    textColor: "{colors.papel}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    height: "52px"
    padding: "0 16px"
  button-danger:
    backgroundColor: "{colors.rojo-alerta}"
    textColor: "{colors.papel}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    height: "52px"
    padding: "0 16px"
  button-outline:
    textColor: "{colors.azul-patagonico}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    height: "52px"
    padding: "0 16px"
  header-button:
    backgroundColor: "{colors.azul-velo-claro}"
    textColor: "{colors.azul-patagonico}"
    rounded: "{rounded.none}"
    padding: "7px 12px"
  header-button-danger:
    backgroundColor: "{colors.rojo-velo-claro}"
    textColor: "{colors.rojo-alerta}"
    rounded: "{rounded.none}"
    padding: "7px 12px"
  input:
    backgroundColor: "{colors.papel-campo}"
    textColor: "{colors.tinta}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    height: "52px"
    padding: "0 16px"
  card:
    backgroundColor: "{colors.papel-tarjeta}"
    rounded: "{rounded.none}"
    padding: "16px"
  code-badge:
    backgroundColor: "{colors.azul-velo-claro}"
    textColor: "{colors.azul-patagonico}"
    rounded: "{rounded.none}"
    padding: "2px 8px"
  meta-tag:
    backgroundColor: "{colors.papel-campo}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.none}"
    padding: "5px 10px"
  attendance-toggle:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta-suave}"
    rounded: "{rounded.none}"
    size: "44px"
  attendance-toggle-present:
    backgroundColor: "{colors.asistencia-presente}"
    textColor: "{colors.papel}"
    rounded: "{rounded.none}"
    size: "44px"
  sign-badge:
    backgroundColor: "{colors.azul-velo-claro}"
    textColor: "{colors.azul-patagonico}"
    rounded: "{rounded.pill}"
    padding: "12px 32px"
---

# Design System: Gits

## Overview

**Creative North Star: "La Libreta Institucional"**

Gits looks like ITS Cipolletti's own paperwork: the student record book (libreta), the ID card (carnet), the class register. Each piece of data has its own box. Panels have square corners and a hairline border, and they sit flat on a plain white or pure black background. A small uppercase label tags each panel, like the printed heading on a form. A blue stripe down the left edge marks the record you're looking at. The student credential has a blue header, a tagged photo box and a barcode drawn in brand blue. It is the clearest example of the whole system.

The interface is precise but not cramped. Panels are medium density, with 16px padding inside and 10px gaps between them. Content sits in a single column capped at 600px, so on a tablet or in the browser it reads as a form, not a stretched-out dashboard. The brand appears in only two places: Azul Patagónico carries the identity, and the Azul Patagónico → Verde Valle gradient marks the primary action. Light and dark mode are equally important. Dark mode is pure black with charcoal cards, not a dimmed version of the light theme.

The components should feel firm and orderly: straight edges, visible borders, a clear response when pressed, and nothing decorative. The system rejects the generic template-app look (rounded cards with soft shadows and gradients everywhere) and anything toy-like or childish (loud colours, illustrations, emoji, constant motion).

**Key Characteristics:**
- Square corners by default. The rounded pill is a deliberate, rare exception.
- Flat panels separated by a 1px border and tonal steps, not shadows.
- A 4px Azul Patagónico stripe on the left edge marks the main record on a screen.
- Uppercase micro-labels (10–12px, bold, tracked) head every data group.
- The system font (San Francisco, Roboto, system-ui) at bold weights. No custom fonts.
- The gradient appears only on primary-action buttons.
- Light and dark mode treated as equals, with pure white and pure black backgrounds.

## Colors

Two institutional colours on neutral paper. Azul Patagónico does almost all of the work, and Verde Valle shows up only as the end of the gradient and as the success colour in dark mode.

### Primary
- **Azul Patagónico** (#116EB3): The institute's identity. Used for header tint and back arrows, links ("¿Olvidaste tu contraseña?", "Consultar asistencias"), focused input borders, the left stripe on record cards, the credential header, the barcode, the flat secondary button and the outline button. Its translucent fill (Azul Velo: 10% in light mode, 25% in dark) sits behind subject-code badges and header buttons.

### Secondary
- **Verde Valle** (#47F54E): A bright, electric lime that comes from the logo. It is the end colour of the primary-action gradient. In dark mode it is also the success colour (active-status dots, the moon icon in the theme switch). Light mode uses the deeper **Éxito** green (#16A34A) for success instead, because Verde Valle doesn't stand out against white.

### Tertiary
- **Rojo Alerta** (#EF4444): Errors, the danger button, the SALIR header button, input error borders, and error banners (Rojo Velo fill, with a 4px red left stripe).
- **Aviso** (#D97706 in light mode, #FBBF24 in dark): Warning states.
- **Arena Sol** (#CCC7A9): Used in one place only: the sun icon in the login theme switch.

### Neutral
- **Papel / Noche** (#FFFFFF / #000000): Screen backgrounds, and the header background, which blends into the screen without a shadow.
- **Papel Tarjeta / Noche Tarjeta** (#F5F5F5 / #1A1A1A): Card and panel surfaces, one tonal step above the background.
- **Papel Campo / Noche Campo** (#F0F0F0 / #222222): Input fields and meta tags (COMISIÓN, TURNO, CICLO), a second tonal step.
- **Tinta / Tiza** (#111111 / #FFFFFF): Main text.
- **Tinta Suave / Tiza Suave** (#666666 / #A0A0A0): Secondary text, micro-labels, placeholders, footer icons.
- **Línea Clara / Línea Oscura** (5% black / 8% white): The hairline border around every panel and input, and row dividers.

### Attendance palette
A separate palette that only P / A / T / J use (the selector and the live summary). It is not interchangeable with the app's state colours.
- **Presente** (#15803D) · **Ausente** (#DC2626) · **Tarde** (#B45309) · **Justificado** (#2563EB), all with white letters (≥4.8:1). The filled tiles stay ≥3.3:1 against dark cards, so the same four colours work in both modes.

### Named Rules
**The One Gradient Rule.** The Azul Patagónico → Verde Valle gradient belongs only to primary-action buttons ("Ingresar", "Guardar y Cerrar Clase"). Aim for one per visible screen; use secondary or outline for any others. It never goes on backgrounds, cards, headers or decoration.

**The Attendance Code Rule.** P / A / T / J always use their own fixed palette, the same in light and dark mode. The theme's success, warning and danger colours never stand in for an attendance status, and attendance colours never stand in for general states.

## Typography

**Display / Body Font:** The platform system font (San Francisco on iOS, Roboto on Android, system-ui on the web).
**Mono Font:** Menlo / monospace, only for generated credentials and codes on the academic panel.

**Character:** One system typeface. Hierarchy comes from weight, size and tracking, not from pairing fonts. Bold (700) is the default weight for anything that is a label or a value. Regular weight is kept for running descriptions.

### Hierarchy
- **Display** (700, 36px): The one large figure on a screen, such as the attendance percentage in the student's history.
- **Headline** (700, 22px, −0.3px tracking): Greetings and screen titles ("Tomar asistencia", the student or teacher name on their home screen). Section headers on detail screens use 20px.
- **Title** (700, 17px, −0.2px tracking): Card titles (subject name) and the header bar title.
- **Body** (400, 15px): Inputs, descriptions, feedback messages.
- **Body small** (600, 13px): Link-style actions, field labels, error captions.
- **Button** (600, 16px): Button labels: short verb phrases ("Ingresar", "Inscribir en Comisión").
- **Label** (700, 10–12px, 0.5–1.5px tracking, uppercase): The voice of the record. Form headings (RESUMEN DE ASISTENCIA EN VIVO, COMISIÓN, TURNO, LEGAJO), header buttons (PERFIL, SALIR), badge text.

### Named Rules
**The Printed Heading Rule.** Every group of data is introduced by an uppercase, bold, tracked label in Tinta Suave, the way a form prints its field names. The value under it is bold Tinta.

## Layout

The layout is a single column for the phone. `Screen` applies 16px padding, keeps the content clear of safe areas (left, right, bottom; the stack header covers the top) and caps the width at 600px, centred, on tablets and the web. The login uses 24px side margins (16px under 360px), centres a 320px form, and on screens wider than 768px puts the form in a 500px card with 48px padding.

Spacing follows the theme scale (6 / 10 / 16 / 24 / 32). Panels stack with 10px between them, related blocks with 16px. Inside a panel, a header row is separated from its content by a hairline and 6px of bottom padding. Lists end with 32px of bottom padding so the last row isn't stuck to the edge.

Tap targets: buttons and inputs are 52px tall. Attendance toggles and the quick actions (TODOS PRESENTES / AUSENTES) are at least 44px. Below a 380px-wide window, the four P / A / T / J toggles drop onto their own row under the student's name and share the full width. From 380px up they sit to the right of the name. Student names wrap to two lines instead of being cut off.

## Elevation & Depth

The system is flat. Depth comes from tonal steps (background → card → field), each with a hairline border. The stack header has no shadow and shares the screen's background colour.

### Shadow Vocabulary
- **Login card lift** (`shadowOffset 0 10, opacity 0.1, radius 20; elevation 10`): Only on the login card on screens wider than 768px.
- **Badge glow** (`Azul Patagónico shadow, offset 0 6, opacity 0.35, radius 16; elevation 6`): The hover state of the "Iniciá sesión" badge on the web.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. A shadow is allowed only on a single highlight element per screen. It is never applied to lists, cards or rows as a habit.

## Shapes

Every corner is square (0px). The theme deliberately has no radius scale. Edges are drawn with 1px hairline borders. Emphasis comes from a 4px left stripe (Azul Patagónico for records, Rojo Alerta for error banners) or a 2px Azul Patagónico frame (the credential photo box). Status dots are 6px squares, not circles.

The one rounded form is the **pill** (999px) of the "Iniciá sesión" badge: a 2px Azul Patagónico outline around an Azul Velo fill.

### Named Rules
**The Square Record Rule.** Corners are square. The pill is allowed only on a single highlight element per screen (a heading badge, never a button, input or card), so it stays rare and keeps standing out.

## Components

### Buttons
Firm, full-width rectangles.
- **Shape:** Square (0px), 52px tall, 16px horizontal padding, 8px gap when there's an icon to the left of the label.
- **Primary:** The horizontal Azul Patagónico → Verde Valle gradient with a white 16px/600 label. It is the default `AppButton` variant; aim for one per visible screen.
- **Secondary:** Flat Azul Patagónico with a white label.
- **Danger:** Flat Rojo Alerta with a white label.
- **Outline:** Transparent, with a 1.5px Azul Patagónico border and an Azul Patagónico label.
- **Pressed / Disabled:** Opacity drops to 0.9 while pressed and to 0.6 when disabled. On the login, the label changes to the in-progress form ("Ingresando...").

### Header Button
- **Style:** A small square chip on the right of the stack header: a 14px Ionicon and an 11px/700 uppercase label with 0.4px tracking, on an Azul Velo fill (PERFIL). The danger variant uses Rojo Velo (SALIR). Padding is 7×12px, with a 6px hit slop.

### Cards / Containers
- **Corner Style:** Square.
- **Background:** Papel Tarjeta / Noche Tarjeta.
- **Shadow Strategy:** None (see Elevation & Depth).
- **Border:** A 1px hairline. Record cards add a 4px Azul Patagónico left stripe.
- **Internal Padding:** 16px. 10px gap between cards. Opacity drops to 0.85 while pressed.

### Inputs / Fields
- **Style:** Papel Campo / Noche Campo fill, 1px hairline border, square, 52px tall, 16px padding, 15px text. Placeholders and labels use Tinta Suave, with labels at 13px/600 above the field.
- **Focus:** The border turns Azul Patagónico.
- **Error:** The border turns Rojo Alerta, with a 13px Rojo Alerta caption underneath.

### Chips / Tags
- **Code badge:** The subject code on an Azul Velo fill, in Azul Patagónico 11px/700 uppercase with 0.6px tracking, padding 2×8px.
- **Meta tag:** A label–value pair on a Papel Campo fill (a 10px uppercase label followed by a 12px/700 value), padding 5×10px.
- **Status badge:** A 6px square dot in the success colour next to a 10px/700 label, on a field-coloured fill with a hairline border.

### Navigation
- **Style:** A native stack header for each role, using the screen's background colour with no shadow. The title is 17px/700 Tinta. The back arrow is tinted Azul Patagónico and labelled "Volver". The header button sits on the right. There are no tab bars, except the academic panel's four in-screen tabs.

### Attendance Selector (signature)
The tool a teacher uses in class: four toggles of at least 44px in a row (P / A / T / J), 4px apart, using the stacked full-width layout on narrow phones (see Layout). When unselected, a toggle has the background fill, a 1px Tinta Suave border (visible at ≥3:1) and a Tinta Suave 13px/700 letter. When selected, it fills with its attendance colour and the letter turns white. Screen readers treat it as a radio group named after the student ("Presente, Pérez, Juan"). The quick actions reuse the same colours as a 10px square swatch next to a Tinta label.

### Live Attendance Summary (signature)
A card headed RESUMEN DE ASISTENCIA EN VIVO with the student total on the right, above a hairline. Below are four columns, each with a count (13px/700, tabular figures) in a square badge filled with its attendance colour and a 10px uppercase label underneath. Screen readers read the whole card as one sentence.

### Student Credential (signature)
The ID card: an Azul Patagónico header band with the institution name in white micro-labels and a translucent year badge. Below it, a 64×72px photo box with a 2px Azul Patagónico frame and an Azul Patagónico caption strip, the name at 18px/700, the student record number (legajo) in Azul Patagónico with 0.8px tracking, a table of label–value rows on the background colour, and a barcode drawn in Azul Patagónico bars with a 10px tracked code underneath.

### Sign Badge (login only, by current use)
The "Iniciá sesión" pill: 2px Azul Patagónico outline, Azul Velo fill, 20px/700 Azul Patagónico text, padding 12×32px. It is a heading, not a button, so on the web the cursor doesn't change to a pointer. On hover it gets a darker fill and the blue badge glow.

## Do's and Don'ts

### Do:
- **Do** keep every corner square (0px), and give every panel and input a 1px hairline border (Línea Clara / Línea Oscura).
- **Do** put an uppercase, bold, tracked label (10–12px, Tinta Suave) above each group of data.
- **Do** mark the main record on a screen with a 4px Azul Patagónico left stripe, and error banners with a 4px Rojo Alerta stripe.
- **Do** build depth from tonal steps: background → card (#F5F5F5 / #1A1A1A) → field (#F0F0F0 / #222222).
- **Do** use `useAppTheme()` / `makeStyles()` and the tokens in `src/constants/theme.ts`, and check every screen in both light and dark mode.
- **Do** keep buttons and inputs 52px tall, and attendance toggles and quick actions at least 44px. Use `minHeight` / `minWidth` so they grow with the system font size.
- **Do** use the `Screen` container so content stays within 600px and clear of the safe areas.

### Don't:
- **Don't** make it look like a generic template app: no rounded cards with soft shadows, no gradients on surfaces.
- **Don't** make it look toy-like or childish: no loud colours, illustrations, emoji or constant motion.
- **Don't** use the Azul Patagónico → Verde Valle gradient for anything except primary-action buttons.
- **Don't** use more than one pill shape or one shadowed element per screen, and never on buttons, inputs or list cards.
- **Don't** put white text on flat Verde Valle (#47F54E); the contrast is about 1.5:1. In light mode, use Éxito (#16A34A) for success.
- **Don't** mix the attendance palette with the app's state colours.
- **Don't** add custom fonts or a radius scale to the theme.
