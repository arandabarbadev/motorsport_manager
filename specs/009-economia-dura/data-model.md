# Modelo de datos: Economía dura

**Fase 1** · 2026-10-11

Sin entidades nuevas ni migraciones: solo valores.

## Cambios de valores

| Entidad | Campo | Antes → Nuevo |
|---|---|---|
| Plantilla (003) | presupuesto inicial | 350 → **200 M€** |
| Desarrollo del coche (003) | nivel máximo | 10 → **15** |
| Desarrollo del coche (003) | coste por nivel | fijo 15 → **15 × nivel siguiente** (con descuento de ingenieros) |
| Personal de sede (004) | nivel máximo | 5 → **10** |
| Patrocinador (004) | catálogo | 100 → **150** (ids 0-99 intactos, 100-149 nuevos) |
| Patrocinador (004) | firmas a la vez | 5 → **8** |
| Patrocinador (004) | pago por carrera | 0,5-5,0 → **0,3-3,0 M€** |

## Migraciones

Ninguna necesaria: los máximos solo suben (los niveles guardados ≤ viejo máximo siguen válidos), los ids de patrocinadores firmados siguen existiendo y el dinero guardado no se toca.

## Relación con las demás funciones

- 003: precios por nivel en la pestaña Mi Equipo.
- 004: escalera de patrocinadores y resumen n/8; balance de carrera sin cambios.
- 013 (futuro): las partidas nuevas que se creen usarán el presupuesto nuevo.
