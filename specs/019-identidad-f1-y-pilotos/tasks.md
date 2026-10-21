---
description: "Lista de tareas de la función Identidad F1 y mejora de pilotos"
---

# Tareas: Identidad F1 y mejora de pilotos

**Entrada**: documentos de `/specs/019-identidad-f1-y-pilotos/`

**Requisitos previos**: spec.md ✔, plan.md ✔, research.md ✔, data-model.md ✔, quickstart.md ✔

**Tests**: build + harness (checks nuevos) + verificación en vivo por CDP (`mm-v019.js`).

## Convención de rutas: src/ y tools/

---

## Fase 1: Sistema visual

- [x] T001 Fuentes locales (`src/fonts/` ya descargadas) + `@font-face` en `ui.css` + tabulares globales (FR-006)
- [x] T002 `ui.css`: tokens carbón neutros, `--accent` derivados por color-mix, `--tyre-*`, radios touch/data, botón primario con acento (FR-003, FR-004, FR-005, FR-007)
- [x] T003 Hojas de pantalla (team/race/slots/season/auth): radios, sin mayúsculas, gomas por variables, `.pos` con fuente display (FR-004, FR-006, FR-007, FR-008)

## Fase 2: Acento dinámico

- [x] T004 `src/accent.ts` (applyTeamAccent + contraste por luminancia) + llamadas en `main.ts` arranque y team-screen (montaje + color en vivo) + `theme-color` de index.html (FR-003)

## Fase 3: Datos de pilotos

- [x] T005 `types.ts` Driver.experience/training + `roster.ts` (PILOT_ATTRS, coste, driverVal, setDriverNumber, migración) + `simulation.ts` riesgo con experiencia + `test-grid.ts` (FR-002, FR-009, FR-010)

## Fase 4: UI

- [x] T006 team-screen: pestaña Pilotos (4 atributos, val, compra) + inputs de dorsal + val en línea de rivales (FR-002, FR-009)
- [x] T007 race-screen: posición a la izquierda de la goma en Mis boxes (FR-001)

## Fase 5: Verificación y cierre

- [x] T008 `test-harness.ts`: Pilotos check (compra/coste/val/tope) + Dorsales check (duplicado rechazado); `npm run build` y `npm run harness` verdes
- [x] T009 Verificación en vivo `mm-v019.js`: acento, gomas, radios, mayúsculas, fuentes, posición en boxes, dorsales, compra en Pilotos (SC-001..SC-006)
- [x] T010 Requisitos [x], commit, push, deploy verificado (bundle con constantes nuevas), memoria

---

## Dependencias y orden

T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010

(T005 no depende del CSS: T004 y T005 pueden alternarse; el orden lineal
es el de revisión, no el de ejecución estricta.)

## Estrategia

Primero el sistema visual (tokens en un solo archivo, pantallas solo
consumen), luego el acento dinámico que vive encima, después los datos
(migración gratis) y la UI que los enseña, y al final la verificación por
evidencias: computed styles del DOM, no capturas "a ojo".
