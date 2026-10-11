# Plan de implementación: Economía dura

**Rama**: `009-economia-dura` | **Fecha**: 2026-10-11 | **Spec**: [spec.md](spec.md)

**Entrada**: especificación de la función en `specs/009-economia-dura/spec.md`

## Resumen

Ajuste de equilibrio sin entidades nuevas: coste creciente por nivel en desarrollo y sede, más niveles en ambos, presupuesto inicial 200 M€, 150 patrocinadores con hasta 8 firmas y pagos 0,3-3 M€.

## Contexto técnico

**Lenguaje/Versión**: TypeScript 5.9, sin dependencias nuevas.

**Dependencias principales**: ninguna (specs 003/004 existentes).

**Almacenamiento**: sin cambios de formato (los valores viven en las constantes y en las partidas guardadas); las partidas viejas migran solas porque los máximos solo suben.

**Testing**: build + verificación viva (precios crecientes, catálogo 150, /8, 200 M€) + cálculo manual del precio por nivel.

**Plataforma objetivo**: navegador.

**Objetivos de rendimiento**: sin cambios.

**Restricciones**: los ids de patrocinadores existentes siguen siendo válidos (solo se añaden al final); el cap de stats del coche no cambia.

**Escala/Alcance**: constantes + textos de botones.

## Números de equilibrio (cambios)

| Concepto | Antes | Nuevo | Dónde |
|---|---|---|---|
| Presupuesto inicial | 350 M€ | **200 M€** | roster.ts (INITIAL_BUDGET) |
| Niveles de desarrollo | 10 | **15** | roster.ts (DEV_MAX_LEVEL) |
| Coste por nivel de desarrollo | 15 M€ fijo | **15 × nivel siguiente** (15, 30, 45… 225; descuento de ingenieros encima) | team-screen.ts |
| Niveles de sede | 5 | **10** | career.ts (STAFF_MAX_LEVEL) |
| Coste de sede | 30 × nivel actual | igual (30…270) | career.ts |
| Patrocinadores | 100 | **150** | sponsors.ts |
| Firmas a la vez | 5 | **8** | sponsors.ts |
| Paga por carrera | 0,5-5 M€ | **0,3-3 M€** | sponsors.ts |

Nota de diseño: las parejas de categorías que suman al mismo stat (aero+alerones, motor+electrónica) con 15+15 niveles llegan justas al cap de 95 desde 65 — máximo alcanzable pero caro.

## Constitution Check

| Principio / lección | Estado | Nota |
|---|---|---|
| I. Spec antes que código | ✔ | Spec aprobada (decisiones de Rafa 2026-10-11) |
| II. Privacidad | ✔ | Nada personal |
| III. Sin dependencias | ✔ | Constantes y textos |
| IV. Móvil primero | ✔ | Sin cambios de layout |
| V. Se entiende sin explicación | ✔ | El botón muestra el precio del siguiente nivel |
| VI. No perder datos | ✔ | Partidas guardadas intactas (solo máximos suben; ids de patrocinadores estables) |
| VII. Requisito comprobable | ✔ | quickstart con cuentas a mano |
| VIII. Todo en mi carpeta | ✔ | specs/ y código en el repo |
| IX. Evidencias | ✔ | Verificación viva con precios y recuento leídos del DOM |
| L1/L2 | ✔ | N/A |

**Puerta: PASA.**

## Estructura del proyecto

### Documentación (esta función)

```text
specs/009-economia-dura/
├── plan.md · research.md · data-model.md · quickstart.md · tasks.md
└── checklists/requirements.md
```

### Código fuente y puntos de contacto

```text
src/roster.ts      # INITIAL_BUDGET 200, DEV_MAX_LEVEL 15, coste por nivel (helper)
src/career.ts      # STAFF_MAX_LEVEL 10
src/sponsors.ts    # 150, MAX 8, pagos 0,3-3
src/team-screen.ts # precio por nivel en los botones de desarrollo, resumen /8, texto del reinicio
```

## Seguimiento de complejidad

> Sin entradas: no hay violaciones que justificar.
