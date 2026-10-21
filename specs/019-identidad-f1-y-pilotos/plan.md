# Plan 019 — Identidad F1 y mejora de pilotos

## Diseño

Cuatro capas independientes que se integran al final:

1. **Datos**: `Driver.experience` + `training`, helpers de roster
   (dorsal único, val, costes), fórmula de riesgo en la simulación.
   Migración hacia atrás gratis (experience=50 ⇒ comportamiento igual).
2. **Sistema visual** (`ui.css`): tokens carbón neutros, acento derivado
   por `color-mix`, tipografías (`@font-face` locales + tabulares
   globales), radios touch/data. Es el único archivo que define tokens;
   las pantallas solo los consumen.
3. **Pantallas**: ajustes puntuales por hoja (radios, sin mayúsculas,
   gomas por variables, pos con fuente display, wear a 2 px); el HTML
   casi no cambia (span de posición, inputs dorsal, pestaña Pilotos).
4. **Acento dinámico**: módulo nuevo `accent.ts` + 3 puntos de llamada.

## Riesgos

- **Amarillo de librea + texto blanco**: resuelto con `--accent-contrast`
  por luminancia (FR-003).
- **Goma "wet" apuntaba a `--accent`**: pasa a azul fijo `--tyre-wet`
  (rompería con el acento dinámico).
- **Offline PWA**: fuentes empaquetadas en el bundle (assets con hash,
  cache-first del SW), nunca del CDN.
- **Regresión de sim**: experience=50 en migración = resta 0; los checks
  existentes del harness deben seguir verdes tal cual.
- **Chrome viejo**: `color-mix` ya se usa desde la 012 sin problema.

## Constitution check

- **Regla VIII** (sin claves en archivos/comandos/commits): no hay
  secretos nuevos; las fuentes son archivos públicos.
- **Regla IX** (evidencias): verificación en vivo por DOM/computed styles
  (acento, colores, radios, mayúsculas, fuentes) + harness; nunca "se ve
  bien".
- **Regla X** (carpeta abierta): explorer.exe lanzado al empezar (la
  ventana ya estaba abierta).
- **Regla XI**: recordar `/compact` al cerrar la función.

## Orden

T001 fuentes → T002 tokens ui.css → T003 hojas de pantalla → T004
acento dinámico → T005 datos pilotos (tipos/roster/sim) → T006 pestaña
Pilotos + dorsales en team-screen → T007 posición en Mis boxes →
T008 harness → T009 build + verificación viva → T010 cierre (commit,
push, deploy, memoria).
