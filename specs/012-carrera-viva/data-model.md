# Modelo de datos: Carrera viva

**Fecha**: 2026-10-17 · **Spec**: [spec.md](spec.md)

## Cambios por entidad

### `RaceEvent` (src/types.ts) — EXTENDIDO (transitorio, no persistido)

```ts
export interface RaceEvent {
  type: 'overtake' | 'pitEntry' | 'incident';   // + 'incident'
  carDriverId: string;
  previousPosition?: number;
  newPosition?: number;
  incidentKind?: 'spin' | 'crash' | 'mechanical'; // solo en 'incident'
}
```

- Vive en `RaceState.raceEvents` y se REEMPLAZA cada tick (como ya ocurría): no se guarda, no migra, no se sincroniza.

### Lateralidad — NUEVA, solo render (`src/racing-line.ts`)

```ts
interface LateralCar { driverId: string; gridPos: number; totalProgress: number; lateral: number; }
interface LateralInput { cars: LateralCar[]; curvatureAt(t: number): number; clockSec: number; yellow: boolean; }
lateralTarget(car, input): number   // [−1, 1]: batalla + interior de curva + deriva; ×0,4 en amarilla
stepLateral(current, target, dt): number  // suavizado exponencial (τ 0,45 s)
```

- Estado dueño: la pantalla (`Map<driverId, lateral>`), reiniciado en cada `setup()`. No toca `RaceCarState`.

### Semáforo — NUEVA, solo vista (`race-screen.ts`)

- Estado efímero de la pantalla (`lightsPhase`: activa / luces encendidas / fuera). DOM: `.start-lights` con 5 `.light`. No persiste.

### Feed "Dirección de carrera" — NUEVA, solo vista

- DOM (`.race-feed ul`), máximo 8 entradas, más nueva arriba. Se llena desde `consumeRaceEvents`. No persiste.

## Entidades SIN cambios

- `RaceCarState`, `RaceState`, `Track`, `CareerState`, `Roster`, claves de localStorage (`f1manager:roster:v1`, `f1manager:career:v1`), modelo de Firestore: **intactos**.
- `RAIN_RACE_CHANCE` (race-builder.ts): constante 0,4 → **0,25**; `weekend.ts:eventRainChance` no cambia (deriva).

## Migraciones

- Ninguna: no hay nada persistido nuevo ni campos viejos que reinterpretar.
