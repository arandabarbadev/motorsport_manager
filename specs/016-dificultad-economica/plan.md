# Plan 016 — Dificultad económica al crear la partida

## Cambios

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `src/difficulty.ts` (NUEVO) | `Difficulty` = `'easy'\|'normal'\|'hard'`, `DIFFICULTY_ORDER`, `DIFFICULTY_PRESETS` (label, hint, initialBudget, sponsorPayMin/Max, prizeScale), `isDifficulty`, `difficultyOrHard`. Módulo puro. |
| 2 | `src/career.ts` | `CareerState.difficulty: Difficulty`; `createDefaultCareer(budget, difficulty='hard')`; `loadCareer` la rellena con `difficultyOrHard` (migración FR-004); `getOrCreateCareer(fallback, difficulty='hard')`. |
| 3 | `src/roster.ts` | `createDefaultRoster(budget = INITIAL_BUDGET)` (parametriza el dinero del equipo). |
| 4 | `src/sponsors.ts` | `Sponsor.payPerRace` → `payFrac` (0..1); `sponsorPayPerRace(sponsor, difficulty)` redondea a 0,1 M€. Nombres y exigencias intactos. |
| 5 | `src/finance.ts` | `sponsorIncome` cobra con `sponsorPayPerRace(…, career.difficulty)`. |
| 6 | `src/prize-table.ts` | `prizeForPosition(position, scale = 1)` con redondeo entero. |
| 7 | `src/race-screen.ts` | premios con `prizeForPosition(pos, preset.prizeScale)` del career activo. |
| 8 | `src/team-screen.ts` | creación: preset de `getSlotDifficulty(getActiveSlot())`; listado de patrocinios con el pago de SU dificultad; "Reiniciar" mantiene dificultad y usa su presupuesto (texto del confirm dinámico). |
| 9 | `src/slots.ts` | clave local `f1manager:slot-diff` (`{a:'easy',…}`), `getSlotDifficulty` (default `'normal'`) / `setSlotDifficulty`; `deleteSlot` la limpia; `slotSummary` devuelve la dificultad del career. |
| 10 | `src/slots-screen.ts` + `.css` | tarjeta vacía: selector segmentado de 3 botones + hint del preset; tarjeta con contenido: etiqueta de dificultad en el meta. |
| 11 | `src/test-harness.ts` | `difficultySelfCheck`: orden/monotonía de presets, extremos de `sponsorPayPerRace` en las 3 dificultades, escala de premios y default `hard`. |

## Números (los presets)

| | Fácil | Normal | Difícil (= 009) |
|---|---|---|---|
| Presupuesto inicial | 350 M€ | 280 M€ | 200 M€ |
| Pago por carrera (peor→mejor patrocinador) | 0,5 → 5,0 | 0,4 → 4,5 | 0,3 → 3,0 |
| Escala de premios | ×1,5 | ×1,25 | ×1 |

350 y 0,5–5,0 son los valores PRE-009: Fácil recupera la sintonía antigua, Difícil es la vigente, Normal queda en medio. Sueldos, alquiler, costes de desarrollo y exigencias de patrocinadores IGUAL en las tres (la dificultad solo toca las tres palancas de arriba).

## Constitution Check — PASA

- Docs antes que código ✔ · regla VIII sin secretos ✔ · regla IX: build + harness (nuevo `difficultySelfCheck`) + `mm-v016.js` por CDP (crear B en Fácil → 350 M€ y topes de patrocinio; legado A → Difícil sin cambios; etiquetas en las tarjetas) ✔ · regla X carpeta abierta ✔.

## Riesgos y mitigación

- **Cambiar el balance sin querer**: Difícil replica constante a constante los números de 009 (verificado por harness) y la migración fuerza `hard` en guardados previos.
- **La elección pendiente queda huérfana**: `deleteSlot` borra la clave slot-diff de esa ranura.
- **Cloud**: la dificultad viaja dentro del career (nada nuevo que sincronizar); la clave slot-diff es solo local y de un solo uso (se hornea en el career al crear).
