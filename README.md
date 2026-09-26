# Motorsport Manager ⚙️🏁

Juego de gestión de escudería de F1 estilo *Motorsport Manager*: gestión de equipo (presupuesto, mejoras del coche) y una pantalla de carrera 2D vista desde arriba en tiempo real — 20 puntos de colores sobre el circuito, desgaste de neumáticos visible y pit stops que decide el jugador mientras la carrera corre.

## Estado del desarrollo

- [x] **Fase 1 — Motor de simulación validado sin UI** (`npm run harness`)
- [ ] Fase 2 — Render Canvas
- [ ] Fase 3 — Mi Equipo + parrilla de rivales generada
- [ ] Fase 4 — Fin de carrera, premios y economía persistente
- [ ] Fase 5 — Generador procedural de 20 pistas y calendario
- [ ] Fase 6 — Pantalla de fin de temporada

## Stack

TypeScript + Vite + npm. Funciona en escritorio y móvil. Sin framework de UI por ahora (se decidirá cuando lleguen las pantallas de gestión). Sin backend: todo corre en el cliente y la persistencia va en `localStorage`.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | instala las dependencias |
| `npm run dev` | abre el juego en el navegador (modo desarrollo) |
| `npm run harness` | corre el test del motor de la Fase 1 en la consola |
| `npm run build` | compila la versión de producción |

## Arquitectura (reglas fijas)

1. `simulationTick` es agnóstico de UI y de render: no importa Canvas ni frameworks, solo lee y escribe `RaceState`.
2. El tick de simulación corre en un intervalo propio, desacoplado del render (`requestAnimationFrame`). El render solo LEE el estado, nunca lo muta.
3. Los pit stops del jugador se encolan con `queuePitCommand` y se aplican al inicio del siguiente tick, nunca a mitad de uno.
4. La IA de boxes usa la función de utilidad ponderada `computePitScore`.
