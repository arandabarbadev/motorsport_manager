# Guía de validación: Carrera viva

**Fase 1** · 2026-10-17 · Con el juego en la mano

## Escenarios: "hecho cuando…"

### A. Semáforo (FR-004, SC-003)

1. **Hecho cuando** entro en cualquier acto (p. ej. la Clasificación de la R1): los coches están parados en parrilla y veo el semáforo con luces encendiéndose de una en una.
2. **Hecho cuando** se encienden las 5: tras una pausa corta se apagan todas, aparece "¡Luces fuera!" y SOLO entonces la vuelta 1 y el reloj empiezan a correr.
3. **Hecho cuando** pulso "Repetir {acto}": el semáforo vuelve a empezar desde cero.

### B. Coches vivos (FR-001, FR-002, SC-001)

4. **Hecho cuando** miro la carrera en marcha: los coches van repartidos por el ancho del asfalto y cambian de lado suavemente (nadie teletransporta).
5. **Hecho cuando** dos coches ruedan pegados: se abren a lados opuestos (se ve la batalla).
6. **Hecho cuando** llegan a una curva: los coches se echan hacia el interior.
7. **Hecho cuando** sale bandera amarilla: el campo se ordena más en fila hasta bandera verde.

### C. Accidentes visibles (FR-003, SC-002)

8. **Hecho cuando** ocurre un trompo/choque/avería: el coche destella con anillo y texto flotante en pista.
9. **Hecho cuando** miro "Dirección de carrera" (bajo la tabla): el suceso aparece con su vuelta, junto a adelantamientos y boxes.
10. **Hecho cuando** un coche se accidenta: en pista queda el fantasma apagado y la tabla lo marca DNF; la avería no saca bandera, el choque puede sacar roja.

### D. Lluvia (FR-005, SC-004)

11. **Hecho cuando** se construyen carreras nuevas: la lluvia dinámica aparece en ~1 de cada 4 (25 %), no en ~2 de cada 5 (40 %).

## Resultado esperado

Los 11 puntos en verde (1-10 verificables en vivo por CDP: semáforo por DOM, incidente forzando la tirada, lateral muestreando píxeles del canvas; 11 por el código construido y juego). Fallos → /speckit-converge.
