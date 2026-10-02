# Motorsport Manager ⚙️🏁

Juego de gestión de escudería de F1 estilo *Motorsport Manager*: gestión de equipo (presupuesto, mejoras del coche) y una pantalla de carrera 2D vista desde arriba en tiempo real — 20 puntos de colores sobre el circuito, desgaste de neumáticos visible y pit stops que decide el jugador mientras la carrera corre.

## Estado del desarrollo

- [x] **Fase 1 — Motor de simulación validado sin UI** (`npm run harness`)
- [x] **Fase 2 — Render Canvas** (circuito spline, 20 coches, HUD, pit stops del jugador)
- [x] **Fase 3 — Mi Equipo + parrilla de rivales generada** (persistencia en `localStorage`)
- [x] **Fase 4 — Fin de carrera, premios y economía persistente** (`f1manager:career:v1`)
- [x] **Fase 5 — Generador procedural de 20 pistas y calendario** (`npm run tracks` para ver la tabla)
- [x] **Fase 6 — Pantalla de fin de temporada** (resumen + "Empezar temporada nueva" conservando dinero y mejoras)

## Extras (después del plan de 6 fases)

- 🌓 **Tema claro/oscuro** persistente (como Instagram) en todas las pantallas
- 📲 **Instalable como app** (PWA con service worker propio, funciona sin internet)
- 🔐 **Login con Firebase** (email/contraseña, partida sincronizada en la nube) + modo local
- 🚗 **9 categorías de desarrollo del coche** (aero, alerones, motor, electrónica, chasis, suspensión, neumáticos, seguridad, volante)
- 🏛️ **Sede del equipo**: mecánicos (boxes más rápidos), ingenieros (mejoras más baratas) y comerciales (más patrocinio)
- 💼 **100 patrocinadores falsos** (0,5 a 5 M€/carrera; los mejores exigen resultados)
- 💥 **Accidentes y averías** con **banderas amarillas/rojas** y bandera a cuadros al terminar
- 💰 **Finanzas de carrera**: premios + patrocinio − sueldos − alquiler
- ⚡ Velocidades 1x/5x/10x/**20x**

## Stack

TypeScript + Vite + npm. Funciona en escritorio y móvil. Sin framework de UI. Persistencia en `localStorage` y, con login, en Firestore.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | instala las dependencias |
| `npm run dev` | abre el juego en el navegador (modo desarrollo) |
| `npm run harness` | corre el test del motor de la Fase 1 en la consola |
| `npm run tracks` | tabla de las 20 pistas de la temporada |
| `npm run maps` | dibuja los 20 circuitos en ASCII en la consola |
| `npm run build` | compila la versión de producción |

## Datos de circuitos

Los trazados de los 20 circuitos provienen de trazas GPS reales de las pistas (datos de [OpenStreetMap](https://www.openstreetmap.org) vía [bacinger/f1-circuits](https://github.com/bacinger/f1-circuits)), convertidos con `node tools/convert-layouts.js`.

## Arquitectura (reglas fijas)

1. `simulationTick` es agnóstico de UI y de render: no importa Canvas ni frameworks, solo lee y escribe `RaceState`.
2. El tick de simulación corre en un intervalo propio, desacoplado del render (`requestAnimationFrame`). El render solo LEE el estado, nunca lo muta.
3. Los pit stops del jugador se encolan con `queuePitCommand` y se aplican al inicio del siguiente tick, nunca a mitad de uno.
4. La IA de boxes usa la función de utilidad ponderada `computePitScore`.
