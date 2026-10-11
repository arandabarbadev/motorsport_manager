# Modelo de datos: Carrera en vivo (pantalla 2D)

**Fase 1** · 2026-10-10

Lee el estado de carrera de la spec 001; no crea entidades persistentes. Solo tiene estado efímero de pintado.

## Estado propio de la pantalla (efímero, se reconstruye al entrar o reiniciar)

| Dato | Para qué |
|---|---|
| Sombra del tick anterior (por piloto: vuelta + progreso) | Interpolar el movimiento fluido entre ticks |
| Instante del último tick | Calcular el alpha de la interpolación |
| Reloj de carrera (s acumuladas) | Cabecera (no persiste: es de esta carrera visual) |
| Bandera de terminada / premios cobrados | Congelar controles y no pagar dos veces (con la red de 004) |
| Órdenes pendientes (conjunto de pilotos) | Pintar "entra al cruzar meta…" en el panel de boxes |
| Resaltados hasta (por piloto) y textos flotantes | Efectos nacidos de los eventos del motor |

## Cacheado de dibujo

- **Lienzo de pista fuera de pantalla**: trazado pintado una vez (asfalto/bordes/línea de meta) con los colores del tema activo; se regenera al cambiar tamaño o tema.
- **Vista (escala y centrado)**: ajuste del circuito al lienzo con margen, recalculado al redimensionar.
- **Muestreador del trazado**: el mismo código del motor (track-path.ts) convierte progreso de vuelta en punto x,y.

## Lo que escribe fuera de la pantalla

- **Órdenes de boxes**: por la cola del motor (spec 001, FR-004). Única escritura durante la carrera.
- **Al terminar**: los premios y el resultado de la carrera los registra la pantalla de carrera en la economía (spec 004) y el calendario avanza (spec 005). Aquí solo se dispara.

## Relación con las demás funciones

- Motor (001): lee el estado y sus eventos; escribe solo órdenes de boxes.
- Economía (004): panel de resultados con premios y balance.
- Temporada (005): botón al resumen de temporada si era la última carrera.
- Tema (007): la capa de pista repinta con los colores del tema activo.
