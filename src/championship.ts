import { RaceCarState } from './types';

// ============================================================
// CHAMPIONSHIP (Phase 7): standard F1 points. Every race stores
// the points earned by ALL 20 drivers; the standings accumulate
// across the season (drivers + constructors tables).
// ============================================================

export const CHAMPIONSHIP_POINTS: readonly number[] = [
  25, 18, 15, 12, 10, 8, 6, 4, 2, 1,
];

export function pointsForPosition(position: number): number {
  return position <= CHAMPIONSHIP_POINTS.length ? CHAMPIONSHIP_POINTS[position - 1] : 0;
}

export interface RaceStandingEntry {
  driverId: string;
  teamId: string;
  points: number;
}

// Points table of one race, from its final classification.
export function standingsFromClassification(
  classification: RaceCarState[]
): RaceStandingEntry[] {
  return classification.map((c) => ({
    driverId: c.driverId,
    teamId: c.teamId,
    points: pointsForPosition(c.position),
  }));
}

export interface ChampionshipTables {
  drivers: RaceStandingEntry[];
  teams: { teamId: string; points: number }[];
}

// Accumulated tables from the season results (best first).
export function computeChampionship(
  results: { standings?: RaceStandingEntry[] }[]
): ChampionshipTables {
  const drivers = new Map<string, RaceStandingEntry>();
  const teams = new Map<string, number>();
  for (const result of results) {
    for (const entry of result.standings ?? []) {
      const driver = drivers.get(entry.driverId) ?? { ...entry, points: 0 };
      driver.points += entry.points;
      drivers.set(entry.driverId, driver);
      teams.set(entry.teamId, (teams.get(entry.teamId) ?? 0) + entry.points);
    }
  }
  return {
    drivers: [...drivers.values()].sort((a, b) => b.points - a.points),
    teams: [...teams.entries()]
      .map(([teamId, points]) => ({ teamId, points }))
      .sort((a, b) => b.points - a.points),
  };
}
