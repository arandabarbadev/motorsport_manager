# Research 019 — Identidad F1 y mejora de pilotos

## Qué hay hoy (leído en el código, 2026-10-21)

- **Paleta = GitHub oscuro**: `--bg:#0d1117` (delta azul +10 sobre rojo),
  `--accent:#1f6feb` fijo, `.btn.primary` verde `#238636`. Tema claro igual
  en azul. `Team.color` solo se usa para puntos de color en listas y coches
  del canvas.
- **Gomas** (`race-screen.css`): soft `#e05252`, medium `#b08800`, hard
  `var(--text)`, inter `#43b02a`, wet `var(--accent)` — este último se
  rompería al cambiar el acento (sería el color del equipo, no azul).
- **Mayúsculas CSS**: `.hud-title` y `.lights-label` (race),
  `.card h3` y `.champ-table h3` (team), `.slot-active-tag` y
  `.slot-diff-label` (slots), `letter-spacing:1px` en `.staff-level`.
  El texto TS ya va en minúscula: basta quitar el transform del CSS.
- **Radios 8-14 px en TODO**: `.btn`/`.in` 8, `.card` 12, `.pit-box` 10,
  `.results-panel` 14, `.slot-card`/`.auth-card` 14, `.notice` 10,
  `.sponsor-list` 10, filas 6, chips pill 999.
- **Tipografía**: `system-ui, 'Segoe UI'` por pantalla, sin
  `font-variant-numeric` global (sí puntual en tablas).
- **"Mis boxes"** (`race-screen.ts` `buildPitPanel`/`updateHud`): línea
  `.pit-tyre` = chip de goma + barra de desgaste + %; la posición solo
  está en la clasificación.
- **Dorsales**: `Driver.number` generado (jugador 1-2, rivales 3-20),
  sin UI de edición; se pinta en el canvas (dentro del punto) y en
  `.num` de la clasificación.
- **Pilotos** (`roster.ts`): stats aleatorias `pace/consistency/aggression/
  wetSkill/riskTolerance` 55-95 (excepciones); el jugador NO puede
  mejorarlas. La simulación las lee en vivo cada tick (`lookupDriver`).
- **Desarrollos del coche**: `devCost = 15 × (nivel+1)`, tope 15 niveles,
  descuento de ingenieros −5 %/nivel; **Sede**: `staffUpgradeCost = 30 ×
  nivel`, tope 10. El apartado Pilotos copia el modelo de costes de
  desarrollos (15 × (n+1)) SIN descuento de ingenieros, tope por STAT 95
  (máximo de rivales, coherente con `MAX_CAR_STAT=95`).

## Incidentes y "experiencia" (`simulation.ts` `runIncidents`)

Hoy: `riesgo = 0.55 + (agresión + riesgoTolerancia)/220` (~0.7-1.4).
Mapear Experiencia→`riskTolerance` sería al revés (más tolerancia = más
incidente) y Habilidad→agresión tampoco encaja. Decisión: **nueva stat
`experience`** con resta `(experience−50)/500` y suelo 0.3:

- experience 50 → resta 0 → **idéntico a hoy** (migración gratis).
- experience 95 (máx) → −0.09 → ~6 % menos de probabilidad de incidente
  por segundo. Sutil pero real y acumulativo con las carreras.

Mapeo completo del apartado: Ritmo→`pace` (60 % del ritmo base),
Habilidad→`consistency` (ruido por vuelta), Reflejos→`wetSkill` (lluvia),
Experiencia→`experience` (incidentes). `aggression` y `riskTolerance`
siguen siendo personalidad oculta.

## val (valoración general)

`val = round((pace + consistency + wetSkill + experience) / 4)`. Se muestra
por piloto en la pestaña Pilotos y como media de los 2 pilotos en la línea
de stats de cada rival (`val 81 · A 72 · M 70 · C 71`).

## Acento dinámico

- JS (`src/accent.ts`): `applyTeamAccent(color)` escribe `--accent` en
  `documentElement.style` y calcula `--accent-contrast` (blanco o casi
  negro por luminancia relativa — con un amarillo de librea el texto del
  botón activo debe ser oscuro). Llamadas: arranque (`main.ts`, tras
  `loadRoster`), al cambiar el color en Mi Equipo (en vivo) y al montar
  team-screen (cubre el cambio de ranura).
- CSS: los derivados se calculan con `color-mix` (ya se usa en
  `race-screen.css` desde 012, Chrome lo soporta):
  - oscuro: `--accent-text: mix(accent 55%, #fff)`, `--accent-bg: mix(accent
    14%, panel)`, `--accent-bg-border: mix(accent 40%, panel)`
  - claro: `--accent-text: mix(accent 72%, #000)`, bg 10 %, borde 35 %
- `.btn.primary` pasa de verde fijo a `var(--accent)` + `--accent-contrast`
  (FR-003: los botones llevan el color del equipo). El verde queda para
  éxito/desgaste sano.
- Sin roster (auth) o equipo sin color: `--accent` por defecto `#e10600`
  (rojo F1 = color inicial del equipo del jugador, coherente).
- El canvas no usa `--accent` (solo `--track-*` y `--dim`), así que no hay
  que repintar capas al cambiar el color en vivo.

## Fuentes (medido, no prometido)

- Google Fonts accesible desde esta red (fonts.googleapis.com 200,
  fonts.gstatic.com sirve archivos). Overpass estaba bloqueado pero este
  dominio NO.
- Descargadas 6 woff2 válidas a `src/fonts/` (217 KB): Inter variable
  400-700 (latin 47 KB + latin-ext 83 KB — la URL de la CSS2 API es la
  misma para 400/500/700, es la variable) y Barlow Condensed 600/700
  (latin + latin-ext, 15-22 KB cada una). Subsets latin+latin-ext cubren
  español (á é í ó ú ñ ¿ ¡).
- Declaradas con `@font-face` en `ui.css` apuntando a `./fonts/*.woff2` →
  Vite las firma (URL con hash) → el SW cachea los assets same-origin
  cache-first → **offline sigue funcionando** (el CDN NO, por eso se
  empaquetan).
- Cifras tabulares: `font-variant-numeric: tabular-nums` en `body` — Inter
  tiene tnum; así no baila ningún número (posiciones, tiempos, dinero).
- Barlow Condensed (estética torre de tiempos F1) SOLO en
  `.standing-row .pos` — un único momento, como pide el brief.

## Paleta carbón (oscuro; verificado |r−b| ≤ 2 en --bg)

| token | valor |
|---|---|
| `--bg` | `#161718` |
| `--panel` | `#1f2021` |
| `--panel-2` | `#191a1b` |
| `--input-bg` | `#161718` |
| `--border` | `#2c2d2e` |
| `--border-2` | `#3c3d3e` |
| `--text` | `#ececee` |
| `--dim` | `#9b9ca1` |
| `--btn-bg` / hover | `#262728` / `#323334` |
| `--track-asphalt` | `#33353a` (superficie, no fondo) |
| `--track-halo` / `--track-start` | sin cambios / `#ececee` |

(Primera iteración `#151618` medía Δ azul 3; ajustada a `#161718`
hasta cumplir el ≤2 prometido.)

Claro: `--bg:#f3f3f4`, `--panel:#fff`, `--panel-2:#f7f7f8`,
`--border:#d9dadb`, `--border-2:#c4c5c6`, `--text:#1b1c1e`,
`--dim:#5d5e63`, `--btn-bg:#f0f0f1`, `--track-asphalt:#dfe0e2`.

Gomas (oscuro / claro): soft `#ff2e1f`/`#d61f0e`, medium `#ffd12e`/
`#8a6d00`, hard `#f2f3f4`/`#ffffff`+`text-shadow` negro, inter
`#37c856`/`#157f37`, wet `#2aa8e8`/`#0a6aa8`. El blanco "duro" en claro
lleva halo para ser legible (sigue siendo BLANCO, el código F1).

`theme-color` de index.html y del manifest: `#161718`.

## Radios

`--radius-touch: 8px` (`.btn`, `.in`, `.pit-btn`, `.slot-diff-btn`),
`--radius-data: 2px` (`.card`, `.pit-box`, `.results-panel`,
`.sponsor-list`, `.slot-card`, `.auth-card`, tarjeta de temporada,
`.notice`, `.guide-card`, `.flag-indicator`, `.budget-chip`,
`.slot-active-tag`, filas `.standing-row`/`.champ-row`/`.feed-item`,
`.wear`). Semáforo 4 px (objeto físico). `.slot-tag` y dots siguen
círculos.

## Dorsales únicos

`setDriverNumber(roster, entry, seat, n)` en `roster.ts`: rechaza n<1,
n>99 o ya usado por OTRO piloto del roster (los 20). La UI revierte el
input al valor anterior si devuelve false. Reutilizable por el harness.
