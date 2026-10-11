# Investigación y decisiones: Carrera en vivo (pantalla 2D)

**Fase 0** · 2026-10-10

## D1. Canvas 2D a mano, sin librerías de render

- **Decisión**: dibujar el trazado y los coches en Canvas 2D nativo; nada de motores de juegos ni SVG.
- **Por qué**: 20 puntos sobre una línea curva no necesita más; Canvas va sobrado incluso en móviles y no añade peso (III).
- **Alternativas descartadas**: SVG (más lento moviendo 20 nodos por fotograma); librería de juegos (desproporcionado, contra III).

## D2. La pista se pinta una vez; los coches, cada fotograma

- **Decisión**: el circuito (asfalto, bordes, línea de meta) se dibuja en un lienzo fuera de pantalla y solo se copia; cada fotograma se borra, se copia la capa y se pintan coches y efectos.
- **Por qué**: la pista es estática durante la carrera: repintarla 60 veces por segundo es tirar CPU; y al cambiar de tema solo se regenera esa capa.
- **Alternativas descartadas**: pintar todo cada fotograma (coste innecesario en móvil).

## D3. Sombra del tick anterior para movimiento fluido

- **Decisión**: la pantalla guarda, solo en su capa, la posición del tick anterior de cada coche e interpola con el tiempo transcurrido (alpha = t/tick). El estado del motor queda intacto.
- **Por qué**: a 200 ms por tick los saltos se ven a sacudidas; la interpolación da fluidez sin contaminar el motor (regla 2).
- **Alternativas descartadas**: bajar el tick (más CPU de simulación); mover coches con estado propio en el render (rompería la separación motor/render).

## D4. Tick en interval propio, HUD a 5 Hz

- **Decisión**: `setInterval` de 200 ms para el tick; el bucle de animación solo lee; el HUD y la cabecera se refrescan cada 200 ms, y la tabla se reordena re-colgando las filas existentes.
- **Por qué**: desacopla simulación de pintado (reglas 1-2) y evita machacar el DOM 60 veces por segundo para datos que el ojo lee a 5.
- **Alternativas descartadas**: tick dentro del rAF (la simulación dependería del refresco del monitor).

## D5. Los efectos nacen de los eventos del motor

- **Decisión**: destellos (anillos ~0,9 s) y textos flotantes solo para lo que el motor declara en su lista de eventos del tick; los textos con nombre solo para mis coches; lista limitada a los 6 más recientes.
- **Por qué**: la pantalla no reinterpreta la carrera (regla 2): si el motor no lo dice, no pasó. Limitar evita acumulaciones en carreras caóticas.
- **Alternativas descartadas**: deducir adelantamientos comparando posiciones en el render (duplicaría lógica del motor y se desincronizaría).

## D6. Órdenes de boxes por la cola del motor, con confirmación visual

- **Decisión**: los botones de goma llaman a la cola del motor; el panel marca "Entra en boxes al cruzar meta…" y, durante la parada, la cuenta atrás; los botones se deshabilitan al terminar, en pausa o con el coche fuera.
- **Por qué**: una sola vía de escritura al motor (regla 3); el jugador siempre sabe si su orden está viva.
- **Alternativas descartadas**: parada instantánea al pulsar (congela el coche en mitad de la pista).

## D7. Velocidades y arranque a 1x

- **Decisión**: multiplicadores 1x/5x/10x/20x (segundos simulados por tick de 200 ms); cada carrera nueva arranca a 1x.
- **Por qué**: 1x ≈ carrera 5 veces más rápida que real (~15 min): legible para empezar; 20x para cuando solo importa el resultado. Arrancar lento deja leer la parrilla.
- **Alternativas descartadas**: empezar a 10x como el motor por defecto (desconcertante al entrar).

## D8. Tras la bandera a cuadros, se cierra la caja

- **Decisión**: al terminar, la carrera se pausa, los controles se deshabilitan y solo queda el panel de resultados (con salida a gestión o a temporada si era la última).
- **Por qué**: la carrera ya cobró y contó (spec 004); permitir repetirla gratis abriría la puerta a farmear premios.
- **Alternativas descartadas**: dejar correr/repertir tras el final (duplicaría premios o mentiría con el calendario).
