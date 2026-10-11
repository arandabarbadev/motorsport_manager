# Plan de implementación: Carrera en vivo (pantalla 2D)

**Rama**: `002-pantalla-carrera` | **Fecha**: 2026-10-10 | **Spec**: [spec.md](spec.md)

**Entrada**: especificación de la función en `specs/002-pantalla-carrera/spec.md`

## Resumen

Plan retrospectivo **sin cambios de código**: el render Canvas, el HUD, las paradas del jugador y los controles ya existen y funcionan en producción (escritorio y móvil). Se documentan las decisiones de pintado y se verifican leyendo el código y jugando.

## Contexto técnico

**Lenguaje/Versión**: TypeScript 5.9 + Canvas 2D nativo. Sin librerías de render ni de animación.

**Dependencias principales**: ninguna nueva (motor de la spec 001). Pila del proyecto: excepción documentada en el plan de 001.

**Almacenamiento**: ninguno propio; al terminar la carrera escribe en la economía persistente (spec 004).

**Testing**: verificación en vivo (jugar una carrera: órdenes de boxes, velocidades, banderas) + lectura de código.

**Plataforma objetivo**: navegador de escritorio y móvil; lienzo adaptado a devicePixelRatio.

**Tipo de proyecto**: pantalla del juego web monolítico.

**Objetivos de rendimiento**: animación fluida (rAF); capa de pista pre-renderizada fuera de pantalla (se repinta solo al cambiar tema o tamaño); HUD a ~5 Hz para no machacar el DOM.

**Restricciones**: reglas fijas 1-3 (tick propio a 200 ms, render solo lee, órdenes por cola); un intervalo y un rAF por pantalla, limpios al reconstruir.

**Escala/Alcance**: una pantalla; 20 coches; 200 ms por tick (constante de sensación de juego).

## Constitution Check

| Principio / lección | Estado | Nota |
|---|---|---|
| I. Spec antes que código | ✔ | Retrospectivo |
| II. Privacidad | ✔ | Nada personal |
| III. Sin dependencias | ✔ | Canvas nativo; nada nuevo |
| IV. Móvil primero | ✔ | Layout compacto en móvil (race-screen.css), lienzo responsivo |
| V. Se entiende sin explicación | ✔ | Botones con texto; estados con etiquetas ("líder", "DNF", "BOX 3s") |
| VI. No perder datos | ✔ | "Nueva carrera" no borra nada persistente; salir no cobra ni pierde |
| VII. Requisito comprobable | ✔ | quickstart jugable |
| VIII. Todo en mi carpeta | ✔ | specs/ en el repo local |
| IX. Evidencias | ✔ | Código citado + partida en vivo |
| L1 | ✔ | La pantalla oculta overlays con la clase `.hidden` (display:none) |
| L2 | N/A | SW de la spec 007 |

**Puerta: PASA.**

## Estructura del proyecto

### Documentación (esta función)

```text
specs/002-pantalla-carrera/
├── plan.md · research.md · data-model.md · quickstart.md · tasks.md
└── checklists/requirements.md
```

### Código fuente y puntos de contacto (sin cambios)

```text
src/race-screen.ts    # La pantalla completa: lienzo + HUD + panel de boxes +
                      # controles + overlay de resultados + efectos de eventos
src/race-screen.css   # Layout (pista + HUD lateral), compactación móvil, banderas
src/track-path.ts     # Spline del trazado (compartido con el motor, spec 001)
src/theme.ts          # La capa de pista repinta al cambiar de tema (spec 007)
src/screen-transition.ts  # Fundido de entrada/salida (spec 007)
```

## Seguimiento de complejidad

> Sin entradas: no hay violaciones que justificar (la pila del proyecto está justificada en el plan de 001).
