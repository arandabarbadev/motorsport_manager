# Guía de validación: Temporada, calendario y campeonato

**Fase 1** · 2026-10-10 · Con el juego en la mano (y `npm run tracks` en el terminal)

## Escenarios: "hecho cuando…"

### A. Los 20 circuitos (FR-001, FR-002, SC-001)

1. **Hecho cuando** ejecuto `npm run tracks`: tabla con 20 GPs (Melbourne → Yas Marina), cada uno con vueltas, km, desgaste, boxes y dificultad; sin duplicados; igual en dos ejecuciones seguidas.
2. **Hecho cuando** corro dos circuitos distintos (p. ej. Mónaco y Monza): el trazado, las vueltas y el ritmo de desgaste se notan distintos.

### B. El calendario avanza (FR-003, FR-008)

3. **Hecho cuando** miro el botón de carrera: "Carrera · R1: Melbourne" (ronda y circuito actuales).
4. **Hecho cuando** termino una carrera: el panel anuncia "Siguiente GP: <nombre>" y al volver el botón dice R2.
5. **Hecho cuando** repito una carrera ya registrada: no cobra doble ni salta de ronda extraño (spec 004).

### C. Campeonato (FR-004, FR-005, SC-002)

6. **Hecho cuando** abro "Campeonato" sin carreras: explica que hay que correr, sin tabla vacía.
7. **Hecho cuando** termino dos carreras: las tablas de pilotos y constructores suman los puntos de ambas (cuenta a mano: P1 25 + P2 18…), con mi equipo resaltado y el equipo visible en cada piloto.

### D. Fin de temporada (FR-006, FR-007, SC-003, SC-004)

8. **Hecho cuando** completo la ronda 20: el panel dice "Temporada completada" y el botón lleva al resumen; el botón de carrera pasa a "Ver temporada".
9. **Hecho cuando** abro el resumen: las 20 rondas listadas con circuito, mi mejor puesto y el premio; el total sube animado y coincide con la suma de las filas; presupuesto visible.
10. **Hecho cuando** pulso "Empezar temporada nueva": temporada 2, calendario a R1, campeonato a cero… y presupuesto, mejoras del coche, sede y patrocinadores donde estaban.

## Resultado esperado

Los 10 puntos en verde (1 automatizable con `npm run tracks`; 8-10 requieren una temporada entera o sembrada). Fallos → /speckit-converge.
