# Modelo de datos: Mi Equipo y la parrilla de rivales

**Fase 1** · 2026-10-10

## Entidad: Plantilla (Roster) — persistida

Clave `f1manager:roster:v1`. Una por navegador (y una por cuenta en la nube, spec 006).

| Campo | Tipo | Notas |
|---|---|---|
| versión | 1 | Migraciones hacia delante en la carga |
| id del equipo jugador | texto | 'player-team' |
| entradas | Equipo con plantilla × 10 | El mío primero + 9 rivales |

## Entidad: Equipo con plantilla (TeamEntry)

| Campo | Tipo | Notas |
|---|---|---|
| equipo | Equipo | id, nombre, color, presupuesto |
| pilotos | Piloto[2] | Los asientos |
| coches | Coche[2] | Uno por asiento |
| desarrollos | niveles por categoría | SOLO el equipo jugador |

## Entidad: Desarrollo del coche (solo jugador)

| Campo | Tipo | Notas |
|---|---|---|
| categoría | una de 9 | aero, alerones, motor, electronica, chasis, suspensión, neumaticos, seguridad, volante |
| nivel | 0..10 | Cada nivel = +1 punto efectivo |

Plegado sobre stats efectivos al construir la carrera (race-builder.ts):
aero+alerones→aerodinámica · motor+electronica→motor · chasis+suspensión+neumaticos→chasis · seguridad+volante→fiabilidad. Topes: 95 (99 fiabilidad).

## Entidad: Equipo (Team)

id, nombre (editable), color (librea; paleta fija para rivales), presupuesto (solo referencia del jugador: la economía viva está en la spec 004).

## Entidad: Piloto (Driver)

id (`equipo-d0/d1`), nombre (único entre generados; editable), y stats 0-100: ritmo, consistencia, agresividad, habilidad en mojado, tolerancia al riesgo. Rangos de generación en el plan.

## Entidad: Coche (Car)

id, equipo, aero/motor/chasis 0-100, fiabilidad 0-100. Los efectivos del jugador = base + desarrollos, con tope.

## Migraciones y validación de la carga

- Guardados sin `desarrollos` → se crean a nivel 0.
- Guardado inválido (versión, nº de equipos, forma) → plantilla nueva por completo; la carrera (spec 004) no se toca.
- Regenerar rivales conserva la entrada del jugador tal cual (identidad + desarrollos).

## Relación con las demás funciones

- Motor (001): lee pilotos y coches por id.
- Carrera en vivo (002): pinta colores y nombres de esta plantilla.
- Economía (004): paga los niveles (coste/descuento) desde el presupuesto de carrera.
- Sincronización (006): la plantilla entera viaja a la nube como texto.
