# Plan 015 — Dorsal en el coche y goma propia

## Cambios (todo en la capa de render/HUD, motor intacto)

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `src/race-screen.ts` · `carRadius()` | mínimo 4 → **7 px** para que el dorsal quepa en móvil (factor 0,013 sin cambios, escritorio igual que 014) |
| 2 | `src/race-screen.ts` · `drawCars()` | dorsal dibujado en el CENTRO del círculo: fuente `bold max(9, round(rr·1,05))` (rr = radio efectivo, ×0,75 en boxes), contorno oscuro `≥2 px`, relleno blanco; se elimina la posición elevada `p.y − r·2,1`. Bugfix FR-004: el fantasma DNF usa `continue`, no `return` |
| 3 | `src/race-screen.ts` · `buildStandings()`/`updateHud()` | filas de rivales: celdas `.tyre`/`.wear` vacías (fila con clase `no-tyre`, barra oculta con `visibility:hidden` para conservar el hueco de la rejilla); solo las filas `.player` reciben compuesto y desgaste |
| 4 | `src/race-screen.ts` · `PitBox` + `buildPitPanel()` + `updateHud()` | nueva línea `.pit-tyre` en cada box: chip de compuesto (clases existentes), barra `.wear` y porcentaje; actualizada en el mismo refresco de HUD |
| 5 | `src/race-screen.css` | estilos `.pit-tyre` (+ ajuste móvil) y `.standing-row.no-tyre .wear { visibility:hidden }` |
| 6 | `src/race-screen.ts` · guía | el punto 3 de la guía pasa a "hueco de los 20; goma y desgaste solo de los tuyos (y en Mis boxes)" |

## Números

- Radio coche: `max(7, 0,013·min(w,h))` — escritorio ≈ 12 px (igual), móvil ≈ 7 px (antes 4).
- Fuente dorsal: `max(9, rr·1,05)` px bold → 2 dígitos caben en el círculo (diálogo de 14 px en móvil, 24 px en escritorio).
- La calzada (7,5 %), la excursión ±0,42 y las amplitudes de 014 quedan intactas.

## Constitution Check — PASA

- Docs antes que código: esta carpeta se escribe antes de tocar `src/`. ✔
- Regla VIII: sin tokens/claves (no hay secretos en juego). ✔
- Regla IX: verificación con evidencia — build+harness y guion CDP `mm-v015.js` (píxeles: tinta dentro del círculo y nada encima; DOM: rivales sin goma, boxes con goma actual; bugfix: coches pintados tras un DNF). ✔
- Regla X: carpeta del proyecto abierta en el Explorador antes de empezar. ✔

## Riesgos y mitigación

- **Legibilidad del dorsal sobre colores claros de equipo**: contorno oscuro grueso + relleno blanco (mismo truco que ya usaba el dorsal externo).
- **Métrica de píxeles confundida con la línea de meta** (blanca): los umbrales se dan en % de clusters (≥80 % con tinta dentro, ≥80 % sin blanco encima), tolerando 1-2 coches junto a la meta.
- **`visibility:hidden` vs `display:none`**: la barra oculta con `display:none` movería la celda BOX a la columna del desgaste y desalinearía las filas.
