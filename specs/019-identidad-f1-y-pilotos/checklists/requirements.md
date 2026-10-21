# Checklist de requisitos 019

- [x] FR-001 — Posición (P#/DNF) a la izquierda de la goma actual en cada tarjeta de "Mis boxes", por tick.
- [x] FR-002 — Dorsales del jugador editables (1-99, únicos entre los 20), persistidos y visibles como siempre.
- [x] FR-003 — `Team.color` = `--accent` en toda la UI (derivados por color-mix, contraste por luminancia), al arrancar y en vivo.
- [x] FR-004 — Gomas con código F1 real: S rojo, M amarillo, H blanco (halo en claro), I verde, W azul fijo.
- [x] FR-005 — Fondo carbón neutro (sin tinte azul) en ambos temas.
- [x] FR-006 — Inter (tabular global) + Barlow Condensed solo en los números de posición de la clasificación en vivo; fuentes del bundle, offline OK.
- [x] FR-007 — Radio 2 px en datos, 8 px solo en botones/inputs (semáforo 4 px documentado).
- [x] FR-008 — Sin `text-transform: uppercase` ni letter-spacing decorativo.
- [x] FR-009 — Pestaña Pilotos: Experiencia/Habilidad/Reflejos/Ritmo, +1 con coste creciente (15×(n+1)), tope 95, val = media (también media de rivales).
- [x] FR-010 — Mejoras con efecto real: pace/consistency/wetSkill/experiencia (riesgo de incidente −(exp−50)/500, suelo 0.3); migración experience=50 + training={}.
- [x] NFR-001 — Harness: checks Pilotos y Dorsales sin regresión de Tracks/Weather.
- [x] NFR-002 — Sin cambios de estructura HTML más allá del mínimo (span pos, inputs dorsal, pestaña).
- [x] NFR-003 — Build verde + verificación en vivo por CDP (mm-v019.js).
