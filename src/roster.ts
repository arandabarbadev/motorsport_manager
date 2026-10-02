import { Car, Driver, Team } from './types';
import {
  FIRST_NAMES,
  LAST_NAMES,
  RIVAL_TEAM_COLORS,
  TEAM_NAME_PREFIXES,
  TEAM_NAME_SUFFIXES,
} from './names-data';
import { ROSTER_STORAGE_KEY } from './storage-keys';

// ============================================================
// ROSTER: the player team + 9 rival teams (2 drivers each = 20
// cars). Persisted in localStorage under "f1manager:roster:v1".
// The player entry also carries the car DEVELOPMENTS (9
// categories, player request 2026-09-27).
// ============================================================

export const INITIAL_BUDGET = 350; // M€ (player choice)

// Car development categories (each level = +1 effective stat point).
export type DevId =
  | 'aero' | 'alerones' | 'motor' | 'electronica' | 'chasis'
  | 'suspension' | 'neumaticos' | 'seguridad' | 'volante';

export const DEV_IDS: DevId[] = [
  'aero', 'alerones', 'motor', 'electronica', 'chasis',
  'suspension', 'neumaticos', 'seguridad', 'volante',
];

export const DEV_LABELS: Record<DevId, string> = {
  aero: 'Aerodinámica',
  alerones: 'Alerones del. y tras.',
  motor: 'Motor',
  electronica: 'Electrónica',
  chasis: 'Chasis',
  suspension: 'Suspensión',
  neumaticos: 'Neumáticos',
  seguridad: 'Seguridad',
  volante: 'Volante',
};

// How each development maps onto the Car stats (used by race-builder):
//   aero        -> aero
//   alerones    -> aero
//   motor       -> engine
//   electronica -> engine
//   chasis      -> chassis
//   suspension  -> chassis
//   neumaticos  -> chassis
//   seguridad   -> reliability
//   volante     -> reliability
export const DEV_COST_PER_POINT = 15; // M€ (player choice; engineers discount applies)
export const DEV_MAX_LEVEL = 10;
export const MAX_CAR_STAT = 95; // cap for effective aero/engine/chassis
export const PLAYER_START_STAT = 65; // player cars start below the rival average (60-85)

const RIVAL_TEAM_COUNT = 9;
const DRIVERS_PER_TEAM = 2;

export interface TeamEntry {
  team: Team;
  drivers: Driver[];
  cars: Car[];
  // Player only: development levels by category (0..DEV_MAX_LEVEL).
  developments?: Partial<Record<DevId, number>>;
}

export interface Roster {
  version: 1;
  playerTeamId: string;
  entries: TeamEntry[]; // player team + 9 rivals = 10 teams
}

const randInt = (min: number, max: number): number =>
  min + Math.floor(Math.random() * (max - min + 1));

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function randomDriverStats() {
  return {
    pace: randInt(55, 95),
    consistency: randInt(50, 95),
    aggression: randInt(15, 95),
    wetSkill: randInt(50, 90),
    riskTolerance: randInt(10, 90),
  };
}

// Random unique "First Last" combination among the generated drivers.
function uniqueDriverName(used: Set<string>): string {
  for (let tries = 0; tries < 50; tries++) {
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    if (!used.has(name)) {
      used.add(name);
      return name;
    }
  }
  return `Driver ${used.size + 1}`; // extremely unlikely fallback
}

function generateRivalEntry(index: number, usedNames: Set<string>): TeamEntry {
  const teamId = `rival-${index}`;
  const drivers: Driver[] = [];
  const cars: Car[] = [];
  for (let seat = 0; seat < DRIVERS_PER_TEAM; seat++) {
    drivers.push({
      id: `${teamId}-d${seat}`,
      name: uniqueDriverName(usedNames),
      ...randomDriverStats(),
    });
    cars.push({
      id: `${teamId}-c${seat}`,
      teamId,
      aero: randInt(60, 85),
      engine: randInt(60, 85),
      chassis: randInt(60, 85),
      reliability: randInt(70, 95),
    });
  }
  return {
    team: {
      id: teamId,
      name: `${pick(TEAM_NAME_PREFIXES)} ${pick(TEAM_NAME_SUFFIXES)}`,
      budget: 0,
      color: RIVAL_TEAM_COLORS[index % RIVAL_TEAM_COLORS.length],
    },
    drivers,
    cars,
  };
}

// First open: player team with editable placeholders + generated rivals.
export function createDefaultRoster(): Roster {
  const usedNames = new Set<string>();
  const player: TeamEntry = {
    team: {
      id: 'player-team',
      name: 'Mi Equipo',
      budget: INITIAL_BUDGET,
      color: '#e10600',
    },
    drivers: [0, 1].map((seat) => ({
      id: `player-team-d${seat}`,
      name: `Piloto ${seat + 1}`,
      ...randomDriverStats(),
    })),
    cars: [0, 1].map((seat) => ({
      id: `player-team-c${seat}`,
      teamId: 'player-team',
      aero: PLAYER_START_STAT,
      engine: PLAYER_START_STAT,
      chassis: PLAYER_START_STAT,
      reliability: 80,
    })),
    developments: {}, // all categories start at level 0
  };
  const entries: TeamEntry[] = [player];
  for (let i = 0; i < RIVAL_TEAM_COUNT; i++) {
    entries.push(generateRivalEntry(i, usedNames));
  }
  return { version: 1, playerTeamId: 'player-team', entries };
}

// "Generar parrilla" button: fresh rivals, player team untouched.
export function regenerateRivals(roster: Roster): Roster {
  const usedNames = new Set<string>();
  const player = roster.entries.find((e) => e.team.id === roster.playerTeamId)!;
  const entries: TeamEntry[] = [player];
  for (let i = 0; i < RIVAL_TEAM_COUNT; i++) {
    entries.push(generateRivalEntry(i, usedNames));
  }
  return { ...roster, entries };
}

export function saveRoster(roster: Roster): void {
  localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(roster));
}

// Returns null if there is no save or it does not look valid;
// the caller regenerates a fresh roster in that case.
export function loadRoster(): Roster | null {
  try {
    const raw = localStorage.getItem(ROSTER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Roster;
    if (parsed.version !== 1 || !Array.isArray(parsed.entries)) return null;
    if (parsed.entries.length !== RIVAL_TEAM_COUNT + 1) return null;
    const player = parsed.entries.find((e) => e?.team?.id === parsed.playerTeamId);
    if (!player) return null;
    const shapeOk = parsed.entries.every(
      (e) =>
        e?.team && Array.isArray(e.drivers) && e.drivers.length === DRIVERS_PER_TEAM &&
        Array.isArray(e.cars) && e.cars.length === DRIVERS_PER_TEAM
    );
    if (!shapeOk) return null;
    // Migration: older player entries have no developments.
    if (!player.developments) player.developments = {};
    return parsed;
  } catch {
    return null; // corrupted save: start over
  }
}
