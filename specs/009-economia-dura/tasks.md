---
description: "Lista de tareas de la función Economía dura"
---

# Tareas: Economía dura

**Entrada**: documentos de `/specs/009-economia-dura/`

**Requisitos previos**: plan.md ✔, spec.md ✔, research.md ✔, data-model.md ✔, quickstart.md ✔

**Tests**: build + verificación viva (precios y recuentos leídos del DOM).

## Convención de rutas: src/ (roster.ts, career.ts, sponsors.ts, team-screen.ts)

---

## Fase 1: Constantes

- [x] T001 `src/roster.ts`: INITIAL_BUDGET 200; DEV_MAX_LEVEL 15; helper `devCost(level)` = 15 × (level+1)
- [x] T002 `src/career.ts`: STAFF_MAX_LEVEL 10
- [x] T003 `src/sponsors.ts`: SPONSOR_COUNT 150, MAX_ACTIVE_SPONSORS 8, pagos 0,3-3 M€ (ids 0-99 intactos)

## Fase 2: UI

- [x] T004 `src/team-screen.ts`: botones de desarrollo con precio por nivel (descuento de ingenieros encima); resumen de patrocinadores n/8; texto del reinicio con 200 M

## Fase 3: Verificación

- [x] T005 `npm run build` verde (7,0 s)
- [x] T006 Verificación viva (2026-10-11): partida nueva con **200 M**; precios leídos del DOM **15 → 30 → 45 M€** y nivel **2/15** tras dos compras (200−15−30=155 ✔); sede 1→2 = **30 M€**; **150 filas** de patrocinadores, primera **"3 M€/carrera · exige P1"**, última **"0,3 M€/carrera · exige P20"**, resumen **"0/8 firmados"** (SC-001…SC-004)

---

## Dependencias y orden

- T001-T003 en paralelo → T004 → T005 → T006

## Estrategia

Cambiar constantes, actualizar la UI que las pinta, verificar leyendo los precios del propio juego. Commit al final. ✔ (Nota: un clic del guion de verificación se lo comió la tarjeta de guía de la 008 — el resultado confirma que compras y precios son correctos.)
