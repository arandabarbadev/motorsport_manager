# Guía de validación: Motor de simulación de carrera

**Fase 1** · 2026-10-10 · Con el juego en la mano (o el terminal); ⭐ = código visible

## Escenarios: "hecho cuando…"

### A. La carrera corre sola y termina (FR-001, FR-010, FR-011, SC-001, SC-003)

1. **Hecho cuando** ejecuto `npm run harness`: imprime una carrera completa (40 vueltas, 20 coches) con tabla de posiciones, y la cabecea "493 ticks (x10)" (≤500).
2. **Hecho cuando** miro la última línea del informe: la correlación de Spearman es negativa (p. ej. −0,67): los rápidos acaban delante.
3. **Hecho cuando** miro la columna PITS/PIT LAPS: hay decenas de paradas repartidas en vueltas distintas (p. ej. 35 paradas, de la vuelta 8 a la 37), no todas en la misma.

### B. Ritmo, gomas y clima (FR-002, FR-003, FR-009) ⭐

4. **Hecho cuando** leo `computePace`: 60 % piloto + 40 % coche, penalización por desgaste y clima, ruido por consistencia, suelo de 0,05 (con gomas muertas avanza a rastras).
5. **Hecho cuando** leo `computeWearRate`: blandas ×1,4 / medias ×1,0 / duras ×0,7 / lluvia ×1,1, escalado por pista.
6. **Hecho cuando** leo `maybeWeatherChange`: cambia un paso cada vez y solo si la carrera lo permite.

### C. Rivales que paran (FR-004, FR-005, FR-006) ⭐

7. **Hecho cuando** leo `runPitStopAI` + `computePitScore`: utilidad ponderada, umbral 55, parada forzosa ≥90 % de desgaste, veto <25 % y <3 vueltas, goma equivocada fuerza parada con la goma correcta.
8. **Hecho cuando** leo el arranque de `simulationTick`: la orden encolada se aplica al inicio del tick y la parada ocurre al cruzar meta (`startPitStop`).

### D. Incidentes y banderas (FR-007, FR-008) ⭐

9. **Hecho cuando** leo `runIncidents` y `raiseFlag`: amarilla 25 s al 55 % de ritmo, accidente DNF con roja (25 %) o amarilla, avería según fiabilidad sin bandera, roja congela todo 70 s.
10. **Hecho cuando** en varias ejecuciones del harness: hay carreras con DNF (como la verificada: 1 abandono) y carreras limpias; nunca se cuelga.

## Resultado esperado

Los 10 puntos en verde. El punto 1-3 y 10 con la salida del harness pegada en la verificación de tareas (evidencia, IX); 4-9 con el archivo y línea citados. Fallos → /speckit-converge.
