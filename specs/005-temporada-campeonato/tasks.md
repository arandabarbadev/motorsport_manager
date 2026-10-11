---
description: "Lista de tareas de la función Temporada, calendario y campeonato"
---

# Tareas: Temporada, calendario y campeonato

**Entrada**: documentos de `/specs/005-temporada-campeonato/`

**Requisitos previos**: plan.md ✔, spec.md ✔, research.md ✔, data-model.md ✔, quickstart.md ✔

**Tests**: `npm run tracks` + lectura de código citada + verificación viva. Sin código nuevo.

## Convención de rutas: src/ (tracks-generator.ts, championship.ts, season-screen.ts, team-screen.ts, race-screen.ts, career.ts, main.ts)

---

## Fase 1: Los 20 circuitos

- [x] T001 Correr `npm run tracks`: tabla de 20 GPs (Melbourne→Yas Marina) con vueltas, km, desgaste, boxes y dificultad, sin duplicados y estable entre ejecuciones (SC-001). Mónaco 0,87 de dificultad y 78 vueltas; Monza 0,35 y 53: la personalidad se ve en la propia tabla
- [x] T002 Verificar en `src/tracks-generator.ts:26-46,53-102`: 20 perfiles cuasi reales; generación determinista con ids estables `track-0..19` y calendario por ids; spline + normalización con margen (FR-001, FR-002)
- [x] T003 Verificar en `src/real-layouts.ts` (generado) + `tools/convert-layouts.js` + `data/f1-circuits/`: trazados GPS reales convertidos una vez, dentro del repo (cero dependencia en runtime; nota del Constitution Check III)

## Fase 2: Calendario y progreso

- [x] T004 Verificar en `src/team-screen.ts:179-190`: el botón muestra "Carrera · R{n}: {circuito}" y pasa a "Ver temporada" con la temporada completa (FR-003, FR-008)
- [x] T005 Verificar en `src/race-screen.ts:656-710`: avanza la ronda tras carrera registrada, anuncia el siguiente GP o "Temporada completada" (con acceso al resumen); la última ronda no avanza (FR-003)
- [x] T006 Verificar en `src/main.ts:29-53`: la carrera se construye con el circuito del calendario en curso (respaldo al primero si el id no existe); temporada completa → pantalla de resumen (FR-003, caso límite)

## Fase 3: Campeonato

- [x] T007 Verificar en `src/championship.ts:9-32`: puntuación F1 25-18-15-12-10-8-6-4-2-1 (0 desde el 11º); cada carrera guarda los puntos de los 20 pilotos (FR-004)
- [x] T008 Verificar en `src/championship.ts:34-59` y `src/team-screen.ts:467-530`: tablas de pilotos y constructores recomputadas desde los resultados, ordenadas, con mi equipo resaltado y estado vacío explicativo (FR-005, SC-002)

## Fase 4: Fin de temporada

- [x] T009 Verificar en `src/season-screen.ts:24-69`: resumen por rondas (circuito, mejor puesto, premio), total de premios y presupuesto; título distingue completada/parcial y avisa sin carreras (FR-006, SC-004)
- [x] T010 Verificar en `src/season-screen.ts:72-82`: contador animado del total (~1,6 s, desaceleración) sin librerías (FR-006)
- [x] T011 Verificar en `src/season-screen.ts:89-99`: temporada nueva sube el número, vacía resultados y calendario, y NO toca presupuesto/desarrollos/sede/patrocinadores (FR-007, SC-003)

## Fase 5: Validación en vivo (2026-10-10)

- [x] T012 Botón de carrera vivo: "Carrera · R1: Melbourne" en Mi Equipo con datos sembrados (calendario y circuito de R1 correctos en la carrera abierta: GP Melbourne, Vuelta 1/58)
- [x] T013 Lotería de lluvia verificada en `src/race-builder.ts:14-15,115`: 40 % de las carreras se construyen con clima que puede cambiar; la cabecera avisa "riesgo de lluvia" (supuesto de la spec, visto en quickstart de 002)

---

## Dependencias y orden

- Fases 1-4 por código en paralelo; Fase 5 al final

## Estrategia

Verificar con la tabla impresa de circuitos y el código citado; el flujo completo de 20 rondas queda jugado por Rafa (partidas reales) y el resto comprobado en vivo. No genera cambios.

## Notas

- "Verificar" = leer el código citado, probarlo si hace falta y marcar. No genera cambios.
