# Guía de validación: Mi Equipo y la parrilla de rivales

**Fase 1** · 2026-10-10 · Con el juego en la mano

## Escenarios: "hecho cuando…"

### A. Mi identidad (FR-001, SC-001)

1. **Hecho cuando** escribo nombre de equipo, color y los dos pilotos en "Mi Equipo" y recargo: todo sigue ahí.
2. **Hecho cuando** vacío un nombre y salgo del campo: vuelve el valor anterior.
3. **Hecho cuando** entro en una carrera: mis dos coches llevan mi color y borde dorado, y la tabla dice "(tú)".

### B. Desarrollo del coche (FR-002, FR-003, FR-004, SC-002)

4. **Hecho cuando** compro "+1 · X M€" en una categoría: el nivel sube (p. ej. 0/10 → 1/10) y el presupuesto baja lo mismo.
5. **Hecho cuando** llego a nivel 10: el botón dice "MÁX" y no compra más.
6. **Hecho cuando** el presupuesto no llega: el botón está deshabilitado.
7. **Hecho cuando** corro con varias mejoras compradas: salgo más arriba en la parrilla que con la partida recién creada (FR-008).

### C. Rivales (FR-005, FR-006, FR-007, SC-003)

8. **Hecho cuando** abro "Rivales": 9 equipos con color, nombre, 2 pilotos y medias de coche ("A 72 · M 70 · C 74").
9. **Hecho cuando** pulso "Generar parrilla nueva": sale la confirmación avisando de que se pierden los nombres editados de rivales.
10. **Hecho cuando** acepto: nombres y números nuevos; mi equipo, mis pilotos, mis desarrollos y mi presupuesto intactos.
11. **Hecho cuando** edito el nombre de un equipo o piloto rival y recargo: sigue editado.

### D. Robustez (FR-009)

12. **Hecho cuando** corrompo el guardado (borrar la clave de plantilla) y recargo: parrilla nueva; el presupuesto de la carrera (spec 004) sigue en su sitio.

## Resultado esperado

Los 12 puntos en verde. Fallos → /speckit-converge.
