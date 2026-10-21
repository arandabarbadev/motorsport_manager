# Data model 019

## Cambios en tipos (`src/types.ts`)

```ts
export interface Driver {
  id: string;
  name: string;
  number: number;        // 1-99, editable para el jugador (FR-002)
  pace: number;          // Ritmo (FR-010)
  consistency: number;   // Habilidad
  aggression: number;    // personalidad oculta (no entrenable)
  wetSkill: number;      // Reflejos
  riskTolerance: number; // personalidad oculta (no entrenable)
  experience: number;    // Experiencia: reduce incidentes (FR-010)
  training?: Partial<Record<PilotAttr, number>>; // niveles comprados (costes)
}
export type PilotAttr = 'ritmo' | 'habilidad' | 'reflejos' | 'experiencia';
```

## Nuevas funciones (`src/roster.ts`)

```ts
export const PILOT_ATTRS: { id: PilotAttr; label: string; stat: keyof Driver }[]
// ritmo→pace · habilidad→consistency · reflejos→wetSkill · experiencia→experience
export const MAX_DRIVER_STAT = 95;
export const PILOT_COST_PER_POINT = 15; // coste = 15 × (niveles + 1), sin descuento
export function pilotUpgradeCost(bought: number): number;
export function driverVal(d: Driver): number; // round(media de las 4)
export function setDriverNumber(roster, entry, seat, n): boolean; // único 1-99
```

## Migración (`loadRoster`)

- `d.experience ?? 50` para TODOS los pilotos (idéntico a hoy en sim).
- Pilotos del jugador: `d.training ?? {}`.
- `randomDriverStats()` añade `experience: randInt(50, 90)`.

## Simulación (`src/simulation.ts`)

`runIncidents`: `const risk = Math.max(0.3, 0.55 + (aggression +
riskTolerance) / 220 - (driver.experience - 50) / 500)`.
`FALLBACK_DRIVER.experience = 50`.

## Acento dinámico (`src/accent.ts`, nuevo)

```ts
export function applyTeamAccent(color?: string): void
// escribe --accent en :root.style y calcula --accent-contrast
// (luminancia relativa > 0.6 → '#101112', si no '#ffffff')
// color undefined → limpia los inline y vuelve al --accent del tema
```

Llamado en `main.start()` (roster activo) y en team-screen (montaje +
input de color en vivo).

## Tokens CSS (`ui.css`)

- Nuevos: `--font-ui`, `--font-display`, `--radius-touch: 8px`,
  `--radius-data: 2px`, `--accent-contrast`, `--tyre-soft/medium/hard/
  inter/wet` (+ `--tyre-hard-shadow` en claro).
- Redefinidos: carbón neutro (oscuro/claro), `--accent` derivados por
  `color-mix`, `--btn-*`, `--track-asphalt/start`.
- `body { font-family: var(--font-ui); font-variant-numeric: tabular-nums; }`
- `.standing-row .pos { font-family: var(--font-display); }` (única reserva).

## Persistencia

Nada nuevo: todo vive en el roster/career de la ranura activa (localStorage
+ nube como siempre). Los dorsales y training viajan en el roster.
