# Investigación: Asfalto libre

**Fecha**: 2026-10-17 · **Spec**: [spec.md](spec.md)

## Punto de partida (lo que ya hay)

1. **El raíl es literal**: `race-screen.ts:drawTrackLayer` recorre el circuito con `strokeLoop(1.5, cssVar('--track-line'))` — una línea fina que sigue EXACTAMENTE el eje del sampler, de punta a punta, en los dos temas (`ui.css` la define en oscuro y claro). Nació como guía visual de las primeras fases; hoy, con coches encima, convierte el eje en raíl de scalextric.
2. **La lateral existe pero está capada** (spec 012): el offset pinta a `lateral × roadWidth × 0,34` con `roadWidth = 6,2 %` del lado menor. En 940 px: excursión máxima ±19,7 px sobre un semiancho de 29 px — y con radio de coche 15 px, el borde exterior del coche ya asoma. La geometría, no la matemática, limita el espectáculo.
3. **Las amplitudes internas también son tímidas**: deriva ±0,18 (poco viaje en recta), curva ×0,55 (interior poco marcado), batalla 0,75. El suavizado (τ 0,45 s) y la amarilla (×0,4) funcionan bien y no se tocan.
4. **El harness ya cubre los invariantes** (acotado, batallas a lados opuestos, amarilla sin batalla, convergencia): cambiar amplitudes no los rompe; sirven de red de seguridad tal cual.

## Opciones consideradas

### ¿Solo quitar la línea?

- **Solo quitarla**: barata, pero el ojo seguiría viendo un carril único en las rectas (deriva ±0,18 ≈ ±5 px reales). Se queda a medias del pedido ("y el coche se mueva por toda la pista"). Descartada.
- **Quitarla + ampliar recorrido (elegida)**: pide recalibrar tres cosas juntas — amplitudes internas, excursión pintada y la proporción calzada/coche — para que "toda la pista" quepa en el asfalto.

### ¿Cómo hace sitio la geometría?

El límite duro es `excursión + radio ≤ semiancho` (que el coche no viva fuera). Tres palancas: ensanchar calzada, afinar coche, subir la fracción de excursión. Se mueven las tres en proporción moderada: calzada 6,2 → 7,5 % (+21 %), radio 1,6 → 1,3 % (−19 %), fracción 0,34 → 0,42. Resultado en 940 px: semiancho 35, radio 12, excursión máx 29,6 — el typical queda dentro y solo el extremo transitorio roza el borde (aceptable: rozar bordes era el objetivo).

### ¿Riesgo del ensanche en trazados generados?

Los circuitos son bucles Catmull-Rom que llenan el lienzo; un ensanche puede cegar horquillas (el agujero interior tragado por asfalto). +21 % es conservador frente al salto, y la verificación incluye capturas de la vuelta completa. Si una horquilla se cegara, se bajaría a 7,0 % (el plan deja el número en un solo sitio).

### ¿Cómo se verifica "no hay línea" si la variable desaparece?

El composite de la vieja línea sobre asfalto es un gris muy reconocible (oscuro: rgba(230,237,243,0,35) sobre #30363d ≈ (112,118,125); claro: rgba(31,35,40,0,3) sobre #dfe4e9 ≈ (166,171,176)). El guion de verificación escanea el canvas por color con tolerancia estrecha y exige un recuento despreciable (el raíl entero son ~miles de píxeles; cualquier resto_saltarina lo delataría). El eje para medir la dispersión de coches se reconstruye SIN la línea: en cada fila del canvas, el punto medio de las rachas de color asfalto es el eje del trazado.

## Riesgos y mitigaciones

- **Coches colgando fuera en el extremo**: la fracción 0,42 (no 0,5) + coche afinado dejan el typical dentro; el máximo transitorio solo roza. Umbral SC-002 vigila que nadie viva fuera.
- **Horquilla cegada por el ensanche**: capturas de vuelta completa en los dos temas; palanca de repliegue documentada (7,0 %).
- **Regresión del harness**: amplitudes nuevas, mismos invariantes; si algo rompiera, el fallo es del ajuste, no de la estructura (red de seguridad a propósito).
- **Coste**: se ELIMINA un trazo de la capa offscreen; el rAF no cambia nada.
