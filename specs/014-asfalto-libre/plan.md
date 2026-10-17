# Plan de implementación: Asfalto libre

**Rama**: `014-asfalto-libre` | **Fecha**: 2026-10-17 | **Spec**: [spec.md](spec.md)

**Entrada**: especificación de la función en `specs/014-asfalto-libre/spec.md`

## Resumen

El circuito deja de pintar su línea central (el "raíl de scalextric") y los coches pasan de ±34 % del ancho de calzada a recorrerlo prácticamente entero: deriva personal más amplia, curvas más interioranas y batallas más abiertas, sobre una calzada algo más ancha con coches algo más finos para que el recorrido quepa en el asfalto.

## Contexto técnico

**Lenguaje/Versión**: TypeScript, sin dependencias nuevas.

**Dependencias principales**: `racing-line.ts` (solo cambian constantes), `race-screen.ts` (drawTrackLayer, carScreenPoint, carRadius), `ui.css` (se van las variables `--track-line`). El motor (simulation.ts) y el sampler (track-path.ts) intactos.

**Almacenamiento**: NADA persistido; sin migraciones; aplica a cualquier evento en curso o nuevo.

**Testing**: build + harness (autocomprobación de racing-line sin cambios: los invariantes se mantienen) + verificación en vivo por CDP con muestreo de píxeles (raíl ausente, dispersión lateral, ambos temas).

**Plataforma objetivo**: navegador (escritorio y móvil).

**Objetivos de rendimiento**: mismos costes por frame (constantes y trazos; se ELIMINA un trazo del capa offscreen).

**Restricciones**: FR-002 — cosmético, motor intacto; FR-003 — sin coches estables fuera del asfalto.

**Escala/Alcance**: 20 coches; una capa offscreen que ya existe.

## Números (viven aquí)

| Concepto | Antes | Ahora |
|---|---|---|
| Línea central (`--track-line`) | trazo 1,5 px + variable en 2 temas | **eliminada** (trazo y variables) |
| Ancho de calzada | 6,2 % del lado menor del lienzo | **7,5 %** (semiancho ~35 px en 940) |
| Radio del coche | 1,6 % del lado menor (~15 px en 940) | **1,3 %** (~12 px) |
| Recorrido lateral pintado | ±0,34 × ancho de calzada | **±0,42** (~84 % del semiancho) |
| Deriva personal | ±0,18 a 0,25 rad/s | **±0,32 a 0,3 rad/s** |
| Peso de la curva (interior) | 0,55 | **0,8** |
| Empuje de batalla | 0,75 | **0,9** |
| Amarilla / suavizado / ventana batalla | ×0,4 · τ 0,45 s · 0,0035 | **sin cambios** |
| Borde y línea de meta | — | **sin cambios** (el meta escala con la calzada) |

Geometría de la que salen los números (lienzo 940 de lado menor): semiancho 35 px, radio 12 px, excursión máxima 0,42 × 70 ≈ 29,6 px → el borde del coche llega a ~42 px en el extremo (roza/sobresale un pelo del borde de 35 px solo en el máximo transitorio; el typical con |lateral| ≤ 0,7 queda dentro).

## Constitution Check

| Principio / lección | Estado | Nota |
|---|---|---|
| I. Spec antes que código | ✔ | Entrada literal de Rafa; números aquí |
| II. Privacidad | ✔ | Nada personal |
| III. Sin dependencias | ✔ | Canvas puro; se quita un trazo |
| IV. Móvil primero | ✔ | Porcentajes del lienzo: escalan solos |
| V. Se entiende sin explicación | ✔ | Pista sin raíl y coches que la usan |
| VI. No perder datos | ✔ | Nada persistido; partidas intactas |
| VII. Requisito comprobable | ✔ | quickstart + SC medibles por píxeles |
| VIII. Todo en mi carpeta | ✔ | specs/ y src/ en el repo |
| IX. Evidencias | ✔ | CDP: raíl ausente por color, dispersión ≥ umbrales, 2 temas, capturas |
| L1/L2 | ✔ | N/A |

**Puerta: PASA.**

## Estructura del proyecto

### Documentación (esta función)

```text
specs/014-asfalto-libre/
├── plan.md · research.md · data-model.md · quickstart.md · tasks.md
└── checklists/requirements.md
```

### Código fuente y puntos de contacto

```text
src/racing-line.ts  # amplitudes: deriva 0,32 · curva 0,8 · batalla 0,9 (amarilla/τ igual)
src/race-screen.ts  # drawTrackLayer sin línea central y calzada 7,5 %; carScreenPoint ±0,42;
                    # carRadius 1,3 %
src/ui.css          # adiós --track-line (oscuro y claro)
```

## Seguimiento de complejidad

> Sin entradas: no hay violaciones que justificar.
