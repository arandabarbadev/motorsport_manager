---
description: "Lista de tareas de la función Carrera en vivo (pantalla 2D)"
---

# Tareas: Carrera en vivo (pantalla 2D)

**Entrada**: documentos de `/specs/002-pantalla-carrera/`

**Requisitos previos**: plan.md ✔, spec.md ✔, research.md ✔, data-model.md ✔, quickstart.md ✔

**Tests**: lectura de código citada + partida en vivo (⭐ = con el juego abierto de Rafa). Sin código nuevo.

## Convención de rutas: pantalla en src/ (race-screen.ts, race-screen.css, track-path.ts)

---

## Fase 1: Pintado del circuito y los coches

- [x] T001 Verificar en `src/race-screen.ts:33,331-351`: tick en interval propio de 200 ms; en `355-374` el bucle de animación solo lee y dibuja (reglas 1-2, FR-010)
- [x] T002 Verificar en `src/race-screen.ts:123-127,272-327`: pista pre-renderizada en lienzo fuera de pantalla (asfalto, bordes, línea de meta) con colores del tema; regenerada al redimensionar (resize) y al cambiar tema (FR-001)
- [x] T003 Verificar en `src/race-screen.ts:169,215-219,416-429`: interpolación entre la sombra del tick anterior y el estado actual (alpha por tiempo), sin tocar el estado del motor (FR-002)
- [x] T004 Verificar en `src/race-screen.ts:433-453`: retirado = fantasma tenue; en boxes = punto reducido y atenuado; jugador con borde dorado (FR-001)

## Fase 2: Órdenes de boxes del jugador

- [x] T005 Verificar en `src/race-screen.ts:567-611`: panel "Mis boxes" con las 4 gomas por coche mío; el clic encola la orden del motor, marca la pendiente y lanza el aviso flotante (FR-003)
- [x] T006 Verificar en `src/race-screen.ts:509-522`: estados del panel (pendiente "entra al cruzar meta…", "En boxes: Xs", "N parada(s)") y botones deshabilitados si terminó, está en pausa o el coche no corre (FR-003)

## Fase 3: HUD y cabecera

- [x] T007 Verificar en `src/race-screen.ts:458-530`: tabla reordenada por posición (re-colgado de nodos), hueco con formato +s/+L/líder/DNF, letra de goma, barra de desgaste con umbral de aviso/peligro y mis filas destacadas (FR-004)
- [x] T008 Verificar en `src/race-screen.ts:532-563`: cabecera con GP, vuelta X/total, clima con "riesgo de lluvia", reloj; banderas amarilla/roja/cuadros sobre la pista con segundos restantes (FR-007)

## Fase 4: Controles y final de carrera

- [x] T009 Verificar en `src/race-screen.ts:615-642`: pausa/velocidades 1x-20x con activa marcada; en `222-242` cada carrera arranca a 1x; "Nueva carrera" reconstruye sin coste y queda deshabilitado al terminar (FR-005, FR-006)
- [x] T010 Verificar en `src/race-screen.ts:646-727`: al terminar, panel con mis coches, premios y balance (patrocinador, sueldos, alquiler — spec 004), presupuesto y siguiente GP o "Temporada completada" (FR-008)
- [x] T011 Verificar en `src/race-screen.ts:185-207,381-414`: destellos y textos flotantes nacen SOLO de `state.raceEvents` del tick; textos con nombre solo para mis coches; lista limitada a 6 (FR-009)

## Fase 5: Validación en vivo (verificada el 2026-10-10, build de producción + Chrome headless)

- [x] T012 Partida viva verificada: login local → Mi Equipo (presupuesto 350 M, botón "Carrera · R1: Melbourne") → carrera: GP Melbourne, Vuelta 1/58, Seco, 20 filas en la clasificación y 8 botones de goma en "Mis boxes" (SC-001, SC-002). Capturas de escritorio y móvil (390×844) revisadas: circuito completo, coches con colores, HUD al día, sin desbordes en móvil (SC-004)
- [x] T013 Orden de boxes viva: pulsada la goma blanda de mi primer coche → el panel responde "Entra en boxes al cruzar meta…" (SC-003, FR-003). La ejecución de la parada al cruzar meta está probada además por el harness de la spec 001
- [x] T014 Compilación y empaquetado verdes: `npm run build` compila TS y empaqueta la app de producción en 8,4 s

---

## Dependencias y orden

- Fases 1-4 verificables por código en paralelo; Fase 5 al final

## Estrategia

Verificar en código citando archivo y línea, y validar en vivo con el navegador (evidencias pegadas arriba y capturas, IX). No genera cambios.

## Notas

- "Verificar" = leer el código citado, probarlo si hace falta y marcar. No genera cambios.
- El overlay de resultados toca la economía solo a través de las funciones de 004: la frontera está documentada en el data-model.
