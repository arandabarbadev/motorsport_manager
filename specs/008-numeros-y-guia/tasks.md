---
description: "Lista de tareas de la función Dorsales visibles y guía de primera vez"
---

# Tareas: Dorsales visibles y guía de primera vez

**Entrada**: documentos de `/specs/008-numeros-y-guia/`

**Requisitos previos**: plan.md ✔, spec.md ✔, research.md ✔, data-model.md ✔, quickstart.md ✔

**Tests**: build + verificación viva (Chrome headless) con capturas.

## Convención de rutas: src/ (types.ts, roster.ts, race-screen.ts, team-screen.ts, guide.ts nuevo, ui.css)

---

## Fase 1: Dorsales

- [x] T001 `src/types.ts`: campo `number` (1-20) en Driver (FR-003)
- [x] T002 `src/roster.ts`: asignación al crear (jugador 1-2, rivales 3-20) y al regenerar rivales; migración de plantillas viejas por posición en `loadRoster`; también `src/test-grid.ts` y el fallback del motor (FR-003)
- [x] T003 `src/race-screen.ts`: dorsal sobre cada punto (texto claro con contorneado oscuro, escala con el punto; los retirados no) y en cada fila de la clasificación (FR-001, FR-002). Agrandado a r×1,5 tras la primera revisión visual
- [x] T004 `src/race-screen.css`: columna del dorsal en la fila de clasificación

## Fase 2: Guías de primera vez

- [x] T005 `src/guide.ts` (nuevo): tarjeta de guía reutilizable con marca por navegador (`f1manager:tutorial:v1`), un flag por pantalla, botón "Entendido" (FR-004, FR-005)
- [x] T006 `src/ui.css`: estilo de la tarjeta (tema oscuro/claro, no bloqueante, móvil)
- [x] T007 Guías con sus textos del plan en: Mi Equipo (`team-screen.ts`), Carrera/Boxes (`race-screen.ts` al pintar la parrilla) y Patrocinadores (`team-screen.ts` pestaña) (FR-004)

## Fase 3: Verificación

- [x] T008 `npm run build` verde (9,5 s)
- [x] T009 Verificación viva (2026-10-11): guía de equipo visible con SU título y cerrada con "Entendido"; guía propia de patrocinadores y de carrera; **20 dorsales únicos** en la tabla (muestra 15,11,5,13,3,8,7,16); tras recargar ninguna guía vuelve. Capturas mm-008-guia-equipo/carrera y mm-008-dorsales(2).png: dorsales legibles en pista (revisadas con visión) (SC-001, SC-002, SC-003)

---

## Dependencias y orden

- T001 → T002 → T003/T004; T005 → T006 → T007; T008 → T009

## Estrategia

Implementar dorsales (modelo → asignación → pintado) y guías (helper → textos), verificar en vivo con capturas y marcar. Commit al final de la feature. ✔
