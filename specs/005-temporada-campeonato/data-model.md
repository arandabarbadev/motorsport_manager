# Modelo de datos: Temporada, calendario y campeonato

**Fase 1** · 2026-10-10

## Entidad: Circuito (Track) — generada, no persistida

| Campo | Tipo | Notas |
|---|---|---|
| id | `track-0`…`track-19` | Estable: el calendario guardado depende de él |
| nombre | texto | Los 20 GPs de la temporada (Melbourne → Yas Marina) |
| vueltas totales | número | 44 (Spa) a 78 (Mónaco) |
| trazado | puntos x,y 0..1 | Traza GPS real suavizada y normalizada |
| dificultad de adelantamiento | 0,2-0,9 | Derivada de lo trabado del trazado |
| factor de desgaste | 0,7-1,3 | Cuánto castiga las gomas |
| pérdida en boxes (s) | 19-25 | El tiempo de la parada en ese circuito |

Los 20 circuitos se generan deterministas al arrancar (misma lista siempre); `data/f1-circuits/` guarda las trazas de origen y `tools/convert-layouts.js` fue la conversión única.

## Entidad: Calendario y progreso (dentro de la economía, spec 004)

| Campo | Tipo | Notas |
|---|---|---|
| calendario | lista de ids de circuito | 20 rondas en orden fijo |
| ronda actual | 0..19 | Sube una vez por carrera registrada |
| número de temporada | 1… | Sube con "Empezar temporada nueva" |
| temporada completa | calculado | resultados ≥ calendario |

## Entidad: Resultado de temporada (SeasonResult) — por carrera registrada

| Campo | Tipo | Notas |
|---|---|---|
| circuito | id | A qué ronda se refiere |
| mejor puesto mío | 1..20 | El mejor de mis dos coches |
| premio total | M€ | Suma de mis dos coches (spec 004) |
| puntuación de la carrera | lista | Puntos de los 20 pilotos (id piloto, equipo, puntos) |

## Entidad: Tablas de campeonato (calculadas, no persistidas)

- **Pilotos**: cada piloto con sus puntos acumulados de la temporada, ordenados.
- **Constructores**: cada equipo con la suma de sus dos pilotos, ordenados.
- Se recomputan desde los resultados guardados cada vez que se pintan.

## Relación con las demás funciones

- Motor (001): consume vueltas, desgaste, boxes y dificultad de cada circuito.
- Carrera en vivo (002): dibuja el trazado de esta entidad.
- Economía (004): comparten la misma entidad persistente (presupuesto + temporada); el premio de cada resultado es de la economía.
- Sincronización (006): viaja dentro de la economía, siempre junta.
