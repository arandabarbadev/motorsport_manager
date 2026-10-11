import { makeRng } from './rng';
import type { CareerState } from './career';

// ============================================================
// SPONSORS (fake companies): 100 partners paying 0.5 to 5 M€ per
// race. You sign ONE at a time; the best ones demand results (the
// top sponsor requires having won with P1, the worst just P20).
// ============================================================

export interface Sponsor {
  id: number; // 0 (worst paid) .. 99 (best paid)
  name: string;
  payPerRace: number; // M€
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
      // spec 009: 0.3..3.0 M€/race (was 0.5..5.0) — sponsorship funds
      // less of the upgrade bill now.
      payPerRace: Math.round((0.3 + (i / (SPONSOR_COUNT - 1)) * 2.7) * 10) / 10,
      requiredPosition: Math.max(1, Math.round(20 - (i / (SPONSOR_COUNT - 1)) * 19)),
    };
  });
})();

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
