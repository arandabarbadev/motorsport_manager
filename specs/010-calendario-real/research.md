# Investigación y decisiones: Calendario real y circuitos clásicos

**Fase 0** · 2026-10-11

## D1. Trazados reales también para los 5 nuevos

- **Decisión**: Nürburgring (`de-1927`), Estoril (`pt-1972`) y Kyalami (`za-1961`) del mismo repo fuente; Le Mans (Bugatti) y Jerez extraídos en vivo de OpenStreetMap (relación 2725877 y way 831985059) y convertidos con la misma herramienta.
- **Por qué**: la regla de la spec 005 (circuitos reconocibles, datos dentro del repo, cero dependencia en runtime) se mantiene; dibujar 5 circuitos a mano habría sido una traición.
- **Alternativas descartadas**: reutilizar trazados existentes renombrados (mentira visible); librería de circuitos en runtime (dependencia + offline).

## D2. Nordschleife como el circuito-brutalidad

- **Decisión**: Nürburgring usa el trazado largo histórico (20,8 km), 24 vueltas y el desgaste más alto del juego (1,35).
- **Por qué**: su forma serpenteante es la más reconocible del mundo y da personalidad extrema al verano europeo; la vuelta en juego dura lo mismo que las demás (el tiempo de vuelta es del motor, no de la distancia), así que 24 vueltas lo hacen "carrera de resistencia" sin romper el ritmo de la temporada.
- **Alternativas descartadas**: el trazado corto moderno (menos icónico); 60 vueltas (carrera el doble de larga que cualquier otra).

## D3. Ids por nombre, no por índice

- **Decisión**: los ids pasan de `track-N` a `gp-<slug>` (gp-melbourne, gp-nurburgring…); la tabla de ids viejos→nombres queda congelada para migrar.
- **Por qué**: esta feature reordena el calendario: con ids por índice, reordenar cambia el significado de los ids guardados otra vez; por nombre, reordenar es gratis para siempre.
- **Alternativas descartadas**: mantener índices y migrar por posición (frágil a la siguiente reordenación); ids por fecha (innecesario).

## D4. Migración conservadora de partidas

- **Decisión**: al cargar, el calendario se reconstruye con los 24 ids; los resultados migran por nombre de circuito y se ordenan por la nueva posición; los resultados de Cataluña se retiran del historial (dinero y campeonato acumulados intactos); la ronda en curso se conserva acotada.
- **Por qué**: lo pedido es cambiar el mapa, no borrar partidas; y lo jugado en Cataluña ya se cobró (lo retirado es la fila del historial, no la cartera ni los puntos ya sumados).
- **Alternativas descartadas**: borrar resultados antiguos (castigo); conservar la fila de Cataluña sin circuito (rompe pantallas).
