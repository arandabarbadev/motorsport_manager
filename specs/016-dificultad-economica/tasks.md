---
description: "Lista de tareas de la función Dificultad económica al crear la partida"
---

# Tareas: Dificultad económica al crear la partida

**Entrada**: documentos de `/specs/016-dificultad-economica/`

**Requisitos previos**: spec.md ✔, plan.md ✔, research.md ✔, data-model.md ✔, quickstart.md ✔

**Tests**: build + harness (difficultySelfCheck) + verificación en vivo por CDP (`mm-v016.js`: crear en Fácil, legado en Difícil, etiquetas).

## Convención de rutas: src/ (difficulty.ts nuevo; career/roster/sponsors/finance/prize-table/race-screen/team-screen/slots/slots-screen/test-harness)

---

## Fase 1: El módulo de presets

- [x] T001 `src/difficulty.ts`: tipo, orden, presets (label/hint/números), `isDifficulty`, `difficultyOrHard` (FR-001)
- [x] T002 `src/prize-table.ts`: `prizeForPosition(position, scale=1)` con redondeo (FR-003)
- [x] T003 `src/sponsors.ts`: `payFrac` + `sponsorPayPerRace(sponsor, difficulty)` (FR-003)

## Fase 2: La dificultad vive en la partida

- [x] T004 `src/career.ts`: `CareerState.difficulty`, creación con dificultad y migración `difficultyOrHard` (FR-002, FR-004)
- [x] T005 `src/roster.ts` + `src/finance.ts` + `src/race-screen.ts`: presupuesto parametrizado, cobro y premios con el preset del career (FR-003)
- [x] T006 `src/slots.ts`: clave slot-diff (get/set, default normal, limpieza al borrar) + dificultad en `slotSummary` (FR-002, FR-006)

## Fase 3: UI

- [x] T007 `src/slots-screen.ts` + `.css`: selector segmentado + hint en tarjetas vacías, etiqueta en tarjetas con contenido (FR-002, FR-006)
- [x] T008 `src/team-screen.ts`: crear con el preset de la ranura; patrocinios con su pago; Reiniciar mantiene dificultad con texto dinámico (FR-003, FR-005)

## Fase 4: Verificación y cierre

- [x] T009 `src/test-harness.ts`: difficultySelfCheck (monotonía, extremos, escala de premios, default hard)
- [x] T010 `npm run build` + `npm run harness` verdes
- [x] T011 Verificación en vivo `mm-v016.js`: B en Fácil (350 M€, tope 5,0 M€, career con "difficulty":"easy"), A legado en Difícil (tope 3,0 M€, etiqueta), tarjetas con etiquetas, capturas (SC-001, SC-002, SC-004)
- [x] T012 Marcar requisitos y commit de la función

---

## Dependencias y orden

T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011 → T012

## Estrategia

Primero el módulo puro con sus números, luego engancharlo al estado persistido (career), después la UI que lo elige y lo enseña, y al final harness + verificación en vivo. Difícil replica 009 constante a constante.
