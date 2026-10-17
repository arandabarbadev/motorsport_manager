# Guía de validación: Partidas múltiples

**Fase 1** · 2026-10-17 · Con el juego en la mano

## Escenarios: "hecho cuando…"

### A. Tres ranuras (FR-001, FR-002, SC-001)

1. **Hecho cuando** abro "Partidas" desde Mi Equipo: veo 3 tarjetas, la activa marcada, con nombre editable y resumen (temporada/ronda/presupuesto) o "Vacía".
2. **Hecho cuando** creo en una vacía: se activa, entro con equipo nuevo (200 M€) y la tarjeta pasa a tener contenido.
3. **Hecho cuando** edito un nombre: se guarda al instante (lo ves al salir y volver).
4. **Hecho cuando** alterno entre dos partidas con presupuesto distinto: cada una muestra SU dinero y SU ronda, y las claves de la otra no cambian.

### B. Borrar sin sustos (FR-003, SC-002)

5. **Hecho cuando** pulso "Borrar": sale confirmación con el nombre de la partida.
6. **Hecho cuando** rechazo: no se borra nada.
7. **Hecho cuando** acepto: esa ranura queda "Vacía" y las otras dos intactas.
8. **Hecho cuando** borro la activa: al volver al juego hay partida utilizable (la primera con contenido, o nueva).

### C. Migración (FR-004, SC-003)

9. **Hecho cuando** abro con guardados v1: aparecen como ranura A activa, con su dinero y temporada intactos, y las claves v1 desaparecen.
10. **Hecho cuando** instalo de cero: entro directo a jugar, partida nueva en la A, sin pantallas extra.

### D. Nube (FR-005, SC-004)

11. **Hecho cuando** guardo con sesión iniciada: sube un documento por usuario con las 3 ranuras y la activa (formato nuevo).
12. **Hecho cuando** la nube tiene un documento viejo de una partida: se baja como ranura A.
13. **Hecho cuando** juego sin cuenta / sin Firebase: las ranuras funcionan igual en local.

## Resultado esperado

Los 13 puntos en verde (1-10 verificables en vivo por CDP con confirmación capturada y siembra de estado; 11-13 por código/build, y en vivo con sesión si hay Firebase configurado). Fallos → /speckit-converge.
