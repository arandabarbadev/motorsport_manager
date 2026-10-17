# Guía de validación: Formato de fin de semana

**Fase 1** · 2026-10-11 · Con el juego en la mano

## Escenarios: "hecho cuando…"

### A. Los cuatro actos (FR-001, FR-002, SC-001)

1. **Hecho cuando** abro una ronda nueva: el botón dice "Clasificación · R1: …" y la cabecera de la carrera dice Clasificación, 3 vueltas.
2. **Hecho cuando** termina la clasificación: panel con el orden (sin premios ni balance) y botón "Continuar a Sprint 1".
3. **Hecho cuando** entro en el Sprint 1: su parrilla es EXACTA la clasificación anterior; distancia ~1/4 de la carrera; cabecera "Sprint 1".
4. **Hecho cuando** termina el Sprint 1: "Continuar a Sprint 2", parrilla encadenada; y de este a la Carrera, igual.
5. **Hecho cuando** salgo a Mi Equipo a mitad de fin de semana: el botón dice el acto pendiente ("Sprint 2 · R1: …") y al entrar, la parrilla es la misma que dejó el acto anterior.

### B. Puntos y premios (FR-003, FR-004, SC-002, SC-003)

6. **Hecho cuando** termina un sprint: los 8 primeros suman puntos (verificable en Campeonato); los premios del panel son la cuarta parte de la tabla; el presupuesto sube.
7. **Hecho cuando** termina la carrera: premios a escala completa Y el desglose con patrocinio, sueldos y alquiler (una sola liquidación por fin de semana).
8. **Hecho cuando** miro el historial de temporada: cada ronda con sus actos y el total suma todos los premios.

### C. Integridad (FR-005, FR-006, FR-007)

9. **Hecho cuando** mejoro mi mejor puesto en un sprint: los patrocinadores que lo exigen se desbloquean.
10. **Hecho cuando** termino la carrera de la ronda 24: temporada completada y resumen (los sprints nunca la cierran).
11. **Hecho cuando** entro con una partida de antes del cambio: sus resultados son carreras y la ronda en curso empieza en clasificación.

## Resultado esperado

Los 11 puntos en verde (1-5 y 7 verificables en vivo con una ronda acelerada; 10 con partida sembrada). Fallos → /speckit-converge.
