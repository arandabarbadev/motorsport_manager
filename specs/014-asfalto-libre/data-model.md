# Modelo de datos: Asfalto libre

**Fecha**: 2026-10-17 · **Spec**: [spec.md](spec.md)

## Cambios por entidad

### `racing-line.ts` — CONSTANTES (sin firma nueva)

```ts
DRIFT_AMPLITUDE = 0.32   // antes 0.18
DRIFT_RAD_PER_SEC = 0.3  // antes 0.25
CORNER_WEIGHT = 0.8      // antes 0.55
BATTLE_BIAS = 0.9        // antes 0.75
// LATERAL_MAX=1 · BATTLE_WINDOW=0.0035 · YELLOW_SCALE=0.4 · TAU_SEC=0.45: SIN cambios
```

- `lateralTarget` / `stepLateral` / interfaces: intactas. Mismo contrato [−1, 1].

### `race-screen.ts` — RENDER (sin estado nuevo)

- `drawTrackLayer`: calzada `0.075 × min(w,h)` (antes 0.062); **se elimina** `strokeLoop(1.5, --track-line)`.
- `carScreenPoint`: offset `lateral × roadWidthPx × 0.42` (antes 0.34).
- `carRadius`: `0.013 × min(w,h)` (antes 0.016) — anillos y textos flotantes ya derivan de `r`, se adaptan solos.

### `ui.css` — VARIABLES ELIMINADAS

- `--track-line` desaparece de `:root` (oscuro) y de `:root[data-theme='light']`. Sin más usos (verificado por búsqueda).

## Entidades SIN cambios

- `RaceCarState`, `RaceState`, `RaceEvent`, `Track`, `CareerState`, `Roster`, claves de localStorage por ranura (013), modelo de Firestore: **intactos**.
- Motor (`simulation.ts`), sampler (`track-path.ts`), semáforo, feed e incidentes (012): **intactos**.

## Migraciones

- Ninguna: no hay nada persistido nuevo ni campos viejos que reinterpretar. Las partidas guardadas (local y nube) ven el cambio de render sin tocar un byte.
