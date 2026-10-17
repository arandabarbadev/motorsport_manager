---
description: "Lista de tareas de la función Carrera viva"
---

# Tareas: Carrera viva

**Entrada**: documentos de `/specs/012-carrera-viva/`

**Requisitos previos**: plan.md ✔, spec.md ✔, research.md ✔, data-model.md ✔, quickstart.md ✔

**Tests**: build + harness (con autocomprobación de racing-line) + verificación en vivo por CDP.

## Convención de rutas: src/ (racing-line.ts nuevo, types.ts, simulation.ts, race-builder.ts, race-screen.ts, race-screen.css, test-harness.ts)

---

## Fase 1: Modelo y matemática

- [x] T001 `src/types.ts`: RaceEvent gana `'incident'` + `incidentKind` ('spin' | 'crash' | 'mechanical') (FR-003)
- [x] T002 `src/simulation.ts`: `runIncidents` emite el suceso correspondiente al hacer efecto (trompo → spin, choque → crash, avería → mechanical) (FR-003)
- [x] T003 `src/racing-line.ts` (nuevo): objetivo lateral por coche (batalla a lados opuestos, interior de curva, deriva personal por hash, amarilla ×0,4), suavizado exponencial y acotado a [−1,1] (FR-001, FR-002)
- [x] T004 `src/test-harness.ts`: autocomprobación determinista de racing-line (acotado, abre batallas, converge, respeta amarilla) (FR-001, FR-002)

## Fase 2: Render y animaciones

- [x] T005 `src/race-screen.ts`: pintar los coches con la lateral (normal del sampler, ±34 % del semiancho; parrilla alternando lados; boxes/DNF como ahora), suavizada en el rAF (FR-001, FR-002)
- [x] T006 `src/race-screen.ts` + `src/race-screen.css`: semáforo de 5 luces (650 ms/luz + pausa aleatoria 400–1200 ms) que retiene el tick y el reloj hasta "luces fuera"; se repite en "Repetir {acto}" (FR-004)
- [x] T007 `src/race-screen.ts` + `src/race-screen.css`: incidentes visibles (anillo 1400 ms + texto flotante para TODOS los coches) y feed "Dirección de carrera" (máx 8 líneas: incidentes, adelantamientos, boxes) (FR-003)

## Fase 3: Lluvia y verificación

- [x] T008 `src/race-builder.ts`: RAIN_RACE_CHANCE 0,4 → 0,25 (FR-005)
- [x] T009 `npm run build` verde y `npm run harness` sin regresión (motor intacto + autocomprobación lateral)
- [x] T010 Verificación en vivo (CDP): semáforo completo (luces → fuera → vuelta 1), lateral no nula y variable sobre el canvas, incidente forzado con anillo+texto+feed+bandera, reinicio con semáforo; capturas (SC-001…SC-003)

---

## Dependencias y orden

T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010

## Estrategia

Matemática pura primero (testeable sin DOM), luego el render que la consume, y por último los números sueltos y la verificación en vivo. El motor solo EMITE; nunca cambia posiciones. Commit al final.
