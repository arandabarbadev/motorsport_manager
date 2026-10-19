import { makeRng } from './rng';
import { DIFFICULTY_PRESETS, Difficulty } from './difficulty';
import type { CareerState } from './career';

// ============================================================
// SPONSORS (fake companies): 150 partners (spec 009) ranked from
// worst to best paid. The best ones demand results (the top sponsor
// requires having won with P1, the worst just P20). How much each
// rank actually pays depends on the save's difficulty preset
// (spec 016); the ranking and demands are identical in all three.
// ============================================================

export interface Sponsor {
  id: number; // 0 (worst paid) .. 149 (best paid)
  name: string;
  payFrac: number; // 0 (worst paid) .. 1 (best paid), difficulty scales it
  requiredPosition: number; // best result needed to sign
}

const PART_A: string[] = [
  'Aero', 'Nova', 'Volt', 'Turbo', 'Zenith', 'Vertex', 'Orbit', 'Pulse',
  'Quantum', 'Solar', 'Apex', 'Falcon', 'Titan', 'Cobalt', 'Nimbus', 'Radial',
  'Crono', 'Vortex', 'Delta', 'Prisma',
];
const PART_B: string[] = [
  'Motors', 'Energy', 'Bank', 'Tyres', 'Telecom', 'Cola', 'Air', 'Logistics',
  'Media', 'Tools', 'Labs', 'Foods', 'Gas', 'Sport', 'Pay', 'Cloud',
  'Steel', 'Glass', 'Sound', 'Press',
];

export const SPONSOR_COUNT = 150; // spec 009 (was 100)

// Signed sponsors at the same time (player choice, 2026-10-03;
// raised to 8 with the harder economy, spec 009).
export const MAX_ACTIVE_SPONSORS = 8;

export const ALL_SPONSORS: Sponsor[] = (() => {
  const used = new Set<string>();
  return Array.from({ length: SPONSOR_COUNT }, (_, i) => {
    const rng = makeRng(424242 + i * 131);
    const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
    let name = `${pick(PART_A)} ${pick(PART_B)}`;
    if (used.has(name)) name = `${name} Group`; // 400 combos, rare collision
    used.add(name);
    return {
      id: i,
      name,
      // Spec 016: the rank is stored as a 0..1 fraction; the M€ a
      // rank pays come from the save's difficulty preset (see
      // sponsorPayPerRace). Spec 009's 0.3..3.0 M€ is 'hard'.
      payFrac: i / (SPONSOR_COUNT - 1),
      requiredPosition: Math.max(1, Math.round(20 - (i / (SPONSOR_COUNT - 1)) * 19)),
    };
  });
})();

// Spec 016: M€ per race of a sponsor under one difficulty preset,
// rounded to 0.1 like the old fixed field was.
export function sponsorPayPerRace(sponsor: Sponsor, difficulty: Difficulty): number {
  const preset = DIFFICULTY_PRESETS[difficulty];
  return (
    Math.round((preset.sponsorPayMin + sponsor.payFrac * (preset.sponsorPayMax - preset.sponsorPayMin)) * 10) / 10
  );
}

export function getSponsor(id: number | null): Sponsor | undefined {
  if (id === null) return undefined;
  return ALL_SPONSORS[id];
}

// Unlocked when your best result of the current season is at least as
// good as the sponsor's demand (no results yet -> only P20 sponsors).
export function isSponsorUnlocked(sponsor: Sponsor, career: CareerState): boolean {
  if (career.seasonResults.length === 0) return sponsor.requiredPosition >= 20;
  const best = Math.min(...career.seasonResults.map((r) => r.position));
  return best <= sponsor.requiredPosition;
}
