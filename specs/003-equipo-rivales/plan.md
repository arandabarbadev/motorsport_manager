# Plan de implementación: Mi Equipo y la parrilla de rivales

**Rama**: `003-equipo-rivales` | **Fecha**: 2026-10-10 | **Spec**: [spec.md](spec.md)

**Entrada**: especificación de la función en `specs/003-equipo-rivales/spec.md`

## Resumen

Plan retrospectivo **sin cambios de código**: la plantilla (mi equipo + 9 rivales), las 9 categorías de desarrollo y el orden de salida ya existen y persisten. Se documentan los números de equilibrio y se verifican en código y en vivo.

## Contexto técnico

**Lenguaje/Versión**: TypeScript 5.9, módulos ES. Sin framework de UI (DOM directo).

**Dependencias principales**: ninguna nueva (motor de 001). Pila del proyecto: excepción documentada en el plan de 001.

**Almacenamiento**: `localStorage["f1manager:roster:v1"]` (plantilla completa en JSON); clave compartida con la sincronización (spec 006).

**Testing**: verificación en vivo (edición + recarga + compra de niveles) + lectura de código; la parrilla determinista del harness ejercita el mismo constructor de carrera.

**Plataforma objetivo**: navegador de escritorio y móvil.

**Tipo de proyecto**: pantalla de gestión del juego web monolítico.

**Objetivos de rendimiento**: guardado por escrito directo (sin lotes): la plantilla es pequeña (<100 KB).

**Restricciones**: sin claves ni datos personales en el guardado (II); guardado corrupto → parrilla nueva, economía intacta.

**Escala/Alcance**: 10 equipos × 2 pilotos = 20 coches; 9 categorías × 10 niveles de desarrollo.

## Números de equilibrio (viven aquí, no en la spec)

| Concepto | Valor | Dónde |
|---|---|---|
| Presupuesto inicial | 350 M€ (elección de Rafa) | roster.ts:18 |
| Stats iniciales de mis coches | aero/motor/chasis 65, fiabilidad 80 (rivales: 60-85 y 70-95) | roster.ts:55,113-118 |
| Desarrollo | 15 M€/punto (elección de Rafa), nivel máx 10, tope 95 por stat (fiabilidad 99) | roster.ts:52-54, race-builder.ts:55-61 |
| Stats de pilotos generados | ritmo 55-95, consistencia 50-95, agresividad 15-95, mojado 50-90, riesgo 10-90 | roster.ts:79-87 |
| Orden de salida | ritmo esperado = 60 % piloto + 40 % coche (el mismo peso que en carrera) | race-builder.ts:19-20 |

## Constitution Check

| Principio / lección | Estado | Nota |
|---|---|---|
| I. Spec antes que código | ✔ | Retrospectivo |
| II. Privacidad | ✔ | Nombres generados/editables por Rafa: nada personal se sube (los suyos, él los elige) |
| III. Sin dependencias | ✔ | DOM directo, nada nuevo |
| IV. Móvil primero | ✔ | Pestañas y formularios compactos (team-screen.css) |
| V. Se entiende sin explicación | ✔ | Etiquetas de campos y niveles visibles; botones "MÁX"/precio |
| VI. No perder datos | ✔ | "Generar parrilla" pide confirmación y conserva mi equipo; nombre vacío se restaura |
| VII. Requisito comprobable | ✔ | quickstart (editar, recargar, comprar) |
| VIII. Todo en mi carpeta | ✔ | specs/ en el repo local |
| IX. Evidencias | ✔ | Verificación viva con datos sembrados + código citado |
| L1 | ✔ | Clase `.hidden` con display:none |
| L2 | N/A | SW de la spec 007 |

**Puerta: PASA.**

## Estructura del proyecto

### Documentación (esta función)

```text
specs/003-equipo-rivales/
├── plan.md · research.md · data-model.md · quickstart.md · tasks.md
└── checklists/requirements.md
```

### Código fuente y puntos de contacto (sin cambios)

```text
src/roster.ts          # Plantilla: creación (mi equipo + 9 rivales), regeneración de rivales,
                      # 9 categorías de desarrollo, carga/guardado con migraciones
src/names-data.ts      # Listas de nombres y colores para generar rivales
src/team-screen.ts     # Pestañas "Mi Equipo" (identidad + desarrollo) y "Rivales" (editar/regenerar)
src/race-builder.ts    # Stats efectivos de mis coches (mejoras con tope) y orden de salida
src/storage-keys.ts    # Clave "f1manager:roster:v1"
```

## Seguimiento de complejidad

> Sin entradas: no hay violaciones que justificar (la pila del proyecto está justificada en el plan de 001).
