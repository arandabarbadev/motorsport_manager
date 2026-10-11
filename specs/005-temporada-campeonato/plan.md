# Plan de implementación: Temporada, calendario y campeonato

**Rama**: `005-temporada-campeonato` | **Fecha**: 2026-10-10 | **Spec**: [spec.md](spec.md)

**Entrada**: especificación de la función en `specs/005-temporada-campeonato/spec.md`

## Resumen

Plan retrospectivo **sin cambios de código**: los 20 circuitos reales, el calendario progresivo, los campeonatos y la pantalla de fin de temporada ya existen. Se documentan las decisiones de generación y se verifican con la tabla de circuitos impresa (`npm run tracks`) y el código.

## Contexto técnico

**Lenguaje/Versión**: TypeScript 5.9; generación de circuitos en tiempo de carga (módulo), sin build extra.

**Dependencias principales**: ninguna nueva. Trazados: datos ya convertidos en `src/real-layouts.ts` (fuente externa una vez, datos dentro del repo). Pila del proyecto: excepción documentada en el plan de 001.

**Almacenamiento**: el calendario y los resultados viven dentro de la economía (`f1manager:career:v1`, spec 004) como lista de ids de circuito y resultados por carrera.

**Testing**: `npm run tracks` (tabla de los 20 GPs) y `npm run maps` (trazados ASCII) por consola; resto, lectura de código y juego.

**Plataforma objetivo**: navegador de escritorio y móvil; Node 24 para los informes.

**Tipo de proyecto**: módulo de generación + pantallas del juego web monolítico.

**Objetivos de rendimiento**: los 20 circuitos se generan una vez al cargar el módulo (deterministas): coste inicial mínimo, cero en carrera.

**Restricciones**: ids estables (`track-0`…`track-19`) para que los calendarios guardados no se rompan; el generador NO se ejecuta con datos nuevos sin mantener los ids.

**Escala/Alcance**: 20 perfiles con números "cuasi reales" (vueltas y km reales aproximados; desgaste/boxes ajustados a mano).

## Constitution Check

| Principio / lección | Estado | Nota |
|---|---|---|
| I. Spec antes que código | ✔ | Retrospectivo |
| II. Privacidad | ✔ | Circuitos públicos, nombres de GPs reales |
| III. Sin dependencias | ✔ | Los datos GPS se convirtieron UNA vez con una herramienta del repo (`tools/convert-layouts.js`) y viven dentro: en runtime no hay dependencia externa |
| IV. Móvil primero | ✔ | Tablas y resumen compactos |
| V. Se entiende sin explicación | ✔ | Campeonato vacío explica; resumen se lee solo |
| VI. No perder datos | ✔ | Temporada nueva conserva dinero y mejoras; repetir carrera no descompasa el calendario |
| VII. Requisito comprobable | ✔ | quickstart + `npm run tracks` |
| VIII. Todo en mi carpeta | ✔ | specs/ y datos en el repo local |
| IX. Evidencias | ✔ | Tabla de circuitos impresa en la verificación |
| L1 | ✔ | Clase `.hidden` |
| L2 | N/A | SW de la spec 007 |

**Puerta: PASA.**

## Estructura del proyecto

### Documentación (esta función)

```text
specs/005-temporada-campeonato/
├── plan.md · research.md · data-model.md · quickstart.md · tasks.md
└── checklists/requirements.md
```

### Código fuente y puntos de contacto (sin cambios)

```text
src/tracks-generator.ts  # 20 perfiles + generación determinista (spline, normalización, ids estables)
src/real-layouts.ts      # Trazados GPS reales ya convertidos (generado)
src/championship.ts      # Puntos F1, puntuación de cada carrera, tablas acumuladas
src/season-screen.ts     # Resumen de temporada + contador + "Empezar temporada nueva"
src/team-screen.ts       # Pestaña "Campeonato" + botón de carrera con la ronda actual
src/race-screen.ts       # Avance del calendario al terminar + aviso de temporada completada
src/career.ts            # Calendario/resultados/número de temporada + isSeasonComplete
tools/convert-layouts.js # Conversión única de los GeoJSON de circuitos a real-layouts.ts
data/f1-circuits/        # Las trazas GPS de origen (OpenStreetMap vía bacinger/f1-circuits)
```

## Seguimiento de complejidad

> Sin entradas: no hay violaciones que justificar (la pila del proyecto está justificada en el plan de 001).
