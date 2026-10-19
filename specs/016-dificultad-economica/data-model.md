# Data model 016

## Nuevo: `src/difficulty.ts` (puro, sin localStorage)

```ts
type Difficulty = 'easy' | 'normal' | 'hard';
interface DifficultyPreset {
  id: Difficulty; label: string; hint: string;
  initialBudget: number;   // M€
  sponsorPayMin: number;   // M€/carrera (patrocinador #1)
  sponsorPayMax: number;   // M€/carrera (patrocinador #150)
  prizeScale: number;      // multiplicador de PRIZE_TABLE
}
DIFFICULTY_PRESETS: Record<Difficulty, DifficultyPreset>
isDifficulty(v): v is Difficulty
difficultyOrHard(v): Difficulty   // default 'hard'
```

| | easy | normal | hard |
|---|---|---|---|
| initialBudget | 350 | 280 | 200 |
| sponsorPayMin/Max | 0,5 / 5,0 | 0,4 / 4,5 | 0,3 / 3,0 |
| prizeScale | 1,5 | 1,25 | 1 |

## Cambios de forma persistida

- `CareerState` **+** `difficulty: Difficulty` (obligatorio en memoria; los guardados sin él migran a `'hard'` en `loadCareer`). Viaja dentro del JSON del career → cloud sync sin cambios.
- `Sponsor`: `payPerRace: number` ➜ `payFrac: number` (0..1); el pago se calcula con `sponsorPayPerRace(sponsor, difficulty)`.
- `slotSummary` **+** `difficulty: Difficulty` (leída del career de esa ranura).

## Nueva clave localStorage (local, de un solo uso)

- `f1manager:slot-diff` = `{"a":"easy","b":"normal",…}` — elección pendiente de la ranura; la lee team-screen AL CREAR la partida y `deleteSlot` la limpia. No se sincroniza: lo que viaja es el career ya horneado.

## Firmas que cambian

- `createDefaultRoster(budget = INITIAL_BUDGET)`
- `createDefaultCareer(budget = INITIAL_BUDGET, difficulty: Difficulty = 'hard')`
- `getOrCreateCareer(fallbackBudget = INITIAL_BUDGET, difficulty: Difficulty = 'hard')`
- `prizeForPosition(position: number, scale = 1): number` (redondeo entero)
