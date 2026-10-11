---
description: "Lista de tareas de la función Motor de simulación de carrera"
---

# Tareas: Motor de simulación de carrera

**Entrada**: documentos de `/specs/001-motor-carrera/`

**Requisitos previos**: plan.md ✔, spec.md ✔, research.md ✔, data-model.md ✔, quickstart.md ✔

**Tests**: banco de pruebas por consola (`npm run harness`) + lectura de código citada. Sin código nuevo.

## Convención de rutas: src/ con el motor en raíz (types.ts, simulation.ts, track-path.ts, rng.ts, test-grid.ts, test-harness.ts)

---

## Fase 1: Validación del motor sin UI

- [x] T001 Correr `npm run harness`: carrera completa de 40 vueltas en 493 ticks (x10) ≤ 500; correlación Spearman −0,67 (negativa: los rápidos delante); 35 paradas de la vuelta 8 a la 37; 1 DNF; los 20 coches clasificados (SC-001, SC-003)

## Fase 2: Verificación de las reglas del ritmo y las gomas

- [x] T002 Verificar en `src/simulation.ts:99` (computePace): 60 % piloto + 40 % coche, penalización de desgaste escalada por pista, penalización de lluvia suavizada por wetSkill, ruido por consistencia, suelo 0,05 (FR-002)
- [x] T003 Verificar en `src/simulation.ts:119` (computeWearRate): blandas 1,4 / medias 1,0 / duras 0,7 / lluvia 1,1 × factor de pista (FR-003)
- [x] T004 Verificar en `src/simulation.ts:242` (maybeWeatherChange): cambio por pasos, solo si `weatherCanChange` (FR-009)
- [x] T005 Verificar en `src/track-path.ts:23-90`: spline Catmull-Rom cerrada con parametrización por longitud de arco (motor sin Canvas: regla nº 1 del plan)

## Fase 3: Verificación de boxes (jugador e IA)

- [x] T006 Verificar en `src/simulation.ts:75-85, 253-278`: cola `queuePitCommand` (ignora duplicadas), pendiente hasta cruzar meta, `startPitStop` detiene el coche el tiempo del callejón o el override del jugador (FR-004)
- [x] T007 Verificar en `src/simulation.ts:129-161` (computePitScore): utilidad ponderada (desgaste +0,9, undercut +0,6, coste −0,4, agresividad +0,3, posición −0,5, riesgo −0,35), umbral 55 (FR-005)
- [x] T008 Verificar en `src/simulation.ts:325-364` (runPitStopAI): forzosa ≥90, vetada <25 y con <3 vueltas, goma errónea obliga y elige seca/lluvia según clima; coches del jugador excluidos (FR-005, FR-006)

## Fase 4: Verificación de incidentes, banderas y fin de carrera

- [x] T009 Verificar en `src/simulation.ts:285-320` (runIncidents/raiseFlag): amarilla 25 s y ritmo ×0,55; accidente DNF con roja (25 %, 70 s, carrera suspendida) o amarilla; avería por fiabilidad sin bandera; escalado por agresividad/riesgo y clima (FR-007)
- [x] T010 Verificar en `src/simulation.ts:166-173, 370-398`: carrera congelada al completar el líder las vueltas (`isRaceFinished`) y posiciones/huecos recalculados cada tick con eventos de adelantamiento (FR-001, FR-008, FR-010)
- [x] T011 Verificar en `src/simulation.ts:175-183`: pausa y fin devuelven sin tocar nada; eventos del tick reemplazados cada vez (FR-008)

---

## Dependencias y orden

- Fase 1 independiente; Fases 2-4 en paralelo tras leer el plan

## Estrategia

Verificar en código citando archivo y línea, validar el conjunto con el harness y pegar la salida como evidencia (IX). No genera cambios.

## Notas

- En el harness los coches del jugador (*) hacen 0 paradas: sin jugador no hay órdenes manuales — esperado, sus paradas son de la spec 002.
- "Verificar" = leer el código citado, probarlo si hace falta y marcar. No genera cambios.
