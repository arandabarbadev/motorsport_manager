# Investigación: Carrera viva

**Fecha**: 2026-10-17 · **Spec**: [spec.md](spec.md)

## Punto de partida (lo que ya hay)

1. **El motor ya simula incidentes** (`simulation.ts:runIncidents`): trompos (bandera amarilla), choques (DNF + amarilla/roja) y averías (DNF silencioso), escalados por agresión/riesgo/lluvia. El problema es de VISIBILIDAD: solo cambian `flag` y `status`; el render no recibe suceso (los `raceEvents` por tick solo llevan adelantamientos y entradas a boxes).
2. **Los coches van sobre el raíl**: `race-screen.ts:drawCars` pinta cada coche en `sampler.pointAt(progresoTotal)` — exactamente la línea central que se dibuja con `strokeLoop(1.5, --track-line)`. El asfalto es ancho a propósito (`roadWidth = max(12, 6,2 % del lienzo)`, "wide enough to see overtakes") pero nadie lo usa.
3. **La parrilla ya está escalonada en el MOTOR**: `race-builder.ts` arranca con `lapProgress = (n−1−i)·0,0022` (huecos de 0,22 % de vuelta). Es decir: el escalón existe; lo que falta es el LADO (columna izquierda/derecha), que es render.
4. **Ya hay sistema de feedback con caducidad** (fase 7): `highlightUntil` (anillos 900 ms) + `floatingTexts` (textos que suben 1200 ms, máx 6), movidos SOLO por `raceEvents` del motor. Los incidentes se enganchan aquí: misma arquitectura, cero invención nueva.
5. **El tick y el rAF ya están desacoplados**: el render interpola `shadow → estado` con `alpha`; añadir la lateral al render respeta el diseño (el motor no se entera).

## Opciones consideradas

### Lateralidad: ¿motor o render?

- **Motor (RaceCarState.lane)**: realista pero contagia todo — posiciones, adelantamientos, IA, harness, y FR-001 dice expresamente que NO cambie el motor. Descartada.
- **Render puro con estado propio (elegida)**: un módulo puro `racing-line.ts` decide el OBJETIVO lateral (entrada: coches, curvatura, bandera; salida: objetivo por coche) y el render suaviza hacia él. Testeable en Node sin DOM, y el motor intacto. Es la misma filosofía que `shadow` (fase 7): estado del render, jamás del motor.

### ¿De dónde sale la "curva" para la trazada?

El sampler (`track-path.ts`) solo expone `pointAt`/`polyline`. La normal y la curvatura se derivan de él sin tocarlo: tangente = `pointAt(t+ε) − pointAt(t−ε)`; normal = perpendicular normalizada; curvatura con signo = producto vectorial de tangentes en `t` y `t+Δ` (signo → hacia qué lado está el interior). ε=0,002 y Δ=0,01 de vuelta: suficiente con 24 muestras/segmento.

### ¿Batallas?

El motor ya calcula `gapToLeaderSec` y `position`; pero para la vista es más barato y robusto comparar PROGRESO TOTAL (lo mismo que ordena las posiciones en `recalculatePositionsAndGaps`): el coche de delante más cercano con diferencia < 0,0035 (~1,4 s con vuelta de 90 s; el hueco de parrilla es 0,0022, así que en formación TODAS las parejas están "en batalla" y la parrilla se abre sola en dos columnas — exactamente el efecto buscado, sin caso especial).

### Semáforo: ¿canvas o DOM?

DOM (elegida): centrado sobre `.track-wrap`, verificable por selectores (`​.start-lights`, `.light.on`), animable con CSS transición, y no cuesta ni un frame del canvas. La secuencia la lleva la pantalla con `performance.now()`; el intervalo del simulador simplemente no hace tick mientras las luces estén encendidas (igual que la pausa, pero sin tocar `isPaused` del estado).

### Incidente forzado para la verificación

`runIncidents` decide con `Math.random()`. En la verificación en vivo se puede sustituir temporalmente `Math.random` en la página para que la PRIMERA tirada salga casi 0 (trompo garantizado del primer coche evaluado) y el resto altas, a 1x con el coche visible: bandera amarilla + anillo + texto + línea del feed, todo comprobable por DOM/captura. Sin código de debug en producción.

### Lluvia

`RAIN_RACE_CHANCE` vive solo en `race-builder.ts` (la proporción de actos cortos deriva en `weekend.ts:eventRainChance`). Un número, una línea; evidencia: el código construido.

## Riesgos y mitigaciones

- **Parpadeo de objetivo** (batalla que aparece/desaparece cada tick): mitigado por el suavizado exponencial (τ 0,45 s) — el objetivo puede saltar, el coche no.
- **Coches saliéndose del asfalto**: `lateral` acotado a [−1, 1] y pintado a ±34 % del semiancho (el borde de la calzada queda lejos).
- **Coste por frame**: 20 coches × (2 `pointAt` extra para normal + batalla O(n²) de 400 comparaciones) — trivial frente a lo que ya pinta el rAF.
- **Determinismo del harness**: `racing-line.ts` no usa `Math.random` (deriva personal = seno con fase hash); el harness puede fijar entradas y afirmar invariantes.
