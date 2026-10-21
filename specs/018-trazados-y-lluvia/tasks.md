---
description: "Lista de tareas de la función Trazados reales legibles y lluvia jugable"
---

# Tareas: Trazados reales legibles y lluvia jugable

**Entrada**: documentos de `/specs/018-trazados-y-lluvia/`

**Requisitos previos**: spec.md ✔, plan.md ✔, research.md ✔, data-model.md ✔, quickstart.md ✔

**Tests**: build + harness (con checks nuevos) + verificación en vivo por CDP (`mm-v018.js`).

## Convención de rutas: src/ y tools/

---

## Fase 1: Trazados (Jerez real + calendario 20)

- [x] T001 `tools/assemble-jerez.js` + `data/f1-circuits/es-1986.geojson` regenerado (lazo 4,426 km) (FR-001)
- [x] T002 `tools/convert-layouts.js` CALENDAR a 20 + regenerar `src/real-layouts.ts` + `src/tracks-generator.ts` TRACK_PROFILES a 20 (FR-002)
- [x] T003 `src/career.ts` filtro de resultados retirados + `src/slots.ts` rounds 20 (FR-003)

## Fase 2: Pista legible

- [x] T004 `src/tracks-generator.ts` declash determinista (target 0,078) (FR-005)
- [x] T005 `src/race-screen.ts` 3 trazos + carretera 0,06; `src/ui.css` --track-halo (FR-004, FR-005)

## Fase 3: Lluvia jugable

- [x] T006 `src/types.ts` inter + `src/simulation.ts` tablas compound×tiempo (pace/wear) y IA por conjuntos (FR-006, FR-007)
- [x] T007 `src/race-screen.ts` label/botón I + aviso de cambio de tiempo (hub 017); `src/race-screen.css` .tyre.inter (FR-006, FR-008)

## Fase 4: Verificación

- [x] T008 `src/test-harness.ts`: Tracks check + Weather check; `npm run build` y `npm run harness` verdes
- [x] T009 Verificación en vivo `mm-v018.js`: Jerez+borde blanco por píxeles, canal en Singapur, botón I, aviso de lluvia real, migración de save con gp-kyalami (SC-001..SC-004)

## Fase 5: Cierre

- [x] T010 Mapas ASCII de los 20 revisados (sin deformaciones graves), requisitos [x], commit, push, deploy verificado, memoria

---

## Dependencias y orden

T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010

## Estrategia

Primero los datos (trazado de Jerez y calendario, con evidencia ASCII/km), luego el render
genérico (borde + descolisión beneficia a todos los urbanos), después la lluvia sobre el
hub 017, y al final la verificación en vivo por píxeles/DOM (nunca por "vista").
