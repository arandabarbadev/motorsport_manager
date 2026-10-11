# Modelo de datos: Calendario real y circuitos clásicos

**Fase 1** · 2026-10-11

## Cambios en la entidad Circuito (spec 005)

| Campo | Antes → Nuevo |
|---|---|
| id | `track-0`…`track-19` (índice) → **`gp-<slug>`** (por nombre, estable) |
| catálogo | 20 → **24** (+ Nürburgring, Le Mans, Estoril, Jerez, Kyalami; − Cataluña) |

Orden del calendario = orden de la lista de perfiles (cronología real; tabla en el plan).

## Migración de partidas guardadas (en la carga de la economía)

Tabla congelada del calendario VIEJO (índice → nombre), solo para migrar:

```text
track-0..19 = Melbourne, Yeda, Bakú, Madrid, Mónaco, Barcelona, Imola,
              Montreal, Silverstone, Spa, Hungría, Zandvoort, Monza,
              Singapur, Interlagos, México, Austin, Las Vegas, Suzuka, Yas Marina
```

Reglas:
- `track-N` → id nuevo del circuito con ese nombre; Barcelona → resultado retirado.
- Calendario: se reconstruye con los 24 ids nuevos.
- Resultados de temporada: re-mapeados y reordenados por posición en el calendario nuevo.
- Ronda en curso: se conserva, acotada a la longitud nueva.
- Economía y campeonato acumulado: intactos.

## Archivos de datos

```text
data/f1-circuits/            # 25 geojson (24 en uso + es-1991 Barcelona archivado)
  de-1927 (Nürburgring) · pt-1972 (Estoril) · za-1961 (Kyalami)   ← repo fuente
  fr-1967 (Le Mans) · es-1986 (Jerez)                              ← OpenStreetMap en vivo
  osm-*.xml                       # extractos OSM brutos de la extracción (origen)
```

## Relación con las demás funciones

- 005: calendario/resultados consumen los ids nuevos; sus pantallas no cambian.
- 011 (siguiente): el fin de semana se juega sobre estas 24 rondas.
