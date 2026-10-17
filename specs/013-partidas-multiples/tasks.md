---
description: "Lista de tareas de la función Partidas múltiples"
---

# Tareas: Partidas múltiples

**Entrada**: documentos de `/specs/013-partidas-multiples/`

**Requisitos previos**: plan.md ✔, spec.md ✔, research.md ✔, data-model.md ✔, quickstart.md ✔

**Tests**: build + harness (sin regresión) + verificación en vivo por CDP (crear/renombrar/alternar/borrar y migración v1 sembrada).

## Convención de rutas: src/ (slots.ts, slots-screen.ts y slots-screen.css nuevos; storage-keys.ts, roster.ts, career.ts, cloud.ts, team-screen.ts, main.ts)

---

## Fase 1: Ranuras y migración

- [x] T001 `src/slots.ts` (nuevo): ids A/B/C, activa (`f1manager:active-slot`), nombres (`f1manager:slots-meta`, máx 24, por defecto "Partida N"), claves por ranura, existencia, borrado y `migrateLegacySaves()` (v1 → A moviendo claves, solo si no hay `career:a`) (FR-001, FR-004)
- [x] T002 `src/roster.ts` + `src/career.ts`: guardar/cargar por la clave de la ranura ACTIVA (firmas sin cambios) (FR-001)
- [x] T003 `src/main.ts`: `migrateLegacySaves()` al arrancar, antes de cualquier pantalla (FR-004)

## Fase 2: Pantalla de partidas

- [x] T004 `src/slots-screen.ts` + `src/slots-screen.css` (nuevos): 3 tarjetas con nombre editable, resumen (temporada/ronda/presupuesto o "Vacía"), activa marcada; botones Crear (vacía), Jugar (con contenido) y Borrar con `window.confirm` que nombra la partida; tras borrar la activa, activa = primera con contenido (FR-002, FR-003)
- [x] T005 `src/team-screen.ts` + `src/main.ts`: botón "Partidas" en la cabecera → pantalla de ranuras; Jugar/Crear activan la ranura y vuelven a Mi Equipo cargándola (FR-001, FR-002)

## Fase 3: Nube y verificación

- [x] T006 `src/cloud.ts`: push de `{ slots: {a,b,c: {career, roster, name}}, active }` en `f1manager/{uid}`; pull con migración del formato viejo a la ranura A y recarga única si difiere (FR-005)
- [x] T007 `npm run build` verde y `npm run harness` sin regresión
- [x] T008 Verificación en vivo (CDP): pantalla con 3 tarjetas; crear B (equipo nuevo, 200 M€); renombrar; alternar A↔B sin mezcla (presupuestos distintos sembrados); borrar con confirmación aceptada y rechazada; migración v1 sembrada → ranura A activa sin claves viejas; capturas (SC-001…SC-003)

---

## Dependencias y orden

T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008

## Estrategia

Primero el módulo de ranuras y la migración (sin pantalla: todo el juego ya funciona sobre la activa), luego la pantalla que las gestiona, y al final el sobre de la nube. El contenido de las partidas no se toca. Commit al final.
