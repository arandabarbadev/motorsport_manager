---
description: "Lista de tareas de la función Dorsal en el coche y goma propia"
---

# Tareas: Dorsal en el coche y goma propia

**Entrada**: documentos de `/specs/015-dorsal-y-goma/`

**Requisitos previos**: spec.md ✔, plan.md ✔, research.md ✔, data-model.md ✔, quickstart.md ✔

**Tests**: build + harness (sin regresión) + verificación en vivo por CDP (píxeles del dorsal en parrilla, DOM de tabla y boxes, ambos temas).

## Convención de rutas: src/ (race-screen.ts, race-screen.css)

---

## Fase 1: El dorsal entra en el círculo

- [x] T001 `src/race-screen.ts`: radio mínimo del coche 4→7 px; dorsal centrado en el círculo con fuente `max(9, rr·1,05)` y contorno oscuro; eliminada la posición elevada (FR-001)
- [x] T002 `src/race-screen.ts`: bugfix drawCars — el DNF usa `continue` en vez de `return` (FR-004)

## Fase 2: Goma propia

- [x] T003 `src/race-screen.ts`: filas de rivales sin goma/desgaste (clase `no-tyre`, celdas vacías, hueco reservado); solo el jugador los recibe (FR-002)
- [x] T004 `src/race-screen.ts` + `src/race-screen.css`: línea `.pit-tyre` en cada box con compuesto, barra y %; refresco en `updateHud` (FR-003)
- [x] T005 `src/race-screen.ts`: guía de primera visita actualizada

## Fase 3: Verificación y cierre

- [x] T006 `npm run build` verde y `npm run harness` sin regresión
- [x] T007 Verificación en vivo (CDP, `mm-v015.js`): parrilla con dorsales dentro y nada encima; 18 filas de rivales sin goma; boxes con goma actual creciendo; capturas en ambos temas (SC-001, SC-002, SC-003)
- [x] T008 Marcar requisitos y commit de la función

---

## Dependencias y orden

T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008

## Estrategia

Primero el dorsal (y de paso el bugfix del `return`, que es una línea), luego la goma propia en tabla y boxes, y al final la verificación por píxeles y DOM. El motor no se toca.
