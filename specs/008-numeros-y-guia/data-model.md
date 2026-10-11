# Modelo de datos: Dorsales visibles y guía de primera vez

**Fase 1** · 2026-10-10

## Cambios en entidades existentes

### Piloto (Driver) — spec 003

| Campo nuevo | Tipo | Notas |
|---|---|---|
| dorsal | 1-20 | Asignado al crear/regenerar la plantilla (jugador: 1-2; rivales: 3-20); persiste con la plantilla; migración de plantillas viejas por posición |

### Coche en carrera (RaceCarState) / render — spec 001/002

Sin cambios de modelo: el render resuelve el dorsal por `driverId` (ya lookup existente). La fila de clasificación pinta el dorsal junto al nombre.

## Entidad nueva: Guía de pantalla (efímera + marca)

| Dato | Dónde | Notas |
|---|---|---|
| marca "ya vista" por pantalla | `f1manager:tutorial:v1` (navegador) | `{team:1, race:1, sponsors:1}`; no viaja a la nube |
| tarjeta de guía | DOM al abrir la pantalla | 3-4 líneas + "Entendido"; cierra y marca |

## Relación con las demás funciones

- 003: la plantilla crea y persiste dorsales (migración en la carga).
- 002: carrera dibuja dorsal en punto y fila; la guía de carrera se muestra al pintar la parrilla.
- 004: la guía de Patrocinadores explica el sistema de esa spec.
