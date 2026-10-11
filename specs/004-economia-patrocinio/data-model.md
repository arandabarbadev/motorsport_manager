# Modelo de datos: Economía, patrocinio y sede

**Fase 1** · 2026-10-10

## Entidad: Economía de carrera (CareerState) — persistida

Clave `f1manager:career:v1`. La parte económica (la de temporada, en la spec 005):

| Campo | Tipo | Notas |
|---|---|---|
| presupuesto | M€ | Fuente única de verdad del dinero |
| personal | {mecánicos, ingenieros, comerciales} | Niveles 1-5 |
| patrocinadores | lista de ids (0-99) | Máximo 5 activos |
| versión | 1 | Migraciones hacia delante en la carga |

Migración documentada: el viejo `patrocinador` único (id o nulo) se convierte en lista de uno.

## Entidad: Patrocinador (generado, no persistido)

| Campo | Tipo | Notas |
|---|---|---|
| id / ranking | 0..99 | 0 = peor pagado |
| nombre | texto | Dos partes combinadas con azar determinista (misma lista en cada partida) |
| pago por carrera | 0,5..5,0 M€ | Lineal con el ranking, redondeado a 0,1 |
| puesto exigido | 20..1 | Lineal con el ranking (inverso) |

Desbloqueo (calculado, no guardado): mejor resultado de la temporada actual ≤ puesto exigido; sin resultados, solo exigencia P20.

## Entidad: Personal de sede

| Tipo | Efecto por nivel (sobre nivel 1) | Coste del siguiente nivel |
|---|---|---|
| Mecánicos | −1,5 s por parada en boxes (mínimo 10 s) | nivel actual × 30 M€ |
| Ingenieros | −5 % en cada punto de desarrollo del coche | ídem |
| Comerciales | +5 % en el ingreso de patrocinio | ídem |

Los efectos se aplican donde viven: mecánicos al construir la carrera (spec 001/002), ingenieros al precio de desarrollo (spec 003), comerciales en el ingreso (abajo).

## Entidad: Balance de carrera (RaceFinance, calculado)

| Partida | Cálculo |
|---|---|
| Premios | Tabla por posición × mis 2 coches |
| Ingreso de patrocinio | Σ pagos de los firmados × (1 + 5 % × (comerciales − 1)), redondeado a 0,1 |
| Sueldos de pilotos | 2 × 4 M€ |
| Sueldos de personal | (Σ niveles de sede) × 2 M€ |
| Alquiler | 6 M€ |
| **Neto** | premios + patrocinio − gastos; se suma al presupuesto una vez por carrera |

## Relación con las demás funciones

- Plantilla (003): paga los niveles de desarrollo (con descuento de ingenieros).
- Motor/carrera (001/002): los mecánicos acortan la parada; el panel de resultados pinta el balance.
- Temporada (005): la economía guarda progreso y resultados de temporada (entidad común).
- Sincronización (006): la economía entera viaja a la nube como texto.
