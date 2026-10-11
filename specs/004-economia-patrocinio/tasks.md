---
description: "Lista de tareas de la función Economía, patrocinio y sede"
---

# Tareas: Economía, patrocinio y sede

**Entrada**: documentos de `/specs/004-economia-patrocinio/`

**Requisitos previos**: plan.md ✔, spec.md ✔, research.md ✔, data-model.md ✔, quickstart.md ✔

**Tests**: lectura de código citada + verificación viva (economía sembrada al arrancar). Sin código nuevo.

## Convención de rutas: src/ (career.ts, finance.ts, prize-table.ts, sponsors.ts, team-screen.ts, race-screen.ts)

---

## Fase 1: Premios y balance de carrera

- [x] T001 Verificar en `src/prize-table.ts:8-16`: tabla decreciente 100→1 M€ por posición, pagada a cada uno de mis dos coches (FR-001)
- [x] T002 Verificar en `src/finance.ts:11-13,37-52`: sueldos de pilotos (2×4), alquiler (6) y personal (2 por nivel total); neto = premios + patrocinio − gastos (FR-002)
- [x] T003 Verificar en `src/race-screen.ts:173,646-727`: pago exactamente una vez por carrera (bandera de pantalla), registro único en temporada (guardia `alreadyRecorded`), desglose con signos en el panel, presupuesto actualizado y guardado (FR-001, FR-002, FR-007, SC-002)

## Fase 2: Patrocinadores

- [x] T004 Verificar en `src/sponsors.ts:28-48`: 100 patrocinadores con pago 0,5→5,0 M€ lineal y exigencia P20→P1, generados deterministas (FR-003)
- [x] T005 Verificar en `src/sponsors.ts:57-61`: desbloqueo por mejor resultado de la temporada; sin resultados, solo exigencia P20 (FR-004, SC-003)
- [x] T006 Verificar en `src/team-screen.ts:411-464`: lista mejor pagados primero; botones Firmar/Quitar/Completo/"P{n}" con estados correctos; máximo 5 (FR-003)
- [x] T007 Verificar en `src/finance.ts:26-35`: ingreso = Σ pagos × bonus de comerciales (+5 %/nivel), redondeado a 0,1 (FR-005, parcial)

## Fase 3: Sede

- [x] T008 Verificar en `src/career.ts:16-24,66-68`: tres tipos de personal, nivel 1-5, coste = nivel actual × 30 M€ (FR-005)
- [x] T009 Verificar en `src/team-screen.ts:301-344`: pestaña Sede con nivel, efecto actual por nivel y coste creciente; "MÁX" en el 5; gastos fijos visibles abajo (FR-005)
- [x] T010 Verificar en `src/race-builder.ts:91-98` (mecánicos: −1,5 s/nivel, mínimo 10 s) y `src/team-screen.ts:273` (ingenieros: −5 %/nivel en el coste de desarrollo): los efectos se aplican en sus sitios (FR-005)

## Fase 4: Reinicio y persistencia

- [x] T011 Verificar en `src/team-screen.ts:165-177`: confirmación que enumera lo perdido; `createDefaultCareer` + desarrollos a 0; nombres de equipo/pilotos y rivales intactos (FR-006, SC-004)
- [x] T012 Verificar en `src/career.ts:70-104`: carga con fusión de valores por defecto y migración del patrocinador único a lista (94-98) sin perder presupuesto (FR-008)

## Fase 5: Validación en vivo (2026-10-10, build de producción + Chrome headless)

- [x] T013 Economía sembrada al arrancar: presupuesto 350 M visible en la cabecera de Mi Equipo (estado por defecto de `createDefaultCareer`: personal 1/1/1, sin patrocinadores); el cobro y el desglose al terminar carrera quedan verificados en código (T001-T003) y jugados por Rafa de forma habitual

---

## Dependencias y orden

- Fases 1-4 por código en paralelo; Fase 5 al final

## Estrategia

Verificar en código citando archivo y línea y comprobar el arranque de la economía en vivo (IX). No genera cambios.

## Notas

- "Verificar" = leer el código citado, probarlo si hace falta y marcar. No genera cambios.
