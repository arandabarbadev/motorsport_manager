# Plan de implementación: Motor de simulación de carrera

**Rama**: `001-motor-carrera` | **Fecha**: 2026-10-10 | **Spec**: [spec.md](spec.md)

**Entrada**: especificación de la función en `specs/001-motor-carrera/spec.md`

## Resumen

Plan retrospectivo **sin cambios de código**: el motor ya existe, corre sin interfaz y se valida con el banco de pruebas por consola. Se documentan sus reglas fijas (arquitectura en 4 reglas del README) y se verifica con la salida real del harness.

## Contexto técnico

**Lenguaje/Versión**: TypeScript 5.9 (módulos ES), compilado con `tsc` para el harness y con Vite 7 para la web. Sin framework de UI.

**Dependencias principales**: ninguna para esta función (motor puro: solo tipos propios y `Math.random`). Véase Seguimiento de complejidad para la pila del proyecto.

**Almacenamiento**: ninguno; el motor es puro y solo manipula el estado en memoria. La persistencia es de otras specs (003-005).

**Testing**: banco de pruebas sin interfaz (`npm run harness`): parrilla determinista (semilla fija), carrera completa, tabla final, correlación de Spearman ritmo↔posición y registro de paradas. También `npm run tracks` (spec 005).

**Plataforma objetivo**: navegador (escritorio y móvil) y Node 24 para el harness.

**Tipo de proyecto**: juego web monolítico (Vite) con núcleo de simulación independiente de la UI.

**Objetivos de rendimiento**: una carrera de 40 vueltas y 20 coches en <500 ticks a 10x (493 ticks reales en la verificación).

**Restricciones**: las 4 reglas fijas de arquitectura (abajo); tick agnóstico de UI (FR-011).

**Escala/Alcance**: 20 coches por carrera; constantes de equilibrio documentadas en el código como valores iniciales aprobados por el jugador.

## Constitution Check

| Principio / lección | Estado | Nota |
|---|---|---|
| I. Spec antes que código | ✔ | Retrospectivo: el código es anterior a la constitución; esta spec lo documenta (FR-011 recoge la regla nº 1) |
| II. Privacidad | ✔ | Nada personal: nombres ficticios generados |
| III. Sin dependencias | ⚠ | Ver Seguimiento de complejidad (excepción de pila, anterior a la constitución) |
| IV. Móvil primero | ✔ | El motor es invisible; su coste corre en un navegador de móvil sin problema |
| V. Se entiende sin explicación | ✔ | El harness imprime una tabla legible por cualquiera |
| VI. No perder datos | N/A | El motor no persiste nada |
| VII. Requisito comprobable | ✔ | quickstart: harness + lectura de constantes |
| VIII. Todo en mi carpeta | ✔ | specs/ en el repo local |
| IX. Evidencias | ✔ | Salida del harness pegada en la verificación de tareas |
| L1 | ✔ | No aplica al motor (sin DOM); la app usa la clase `.hidden` con display:none (ui.css:66) |
| L2 | N/A | Sin service worker aquí (spec 007) |

**Puerta: PASA** (con la excepción documentada de la pila).

## Reglas fijas de arquitectura (del README, vinculantes para todas las specs)

1. `simulationTick` es agnóstico de UI y de render: no importa Canvas ni frameworks, solo lee y escribe el estado de carrera.
2. El tick corre en un intervalo propio, desacoplado del render; el render solo LEE.
3. Las paradas del jugador se encolan (`queuePitCommand`) y se aplican al inicio del siguiente tick, nunca a mitad de uno.
4. La IA de boxes usa la función de utilidad ponderada `computePitScore`.

## Estructura del proyecto

### Documentación (esta función)

```text
specs/001-motor-carrera/
├── plan.md · research.md · data-model.md · quickstart.md · tasks.md
└── checklists/requirements.md
```

### Código fuente y puntos de contacto (sin cambios)

```text
src/types.ts          # Contrato de datos del motor (RaceState, RaceCarState, Driver, Car,
                      # Track, TyreState, PitCommand, RaceEvent)
src/simulation.ts     # El motor: simulationTick, computePace, computeWearRate,
                      # computePitScore, incidentes/banderas, clima, posiciones y huecos
src/track-path.ts     # Matemática pura: spline Catmull-Rom cerrada con parametrización
                      # por longitud de arco (lapProgress 0..1 → punto x,y)
src/rng.ts            # Generador con semilla (parrillas deterministas del harness)
src/test-grid.ts      # Parrilla de prueba determinista (10 equipos × 2)
src/test-harness.ts   # Carrera sin UI + informe + Spearman + registro de paradas
```

## Seguimiento de complejidad

| Violación | Por qué es necesaria | Alternativa más simple descartada porque |
|---|---|---|
| III — Pila TypeScript + Vite + npm (anterior a la constitución, fases 1-7 del juego) | El juego nació como proyecto de aprendizaje de TypeScript con build de producción y PWA; Rafa la eligió y aprobó antes de ratificar la constitución (2026-10-04) | JS puro sin build: obligaría a reescribir ~4.600 líneas que ya funcionan y a perder los tipos, que son el contrato motor/UI de la regla nº 1 |
| III — Dependencia `firebase` (solo specs 006-007) | Sincronización en la nube pedida por Rafa; se carga en diferido para no pesar el primer arranque. Excepción equivalente a la ya documentada en mi-semana spec 006 | Servidor propio: mantenimiento y coste para un juego personal; localStorage solo: no hay partida entre dispositivos |
