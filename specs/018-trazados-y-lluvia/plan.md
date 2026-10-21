# Plan 018

## Constitución (check)

- Docs antes de código: este directorio completo antes de tocar `src/`. ✔
- Regla VIII: sin tokens/claves en archivos, comandos o commits (solo URLs públicas de OSM). ✔
- Regla IX: verificación por evidencias (ASCII/píxeles/DOM/harness), no promesas. ✔
- Regla X: carpeta del proyecto abierta en el Explorador antes de empezar. ✔

## Fase 1 — Trazados (Jerez real + calendario 20)

1. `tools/assemble-jerez.js`: ensamblador documentado (grafo OSM → lazo); regenera
   `data/f1-circuits/es-1986.geojson` (4,426 km).
2. `tools/convert-layouts.js`: CALENDAR sin za-1961/fr-1967/de-1927/pt-1972.
3. Regenerar `src/real-layouts.ts`; `src/tracks-generator.ts`: TRACK_PROFILES a 20,
   comentario del calendario.
4. `src/career.ts`: filtrar resultados de rondas retiradas en `loadCareer`.
   `src/slots.ts`: default de rounds 24→20 (cosmético).
   Evidencia: `npm run maps` (Jerez reconocible) + longitud + harness.

## Fase 2 — Pista legible (borde blanco + sin fusiones)

1. `src/tracks-generator.ts`: `declash()` determinista + constantes (target 0,078).
2. `src/race-screen.ts`: `drawTrackLayer` con 3 trazos; carretera 0,075→0,06.
3. `src/ui.css`: `--track-halo` por tema.
   Evidencia: `npm run maps` post-declash (tramos separados), harness "Tracks check",
   sonda de píxeles perpendicular a la pista en vivo (patrón halo-blanco-asfalto).

## Fase 3 — Lluvia jugable (inter + avisos)

1. `src/types.ts`: `inter` en TyreCompound.
2. `src/simulation.ts`: tablas pace/wear compound×tiempo; IA con conjuntos adecuados y
   goma preferida.
3. `src/race-screen.ts`: label I + botón Intermedios + aviso de cambio de tiempo con el
   hub 017; `src/race-screen.css`: `.tyre.inter` verde.
4. `src/test-harness.ts`: "Weather check" — estado con lightRain forzada → la IA para a
   `inter`; ritmo inter < slick en ligera (computePace es interno ⇒ se mide por vueltas).
   Evidencia: harness + verificación en vivo (aviso real cuando cambia el tiempo).

## Fase 4 — Verificación en vivo (CDP, `mm-v018.js` en %TEMP%)

- Preview propio (`./node_modules/.bin/vite preview --port 4173 --strictPort`) + Chrome
  headless 9222; re-login local condicional (lección 013+).
- Jerez: save mutado a la ronda de Jerez → cabecera "Jerez" + sonda perpendicular
  (halo/blanco/asfalto) + ancho de carretera.
- Singapur: ronda de Singapur → en la zona de las eses hay canal entre tramos (píxeles
  de fondo/halo ENTRE dos líneas blancas).
- Lluvia: ventanas de 60 s a 20x reiniciando en marcha (lección 017b) hasta cambio de
  tiempo → tarjeta con "Lluvia" + botones I en Mis boxes.
- Migración: save con resultado en gp-kyalami → 20 rondas, sin esa fila, presupuesto igual.

## Fase 5 — Cierre

`npm run build` + `npm run harness` verdes → tareas/requisitos [x] → commit → push →
`gh run list` + constantes nuevas en el bundle publicado → memoria → recordar /compact.

## Riesgos y mitigaciones

- **Deformación excesiva por declash** (Suzuka puente): target moderado 0,078 + iteraciones
  limitadas + revisión visual de TODOS los mapas ASCII antes de cerrar.
- **Lluvia que no llega en la verificación**: harness determinista primero (la IA para a
  inter con lluvia forzada); el aviso en vivo usa ventanas reiniciables y si no sale en
  ~6 ventanas se documenta el timeout y se acepta la evidencia del harness + DOM del botón.
- **Regenerar layouts cambia los 20 restantes**: el pipeline no se toca ⇒ solo cambia
  es-1986 y el orden/longitud de la lista; ids estables `gp-<slug>` intactos.
