---
description: "Lista de tareas de la función Calendario real y circuitos clásicos"
---

# Tareas: Calendario real y circuitos clásicos

**Entrada**: documentos de `/specs/010-calendario-real/`

**Requisitos previos**: plan.md ✔, spec.md ✔, research.md ✔, data-model.md ✔, quickstart.md ✔

**Tests**: `npm run tracks` + `npm run maps` + build + verificación viva con migración sembrada.

## Convención de rutas: tools/convert-layouts.js, data/f1-circuits/, src/ (real-layouts.ts, tracks-generator.ts, career.ts)

---

## Fase 1: Datos de circuitos

- [x] T001 Trazados reales conseguidos: de-1927, pt-1972, za-1961 del repo fuente; fr-1967 (Le Mans) ensamblado de la relación OSM 2725877 (18/18 tramos, 4,32 km) y es-1986 (Jerez) del way cerrado 831985059 (4,33 km)
- [x] T002 `tools/convert-layouts.js`: calendario de 24 rondas en orden real (− Barcelona, + 5) y `src/real-layouts.ts` regenerado (24 trazados)

## Fase 2: Generador e ids estables

- [x] T003 `src/tracks-generator.ts`: 24 perfiles en orden real (tabla del plan) con slugs; ids `gp-<slug>` estables (FR-001, FR-002, FR-003)
- [x] T004 `npm run tracks` verde: 24 rondas Melbourne→Yas Marina en orden real, los 5 nuevos con sus números (Nürburgring 20,8 km y deg 1,35), Cataluña ausente (FR-005, SC-001)

## Fase 3: Migración de partidas

- [x] T005 `src/career.ts`: tabla congelada LEGACY_TRACK_ORDER + `migrateTrackId`; en `loadCareer` se reconstruye el calendario (24), los resultados migran por nombre, se retiran los de circuitos desaparecidos y se reordenan, y la ronda en curso se conserva acotada (FR-004)

## Fase 4: Verificación

- [x] T006 `npm run build` verde (11,0 s)
- [x] T007 Verificación viva (2026-10-11) con partida vieja sembrada (ids `track-N`, presupuesto 512, ronda 10, resultados en Melbourne y Cataluña): migra a calendario de **24 ids** (gp-melbourne…gp-yasmarina), presupuesto **512** intacto, botón **"Carrera · R11: Le Mans"**, resultados solo **[gp-melbourne]** (Cataluña retirada), ronda **10** conservada; la carrera abrió en **Le Mans · Vuelta 1/80** y la captura muestra el Bugatti reconocible (SC-002, SC-003)

---

## Dependencias y orden

- T001 → T002 → T003 → T004; T005 tras T003; T006 → T007

## Estrategia

Datos → generador → migración, verificar con la tabla impresa y una partida vieja sembrada. Commit al final. ✔
