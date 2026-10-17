---
description: "Lista de tareas de la función Formato de fin de semana"
---

# Tareas: Formato de fin de semana

**Entrada**: documentos de `/specs/011-fin-de-semana/`

**Requisitos previos**: plan.md ✔, spec.md ✔, research.md ✔, data-model.md ✔, quickstart.md ✔

**Tests**: build + harness + verificación en vivo de una ronda completa acelerada.

## Convención de rutas: src/ (weekend.ts nuevo, types.ts, career.ts, race-builder.ts, race-screen.ts, team-screen.ts, season-screen.ts, main.ts)

---

## Fase 1: Modelo y derivaciones

- [x] T001 `src/types.ts` + `src/weekend.ts` (nuevo): tipo WeekendEvent, orden, distancias (quali 3, sprint ⌈n/4⌉ mín 3), etiquetas, puntos sprint top-8, factor de premios 0,25, riesgo de lluvia por evento (FR-001, FR-003)
- [x] T002 `src/career.ts`: `SeasonResult.event` + migración (sin evento → 'race') + `isSeasonComplete` cuenta solo carreras (FR-006, FR-007)
- [x] T003 `src/weekend.ts`: evento pendiente de la ronda (primer acto sin registrar) y parrilla derivada (quali → ritmo esperado; resto → standings del acto anterior) (FR-002)

## Fase 2: Construcción de carrera y navegación

- [x] T004 `src/race-builder.ts`: `buildRaceStateFromRoster(roster, pista, economía, evento, parrilla?)` con vueltas por evento y parrilla inicial dada (FR-001, FR-002)
- [x] T005 `src/main.ts` + `src/team-screen.ts`: el botón de carrera deriva el evento pendiente y su etiqueta ("Clasificación/Sprint 1/Sprint 2/Carrera · Rn: X") (FR-006)

## Fase 3: Pantalla de carrera

- [x] T006 `src/race-screen.ts`: título con el acto en cabecera; registro por (ronda, evento) con guardia; premios por evento (sprint ×0,25, quali 0); liquidación de patrocinio/gastos SOLO en la carrera; botón "Continuar a {siguiente}" que re-entra al siguiente acto; avance de ronda solo al terminar la carrera (FR-003, FR-004)
- [x] T007 `src/season-screen.ts`: historial con etiqueta ronda+acto (R03·Q/S1/S2 y R03 para la carrera) y total sumando todos los premios (FR-005)

## Fase 4: Verificación

- [x] T008 `npm run build` verde y `npm run harness` sin regresión (motor intacto)
- [x] T009 Verificación en vivo: ronda entera acelerada a 20x — parrillas encadenadas, panel por acto, premios sprint ¼, liquidación única en carrera, avance de ronda al final; historial con los 4 actos (SC-001…SC-003)

---

## Dependencias y orden

- T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009

## Estrategia

Modelo y derivación primero (sin estado redundante), luego la construcción de carrera y por último las pantallas. Verificar una ronda entera en vivo. Commit al final.
