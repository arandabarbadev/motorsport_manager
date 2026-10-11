# Guía de validación: Calendario real y circuitos clásicos

**Fase 1** · 2026-10-11 · Con el juego en la mano (y `npm run tracks` en el terminal)

## Escenarios: "hecho cuando…"

### A. El calendario (FR-001, FR-002, FR-005, SC-001, SC-003)

1. **Hecho cuando** ejecuto `npm run tracks`: 24 rondas, de Melbourne a Yas Marina en orden real; los 5 nuevos presentes con sus números propios; Cataluña ausente; igual en dos ejecuciones.
2. **Hecho cuando** ejecuto `npm run maps`: los 24 trazados se dibujan; la serpiente del Nürburgring y el Bugatti de Le Mans se reconocen.

### B. Jugar los nuevos (FR-002)

3. **Hecho cuando** entro en una carrera de Nürburgring: trazado larguísimo y las gomas cayendo más rápido que en ningún otro circuito.
4. **Hecho cuando** entro en Le Mans, Estoril, Jerez o Kyalami: cada uno con su forma y su nombre en cabecera.

### C. Migración (FR-003, FR-004, SC-002)

5. **Hecho cuando** abro una partida guardada de antes del cambio: el botón de carrera apunta a la ronda conservada, el presupuesto y las tablas de campeonato siguen intactos, y en el historial de temporada no aparece Cataluña.
6. **Hecho cuando** termino la ronda en curso: el calendario avanza con normalidad por las 24 rondas.

## Resultado esperado

Los 6 puntos en verde (1-2 automatizados; 3-6 en vivo con partida sembrada). Fallos → /speckit-converge.
