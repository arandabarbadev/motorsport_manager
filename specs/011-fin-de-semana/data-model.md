# Modelo de datos: Formato de fin de semana

**Fase 1** · 2026-10-11

## Entidad nueva: Evento del fin de semana (WeekendEvent)

`'quali' | 'sprint1' | 'sprint2' | 'race'` — orden fijo. Propiedades derivadas (módulo weekend):

| Evento | Vueltas | Puntos | Premios | Riesgo lluvia |
|---|---|---|---|---|
| quali | 3 | 0 | 0 | 0,4 × global |
| sprint1 / sprint2 | ⌈vueltas/4⌉ (mín 3) | 8-7-6-5-4-3-2-1 (top 8) | tabla × 0,25 | 0,4 × global |
| race | completas | 25-18-15-12-10-8-6-4-2-1 | tabla × 1 + liquidación | global |

Etiquetas: "Clasificación", "Sprint 1", "Sprint 2", "Carrera".

## Cambios en la entidad Resultado de temporada (SeasonResult)

| Campo nuevo | Tipo | Notas |
|---|---|---|
| evento | WeekendEvent | Migración: resultados sin evento → 'race' |

`standings` (ya existente) guarda la clasificación completa EN ORDEN: es la fuente para reconstruir la parrilla del evento siguiente.

## Estado derivado (no persistido)

- **Evento pendiente de la ronda en curso**: el primero de los cuatro sin resultado registrado para esa ronda.
- **Parrilla de un evento**: quali → ritmo esperado; sprints/carrera → orden de `standings` del evento anterior de la misma ronda.

## Reglas de integridad

- Guardia anti-repetición: por (ronda, evento) — un evento cobra una vez.
- Temporada completa: 24 resultados con evento = 'race'.
- Desbloqueo de patrocinadores (004): mejor puesto entre TODOS los eventos.
- Liquidación de patrocinio/gastos (004): una vez por ronda, en la carrera.

## Relación con las demás funciones

- 001: motor intacto (cada evento es una carrera con menos vueltas).
- 005: el calendario son ahora 24 fines de semana; el historial lista los actos.
- 004: premios por evento; bills en la carrera.
- 010: los ids estables hacen que los resultados por ronda+evento reordenen sin miedo.
