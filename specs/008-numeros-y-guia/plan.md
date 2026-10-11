# Plan de implementación: Dorsales visibles y guía de primera vez

**Rama**: `008-numeros-y-guia` | **Fecha**: 2026-10-10 | **Spec**: [spec.md](spec.md)

**Entrada**: especificación de la función en `specs/008-numeros-y-guia/spec.md`

## Resumen

Dos mejoras de acceso: dorsales 1-20 asignados en la plantilla y dibujados sobre los puntos en carrera (y en la tabla), y tarjetas de guía de primera vez en las tres pantallas clave, con marca por navegador.

## Contexto técnico

**Lenguaje/Versión**: TypeScript 5.9, DOM/Canvas, sin dependencias nuevas.

**Dependencias principales**: ninguna (spec 001/002/003 existentes).

**Almacenamiento**: dorsal dentro del piloto de la plantilla (`f1manager:roster:v1`); marca de guías en `f1manager:tutorial:v1` (por navegador, no viaja a la nube).

**Testing**: verificación en vivo (build + Chrome headless): dorsales en canvas y tabla, guías aparecen una vez; escala de grises para la prueba de daltonismo.

**Plataforma objetivo**: navegador de escritorio y móvil.

**Tipo de proyecto**: cambios en pantallas del juego web monolítico.

**Objetivos de rendimiento**: el dorsal se dibuja en el mismo pase que el coche (cero pases extra); la guía es DOM estático.

**Restricciones**: contraste del dorsal garantizado (borde oscuro + texto claro); la guía nunca bloquea (Constitución V).

**Escala/Alcance**: 20 dorsales; 3 guías.

## Constitution Check

| Principio / lección | Estado | Nota |
|---|---|---|
| I. Spec antes que código | ✔ | Spec aprobada antes de implementar |
| II. Privacidad | ✔ | Nada personal |
| III. Sin dependencias | ✔ | Canvas y DOM puro |
| IV. Móvil primero | ✔ | Dorsal escala con el punto; guías táctiles |
| V. Se entiende sin explicación | ✔ | Es literalmente esta feature (guías + identificación) |
| VI. No perder datos | ✔ | Dorsales con migración; guías solo marcan |
| VII. Requisito comprobable | ✔ | quickstart con captura en grises |
| VIII. Todo en mi carpeta | ✔ | specs/ y código en el repo local |
| IX. Evidencias | ✔ | Capturas y verificación en vivo |
| L1 | ✔ | Clase `.hidden` |
| L2 | ✔ | N/A (SW intacto) |

**Puerta: PASA.**

## Estructura del proyecto

### Documentación (esta función)

```text
specs/008-numeros-y-guia/
├── plan.md · research.md · data-model.md · quickstart.md · tasks.md
└── checklists/requirements.md
```

### Código fuente y puntos de contacto

```text
src/types.ts        # Driver.number: dorsal 1-20
src/roster.ts       # asignación de dorsales al crear/regenerar + migración en la carga
src/race-screen.ts  # dorsal sobre el punto (con contraste) y en las filas de clasificación
src/team-screen.ts  # guía de primera vez (Mi Equipo y Patrocinadores)
src/race-screen.css / team-screen.css  # estilos de la tarjeta de guía
src/guide.ts        # (nuevo) helper: marca por navegador + tarjeta de guía reutilizable
```

## Textos de las guías (viven aquí)

- **Mi Equipo**: "Este es tu equipo: nombre, color y pilotos arriba · El dinero se gasta en dos sitios: desarrollar el coche (aquí) o la sede · Tu coche sale peor que los rivales: cada mejora cuenta · El botón Carrera te lleva al GP que toca."
- **Carrera/Boxes**: "La carrera corre sola: pausa y velocidades arriba · Tus paradas se ordenan en 'Mis boxes': elige goma y entrará al cruzar meta · La tabla muestra hueco, goma y desgaste de los 20 · Los dorsales identifican cada coche sin colores."
- **Patrocinadores**: "Hasta 8 patrocinadores a la vez · Los mejores pagan más pero exigen resultados (P1-P20) · Cada carrera cobras sus pagos, menos sueldos y alquiler · Sin resultados solo firmas los peores: corre y vuelve."

## Seguimiento de complejidad

> Sin entradas: no hay violaciones que justificar.
