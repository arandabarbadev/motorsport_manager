# Quickstart 017

1. `npm run build` — verde.
2. `npm run harness` — sin regresión (el hub es DOM; el motor no cambia).
3. `vite preview` 4173 + Chrome CDP 9222 → `node %TEMP%\mm-v017.js` (siembra reliability 0, corre a 20x y espera la avería real).
4. A mano: entrar en cualquier carrera a 20x un rato — la primera avería saca la tarjeta roja con piloto y posición.

**Señales de éxito**: tarjeta "Retirada por avería / Nombre · P#" arriba a la derecha del circuito, se va sola en ~7 s, nunca más de 4 apiladas.
