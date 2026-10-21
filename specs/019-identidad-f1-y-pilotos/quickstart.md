# Quickstart 019

1. `npm run build && npm run harness` — verde con los checks nuevos
   ("Pilotos check", "Dorsales check") y los viejos (Tracks, Weather).
2. `./node_modules/.bin/vite preview --port 4173 --strictPort` y abrir:
   modo local → Mi Equipo.
3. Comprobar a mano en 1 minuto:
   - El rojo del equipo tiñe botones/chips (cambia el color de librea y
     mira el botón "Carrera" cambiar en vivo).
   - Pestaña **Pilotos**: comprar una mejora de Ritmo baja el presupuesto
     y sube Ritmo y val.
   - Mi Equipo: dorsales 1-99 (prueba un dorsal ocupado: no lo acepta).
   - Ir a carrera: en "Mis boxes", la posición (P#) a la izquierda de la
     goma; la clasificación usa la fuente condensada en los números de
     posición; S rojo / M amarillo / H blanco / I verde / W azul.
   - Nada en MAYÚSCULAS; tarjetas rectas, botones redondeados.
4. En el móvil: push → GitHub Actions despliega → abrir con internet
   (cerrar del todo y reabrir si no aparece).
