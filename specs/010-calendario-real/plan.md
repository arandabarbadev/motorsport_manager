# Plan de implementación: Calendario real y circuitos clásicos

**Rama**: `010-calendario-real` | **Fecha**: 2026-10-11 | **Spec**: [spec.md](spec.md)

**Entrada**: especificación de la función en `specs/010-calendario-real/spec.md`

## Resumen

Reordenar el calendario en cronología real, añadir 5 circuitos clásicos con trazados GPS reales (Nürburgring, Le Mans, Estoril, Jerez, Kyalami), quitar Cataluña (24 rondas), pasar los ids de circuito a por-nombre (estables) y migrar las partidas guardadas.

## Contexto técnico

**Lenguaje/Versión**: TypeScript; generación de trazados con la herramienta del repo (Node).

**Dependencias principales**: ninguna nueva. Datos: 3 trazados del repo fuente (bacinger/f1-circuits) + 2 extraídos de OpenStreetMap en vivo (relación 2725877 "Circuit Bugatti" y way 831985059 "Circuito de Jerez"), convertidos con `tools/convert-layouts.js`.

**Almacenamiento**: migración en la carga de la economía: ids viejos (por índice) → ids nuevos (por nombre) mediante la tabla congelada del calendario viejo.

**Testing**: `npm run tracks` (24 rondas, orden) + `npm run maps` + verificación en vivo (R1 Melbourne, carrera en un circuito nuevo) + migración sembrada.

**Plataforma objetivo**: navegador.

**Objetivos de rendimiento**: 24 circuitos generados al cargar (antes 20): coste inicial marginal.

**Restricciones**: los ids nuevos estables (`gp-<slug>`); el orden del calendario vive solo en la lista de perfiles.

**Escala/Alcance**: 24 perfiles; una tabla de migración congelada.

## El calendario nuevo (vive aquí)

| # | Circuito | Vueltas | km | Notas |
|---|---|---|---|---|
| 1 | Melbourne | 58 | 5,3 | Apertura |
| 2 | Kyalami | 68 | 4,5 | Clásico sudafricano de apertura |
| 3 | Yeda | 50 | 6,2 | |
| 4 | Suzuka | 53 | 5,8 | |
| 5 | Bakú | 51 | 6,0 | |
| 6 | Madrid | 55 | 5,5 | |
| 7 | Imola | 63 | 4,9 | |
| 8 | Mónaco | 78 | 3,3 | |
| 9 | Montreal | 70 | 4,4 | |
| 10 | Silverstone | 52 | 5,9 | |
| 11 | Le Mans | 80 | 4,2 | **Nuevo** (Bugatti) |
| 12 | Nürburgring | 24 | 20,8 | **Nuevo** (Nordschleife: deg 1,35, el más brutal) |
| 13 | Spa | 44 | 7,0 | |
| 14 | Hungría | 70 | 4,4 | |
| 15 | Zandvoort | 72 | 4,3 | |
| 16 | Monza | 53 | 5,8 | |
| 17 | Estoril | 70 | 4,2 | **Nuevo** |
| 18 | Singapur | 62 | 5,0 | |
| 19 | Jerez | 69 | 4,4 | **Nuevo** (deg 1,2) |
| 20 | Austin | 56 | 5,5 | |
| 21 | México | 71 | 4,3 | |
| 22 | Interlagos | 71 | 4,3 | |
| 23 | Las Vegas | 50 | 6,2 | |
| 24 | Yas Marina | 58 | 5,3 | Cierre |

## Constitution Check

| Principio / lección | Estado | Nota |
|---|---|---|
| I. Spec antes que código | ✔ | Spec aprobada antes del código del juego (los datos GPS son investigación) |
| II. Privacidad | ✔ | Datos públicos de circuitos |
| III. Sin dependencias | ✔ | Datos dentro del repo; cero dependencia en runtime |
| IV. Móvil primero | ✔ | Sin cambios de UI relevantes |
| V. Se entiende sin explicación | ✔ | Nombres reconocibles |
| VI. No perder datos | ✔ | Migración conserva progreso/economía; lo retirado es solo el historial del circuito desaparecido |
| VII. Requisito comprobable | ✔ | `npm run tracks` + quickstart |
| VIII. Todo en mi carpeta | ✔ | Todo en el repo local |
| IX. Evidencias | ✔ | Tabla impresa + verificación viva |
| L1/L2 | ✔ | N/A |

**Puerta: PASA.**

## Estructura del proyecto

### Documentación (esta función)

```text
specs/010-calendario-real/
├── plan.md · research.md · data-model.md · quickstart.md · tasks.md
└── checklists/requirements.md
```

### Código fuente y puntos de contacto

```text
tools/convert-layouts.js       # CALENDAR: 24 rondas en orden real (− Barcelona, + 5)
data/f1-circuits/*.geojson     # + de-1927, pt-1972, za-1961 (repo) y fr-1967, es-1986 (OSM)
src/real-layouts.ts            # regenerado (24 trazados)
src/tracks-generator.ts        # 24 perfiles en orden real + ids estables gp-<slug>
src/career.ts                  # migración de ids de circuito y calendario en loadCareer
```

## Seguimiento de complejidad

> Sin entradas: no hay violaciones que justificar.
