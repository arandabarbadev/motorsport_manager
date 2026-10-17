# Plan de implementación: Formato de fin de semana

**Rama**: `011-fin-de-semana` | **Fecha**: 2026-10-11 | **Spec**: [spec.md](spec.md)

**Entrada**: especificación de la función en `specs/011-fin-de-semana/spec.md`

## Resumen

Cada ronda pasa a ser un fin de semana de 4 eventos (Clasificación → Sprint 1 → Sprint 2 → Carrera) con parrillas encadenadas, puntos sprint (top 8) y premios al 25 %, liquidación única de patrocinio y gastos en la carrera, y reanudación del evento pendiente al volver.

## Contexto técnico

**Lenguaje/Versión**: TypeScript, sin dependencias nuevas.

**Dependencias principales**: motor (001) intacto — cada evento ES una carrera con menos vueltas y parrilla inicial dada.

**Almacenamiento**: `SeasonResult` gana el campo `evento` ('quali' | 'sprint1' | 'sprint2' | 'race'); migración: sin campo → 'race'. El evento pendiente se DERIVA de los resultados (sin campo nuevo de estado): la ronda en curso va al primer evento sin registrar.

**Testing**: build + harness (motor intacto) + verificación en vivo de una ronda completa acelerada.

**Plataforma objetivo**: navegador.

**Objetivos de rendimiento**: sin cambios (cada evento es una carrera como las de ahora).

**Restricciones**: la guardia anti-doble-cobro pasa a ser por (ronda, evento); las CARRERAS completan temporada.

**Escala/Alcance**: 24 rondas × 4 eventos = 96 resultados por temporada como mucho.

## Números (viven aquí)

| Concepto | Valor |
|---|---|
| Vueltas de clasificación | 3 |
| Vueltas de sprint | ⌈vueltas de carrera / 4⌉ (mínimo 3) |
| Puntos sprint (top 8) | 8-7-6-5-4-3-2-1 |
| Puntos carrera | 25-18-15-12-10-8-6-4-2-1 (igual que siempre) |
| Premio sprint | tabla de carrera × 0,25 (redondeado), por coche |
| Premio clasificación | 0 |
| Riesgo de lluvia | carrera: el global; clasificación/sprints: 40 % del global |
| Parrilla | quali: ritmo esperado · resto: clasificación del evento anterior |

## Constitution Check

| Principio / lección | Estado | Nota |
|---|---|---|
| I. Spec antes que código | ✔ | Spec aprobada (decisión "todo puntúa" de Rafa) |
| II. Privacidad | ✔ | Nada personal |
| III. Sin dependencias | ✔ | Motor existente |
| IV. Móvil primero | ✔ | Mismos controles por evento |
| V. Se entiende sin explicación | ✔ | Cada evento se titula en cabecera y el botón dice qué toca |
| VI. No perder datos | ✔ | Migración conservadora; reanudación por derivación |
| VII. Requisito comprobable | ✔ | quickstart con ronda entera |
| VIII. Todo en mi carpeta | ✔ | specs/ y código en el repo |
| IX. Evidencias | ✔ | Ronda completa verificada en vivo |
| L1/L2 | ✔ | N/A |

**Puerta: PASA.**

## Estructura del proyecto

### Documentación (esta función)

```text
specs/011-fin-de-semana/
├── plan.md · research.md · data-model.md · quickstart.md · tasks.md
└── checklists/requirements.md
```

### Código fuente y puntos de contacto

```text
src/weekend.ts (nuevo)   # Orden de eventos, distancias, etiquetas, puntos sprint,
                         # factor de premios, evento pendiente y parrilla derivada
src/types.ts             # Tipo de evento del fin de semana
src/career.ts            # SeasonResult.evento + migración + isSeasonComplete (carreras)
src/race-builder.ts      # buildRaceStateFromRoster(evento, parrilla inicial opcional)
src/race-screen.ts       # Título por evento, panel por evento, botón "Continuar a X",
                         # liquidación (patrocinio+gastos) SOLO en la carrera
src/team-screen.ts       # Botón con el evento pendiente ("Sprint 2 · R3: Monza")
src/season-screen.ts     # Historial: fila por evento con etiqueta de ronda+acto
src/main.ts              # showRaceScreen deriva evento+parrilla y re-entra al continuar
```

## Seguimiento de complejidad

> Sin entradas: no hay violaciones que justificar.
