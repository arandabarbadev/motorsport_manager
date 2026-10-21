# Spec 019 — Identidad F1 y mejora de pilotos

## Problema

El juego parece una herramienta de desarrollador: la paleta calca el tema
oscuro de GitHub (fondo azulado, acento azul fijo, botones verdes de
"éxito"), las gomas usan colores genéricos en vez del código real de F1,
todo tiene el mismo radio 8-12 px, hay etiquetas en MAYÚSCULAS y la
tipografía es la del sistema. Además: en "Mis boxes" no se ve la posición
de mis coches, los dorsales no se pueden cambiar y los pilotos no se
pueden mejorar.

## Requisitos funcionales

- FR-001 — Posición junto a los neumáticos propios: en cada tarjeta de
  "Mis boxes", a la IZQUIERDA de la goma actual, la posición de ese coche
  (P1-P20; DNF si está fuera), actualizada en cada tick.
- FR-002 — Dorsales personalizables: input numérico (1-99) para los 2
  pilotos del jugador en "Mi Equipo"; persiste en el roster; único entre
  los 20 pilotos (se rechaza el duplicado); sigue viéndose en el canvas,
  la clasificación en vivo y los resultados.
- FR-003 — Acento dinámico del equipo: `Team.color` alimenta `--accent`
  en `:root` (botones, bordes activos, chips, guías, avisos). Los
  derivados (fondo suave, borde, texto) se calculan con `color-mix`; el
  color del TEXTO de los botones activos se calcula por luminancia (un
  amarillo exige texto oscuro). Se aplica al arrancar y en vivo al cambiar
  el color de librea. Fuente de verdad: el roster de la ranura activa.
- FR-004 — Colores de goma F1 reales: blando rojo, medio amarillo, duro
  blanco (con halo en tema claro), intermedio verde, lluvia azul —
  variables temáticas propias (`--tyre-*`), no success/warn/error.
- FR-005 — Fondo carbón neutro: tokens oscuros sin tinte azul (±2 por
  canal R/G/B); tema claro en papel neutro.
- FR-006 — Tipografía: una sola fuente funcional (Inter variable 400-700)
  para toda la UI y texto, con cifras tabulares GLOBALES; segunda fuente
  (Barlow Condensed) reservada a UN momento: los números de posición de
  la clasificación en vivo. Las fuentes se sirven desde el propio bundle
  (`src/fonts/`) → el service worker las cachea y el juego sigue
  funcionando offline.
- FR-007 — Radios de borde: tarjetas/paneles/tablas/listas/avisos/chips a
  2 px (casi rectas); el radio (8 px) solo en botones e inputs, donde
  significa "esto se toca". Excepciones documentadas: semáforo de salida
  (4 px, objeto físico) y puntos de color (dots, círculos por naturaleza).
- FR-008 — Sin mayúsculas decorativas: eliminar `text-transform:
  uppercase` y `letter-spacing` decorativo de `.hud-title`,
  `.lights-label`, `.card h3`, `.champ-table h3`, `.slot-active-tag`,
  `.slot-diff-label`, `.staff-level`.
- FR-009 — Apartado "Pilotos": pestaña nueva en "Mi Equipo" con los 4
  atributos por piloto — Experiencia, Habilidad, Reflejos, Ritmo — cada
  uno mejorable +1 con coste creciente (15 × (niveles comprados + 1) M€,
  sin descuento de ingenieros: es personal, no coche), tope 95. La media
  de los 4 es la **valoración general (val)**, visible por piloto y como
  media de los 2 pilotos rivales en la pestaña Rivales.
- FR-010 — Efecto real en la simulación: Ritmo→`pace`, Habilidad→
  `consistency`, Reflejos→`wetSkill`, Experiencia→ nueva stat que reduce
  el riesgo de incidente: `riesgo = 0.55 + (agresión+riesgo)/220 −
  (experiencia−50)/500` (suelo 0.3). Migración de saves: `experience=50`
  (comportamiento idéntico al de hoy) y `training={}` para los costes.

## Requisitos no funcionales

- NFR-001 — Harness: checks nuevos de Pilotos (compra +1, coste descontado,
  val = media, tope 95, dorsal duplicado rechazado) sin regresión de
  Tracks/Weather.
- NFR-002 — Sin cambios de estructura de HTML/componentes más allá de lo
  mínimo: span de posición en la línea de gomas, inputs de dorsal y la
  pestaña Pilotos.
- NFR-003 — `npm run build` verde + verificación en vivo por CDP
  (`mm-v019.js`): acento dinámico, colores de goma, radios, sin
  mayúsculas, fuentes cargadas, posición en Mis boxes, dorsales,
  Pilotos con compra real.
- NFR-004 — Los pilotos nuevos se generan con `experience` aleatoria
  (50-90) como el resto de stats; los guardados migran a 50.

## Fuera de alcance

- Cambiar sueldos de piloto según val (los sueldos siguen planos).
- Editar dorsales de los rivales (solo los del jugador).
- Rediseñar el canvas de carrera más allá del color de fondo/tokens.
