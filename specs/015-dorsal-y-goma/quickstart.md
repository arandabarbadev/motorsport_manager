# Quickstart 015

1. `npm run build` — verde.
2. `npm run harness` — sin regresión (motor intacto).
3. `npx vite preview --port 4173` (o reutilizar el que ya sirve `dist/`).
4. Chrome headless con CDP 9222 y ejecutar `node %TEMP%\mm-v015.js`:
   - parrilla: dorsales dentro de los 20 círculos (tinta en el centro, nada encima);
   - tabla: 18 filas de rivales sin goma, 2 del jugador con goma;
   - Mis boxes: línea de goma con compuesto+barra+% que crece;
   - capturas en `%TEMP%\mm-v015-*\`.
5. En el móvil: abrir la app (con internet), entrar en una carrera y mirar parrilla, tabla y boxes.

**Señales de éxito a simple vista**: los círculos llevan el número "puesto" como un monoplaza en miniatura; la tabla solo enseña la goma de tus dos coches; al lado de cada botón de goma nueva está la goma que llevas.
