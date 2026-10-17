# Guía de validación: Asfalto libre

**Fase 1** · 2026-10-17 · Con el juego en la mano

## Escenarios: "hecho cuando…"

### A. Sin raíl (FR-001, SC-001)

1. **Hecho cuando** entro en un evento y miro el circuito (oscuro): no hay línea central recorriendo el trazado; solo borde, asfalto y línea de meta.
2. **Hecho cuando** cambio a tema claro: tampoco hay línea central.
3. **Hecho cuando** paso por meta: la línea de meta sigue en su sitio (no era parte del problema).

### B. Toda la pista (FR-002, FR-003, SC-002)

4. **Hecho cuando** miro la carrera en marcha: los coches van repartidos de borde a borde y en recta deriva de lado a lado (nadie vuelve al eje).
5. **Hecho cuando** llegan a una curva: se echan claramente al interior, hasta cerca del borde.
6. **Hecho cuando** dos coches ruedan juntos: se abren a lados opuestos ocupando casi el ancho entre ambos (y la parrilla sigue a dos columnas, ahora más anchas).
7. **Hecho cuando** sale amarilla: se ordenan en fila hasta bandera verde.
8. **Hecho cuando** un coche va al límite lateral: roza el borde pero sigue pisando asfalto (nadie circula estable fuera).

### C. Sin regresiones (SC-003, SC-004)

9. **Hecho cuando** corro `npm run build` y `npm run harness`: verdes, con la autocomprobación lateral pasando (motor intacto).
10. **Hecho cuando** reviso las capturas en vivo (oscuro y claro): asfalto limpio y coches repartidos.
11. **Hecho cuando** sigo jugendo mi partida guardada: nada ha cambiado de sitio ni se ha perdido (no hay migración).

## Resultado esperado

Los 11 puntos en verde (1-8 y 10 verificables en vivo por CDP: raíl ausente por muestreo de color del composite viejo, dispersión de píxeles de coche contra el eje reconstruido del asfalto, ambos temas; 9 por consola; 11 jugando). Fallos → /speckit-converge.
