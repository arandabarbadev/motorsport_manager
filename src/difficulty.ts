// ============================================================
// ECONOMIC DIFFICULTY (spec 016): the three presets chosen when a
// save slot is CREATED. 'hard' replicates the spec-009 tuning
// constant by constant (legacy saves migrate to it); 'easy' recovers
// the pre-009 numbers; 'normal' sits in between. Pure module — no
// localStorage, no DOM — so the test harness can check it.
// ============================================================

export type Difficulty = 'easy' | 'normal' | 'hard';

export const DIFFICULTY_ORDER: readonly Difficulty[] = ['easy', 'normal', 'hard'];

export interface DifficultyPreset {
  id: Difficulty;
  label: string;
  // One-line summary shown under the picker.
  hint: string;
  initialBudget: number; // M€ at creation
  sponsorPayMin: number; // M€ per race, worst sponsor (#1)
  sponsorPayMax: number; // M€ per race, best sponsor (#150)
  prizeScale: number; // multiplier on the prize table
}

export const DIFFICULTY_PRESETS: Record<Difficulty, DifficultyPreset> = {
  easy: {
    id: 'easy',
    label: 'Fácil',
    hint: 'Presupuesto 350 M€ · patrocinios hasta 5,0 M€ · premios ×1,5',
    initialBudget: 350,
    sponsorPayMin: 0.5,
    sponsorPayMax: 5.0,
    prizeScale: 1.5,
  },
  normal: {
    id: 'normal',
    label: 'Normal',
    hint: 'Presupuesto 280 M€ · patrocinios hasta 4,5 M€ · premios ×1,25',
    initialBudget: 280,
    sponsorPayMin: 0.4, // survives the 0.1 rounding (0.45 would read 0.5)
    sponsorPayMax: 4.5,
    prizeScale: 1.25,
  },
  hard: {
    id: 'hard',
    label: 'Difícil',
    hint: 'Presupuesto 200 M€ · patrocinios hasta 3,0 M€ · premios ×1',
    // Spec 009, unchanged: 200 M€ (was 350), 150 sponsors paying
    // 0.3..3.0 M€, prize table as published.
    initialBudget: 200,
    sponsorPayMin: 0.3,
    sponsorPayMax: 3.0,
    prizeScale: 1,
  },
};

export function isDifficulty(value: unknown): value is Difficulty {
  return value === 'easy' || value === 'normal' || value === 'hard';
}

// Defensive read: anything missing/corrupt/new falls back to 'hard'
// so existing saves keep the numbers they were balanced on.
export function difficultyOrHard(value: unknown): Difficulty {
  return isDifficulty(value) ? value : 'hard';
}
