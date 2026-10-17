# Plan de implementación: Carrera viva

**Rama**: `012-carrera-viva` | **Fecha**: 2026-10-17 | **Spec**: [spec.md](spec.md)

**Entrada**: especificación de la función en `specs/012-carrera-viva/spec.md`

## Resumen

La carrera se ve viva: coches con posición lateral por el asfalto (batallas + trazada + deriva personal, solo en el render), incidentes del motor convertidos en sucesos visibles (anillo, texto flotante, feed "Dirección de carrera"), semáforo F1 de 5 luces al comenzar cada acto, y la lotería de lluvia global al 25 %.

## Contexto técnico

**Lenguaje/Versión**: TypeScript, sin dependencias nuevas.

**Dependencias principales**: motor (simulation.ts) intacto en su modelo de ritmo/posiciones; solo EMITE sucesos nuevos. La lateralidad es una capa nueva del render (racing-line.ts), pura y testeable.

**Almacenamiento**: NADA nuevo persistido. `RaceEvent` (transitorio, por tick) gana `'incident'` con `incidentKind`. La lateral y el semáforo viven en la pantalla.

**Testing**: build + harness (con autocomprobación de racing-line) + verificación en vivo por CDP (semáforo DOM, incidente forzado, píxeles del canvas).

**Plataforma objetivo**: navegador.

**Objetivos de rendimiento**: la lateral se calcula en el rAF ya existente (20 coches × matemática barata); sin capas nuevas de canvas.

**Restricciones**: FR-001 — el desplazamiento NO toca posiciones/huecos/adelantamientos del motor.

**Escala/Alcance**: 20 coches por carrera; feed recortado a ~8 líneas; textos flotantes ya limitados a 6.

## Números (viven aquí)

| Concepto | Valor |
|---|---|
| Riesgo lluvia carrera (antes 0,4) | **0,25** |
| Riesgo actos cortos | 0,25 × 0,4 = 0,10 (derivado, sin cambio de fórmula) |
| Ancho útil del asfalto para el coche | ±34 % del semiancho de calzada (`lateral` ∈ [−1, 1]) |
| Batalla (abrirse) | progreso total ajeno por delante a < 0,0035 |
| Peso de la curva en la trazada | interior con |curvatura| normalizada × 0,55 |
| Deriva personal | ±0,18 · seno lento (fase = hash del dorsal) |
| Suavizado lateral | exponencial, τ ≈ 0,45 s (cambio de lado ~1 s) |
| Amarilla | objetivo lateral × 0,4 (más en fila) |
| Parrilla | lados alternos estables por fila (par/impar por posición de parrilla) |
| Semáforo | 5 luces · 1 luz/650 ms · pausa aleatoria 400–1200 ms · "¡Luces fuera!" 900 ms |
| Feed dirección de carrera | máx 8 entradas, más nueva arriba |
| Destello incidente | anillo 1400 ms; texto flotante 1200 ms (como ya existe) |

## Constitution Check

| Principio / lección | Estado | Nota |
|---|---|---|
| I. Spec antes que código | ✔ | Spec aprobada (entrada literal de Rafa + decisión lluvia 25 %) |
| II. Privacidad | ✔ | Nada personal |
| III. Sin dependencias | ✔ | Canvas + matemática propia |
| IV. Móvil primero | ✔ | Semáforo y feed caben en el HUD compacto |
| V. Se entiende sin explicación | ✔ | Luces fuera = empieza; el feed cuenta lo que pasa |
| VI. No perder datos | ✔ | Nada persistido nuevo; carrera activa no se rompe (cambio visual) |
| VII. Requisito comprobable | ✔ | quickstart con comprobaciones en vivo |
| VIII. Todo en mi carpeta | ✔ | specs/ y código en el repo |
| IX. Evidencias | ✔ | CDP: semáforo, incidente forzado, píxeles laterales, build con 0,25 |
| L1/L2 | ✔ | N/A |

**Puerta: PASA.**

## Estructura del proyecto

### Documentación (esta función)

```text
specs/012-carrera-viva/
├── plan.md · research.md · data-model.md · quickstart.md · tasks.md
└── checklists/requirements.md
```

### Código fuente y puntos de contacto

```text
src/racing-line.ts (nuevo) # Lateral pura: objetivos por batalla/curva/deriva,
                           # suavizado exponencial, límites y alternancia de parrilla
src/types.ts               # RaceEvent gana 'incident' + incidentKind
src/simulation.ts          # runIncidents EMITE los sucesos (trompo/choque/avería)
src/race-builder.ts        # RAIN_RACE_CHANCE 0,4 -> 0,25
src/race-screen.ts         # Render lateral (normal del sampler), semáforo de salida,
                           # consumo de incidentes (anillo+texto), feed dirección carrera
src/race-screen.css        # .start-lights, .race-feed
src/test-harness.ts        # Autocomprobación de racing-line (invariantes deterministas)
```

## Seguimiento de complejidad

> Sin entradas: no hay violaciones que justificar.
