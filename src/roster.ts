import { Car, Driver, PilotAttr, Team } from './types';
import {
  FIRST_NAMES,
  LAST_NAMES,
  RIVAL_TEAM_COLORS,
  TEAM_NAME_PREFIXES,
  TEAM_NAME_SUFFIXES,
} from './names-data';
import { activeRosterKey } from './slots';

// ============================================================
// ROSTER: the player team + 9 rival teams (2 drivers each = 20
// cars). Persisted in localStorage under "f1manager:roster:v1".
// The player entry also carries the car DEVELOPMENTS (9
// categories, player request 2026-09-27).
// ============================================================

export const INITIAL_BUDGET = 200; // M€ (harder economy, spec 009 — was 350)

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
export const DEV_COST_PER_POINT = 15; // M€ base (engineers discount applies)
export const DEV_MAX_LEVEL = 15; // spec 009 (was 10)

// Cost of the NEXT development level: each level is more expensive
// than the previous one (spec 009): 15, 30, 45... M€.
export function devCost(currentLevel: number): number {
  return DEV_COST_PER_POINT * (currentLevel + 1);
}
export const MAX_CAR_STAT = 95; // cap for effective aero/engine/chassis
export const PLAYER_START_STAT = 65; // player cars start below the rival average (60-85)

// ------------------------------------------------------------
// Pilot development (spec 019): 4 trainable attributes, each one
// a real simulation stat. The mean of the four is the overall
// rating shown in the UI ("val"). Costs rise per level like the
// car developments, but engineers do NOT discount them (staff,
// not parts).
// ------------------------------------------------------------
export const MAX_DRIVER_STAT = 95; // same ceiling as the rivals' range
export const PILOT_COST_PER_POINT = 15; // M€: next level = 15 x (bought + 1)

export const PILOT_ATTRS: { id: PilotAttr; label: string; stat: 'pace' | 'consistency' | 'wetSkill' | 'experience' }[] = [
  { id: 'ritmo', label: 'Ritmo', stat: 'pace' },
  { id: 'habilidad', label: 'Habilidad', stat: 'consistency' },
  { id: 'reflejos', label: 'Reflejos', stat: 'wetSkill' },
  { id: 'experiencia', label: 'Experiencia', stat: 'experience' },
];

export function pilotUpgradeCost(levelsBought: number): number {
  return PILOT_COST_PER_POINT * (levelsBought + 1);
}

// One +1 purchase attempt: validates the cap and the budget, then
// bumps the stat and the training ledger. Returns the cost charged
// (ok: false, cost: 0 = nothing happened). The caller deducts the
// money from the career budget.
export function applyPilotUpgrade(
  driver: Driver,
  attrId: PilotAttr,
  budget: number
): { ok: boolean; cost: number } {
  const attr = PILOT_ATTRS.find((a) => a.id === attrId)!;
  if (driver[attr.stat] >= MAX_DRIVER_STAT) return { ok: false, cost: 0 };
  const bought = driver.training?.[attrId] ?? 0;
  const cost = pilotUpgradeCost(bought);
  if (budget < cost) return { ok: false, cost: 0 };
  driver[attr.stat] += 1;
  driver.training = { ...driver.training, [attrId]: bought + 1 };
  return { ok: true, cost };
}

// Overall rating (spec 019): mean of the four trainable attributes.
export function driverVal(d: Driver): number {
  return Math.round((d.pace + d.consistency + d.wetSkill + d.experience) / 4);
}

// Player-editable race number: 1-99 integers, unique across ALL 20
// drivers of the roster. Returns false (no change) on junk input or
// a duplicated number.
export function setDriverNumber(
  roster: Roster,
  entry: TeamEntry,
  seat: number,
  n: number
): boolean {
  if (!Number.isInteger(n) || n < 1 || n > 99) return false;
  const driver = entry.drivers[seat];
  if (!driver) return false;
  const taken = roster.entries
    .flatMap((e) => e.drivers)
    .some((d) => d.id !== driver.id && d.number === n);
  if (taken) return false;
  driver.number = n;
  return true;
}

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
    // Spec 019: starts at 50 = the pre-019 incident behavior.
    experience: randInt(50, 90),
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
      // Race numbers 3-20 for the rivals (the player keeps 1-2).
      number: 3 + index * 2 + seat,
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
// Spec 016: the starting budget comes from the slot's difficulty
// preset (default = the spec-009 hard economy).
export function createDefaultRoster(budget: number = INITIAL_BUDGET): Roster {
  const usedNames = new Set<string>();
  const player: TeamEntry = {
    team: {
      id: 'player-team',
      name: 'Mi Equipo',
      budget,
      color: '#e10600',
    },
    drivers: [0, 1].map((seat) => ({
      id: `player-team-d${seat}`,
      name: `Piloto ${seat + 1}`,
      number: seat + 1,
      ...randomDriverStats(),
      training: {}, // spec 019: empty upgrade ledger at the start
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
  // Spec 013: saves live in the ACTIVE slot's key.
  localStorage.setItem(activeRosterKey(), JSON.stringify(roster));
}

// Returns null if there is no save or it does not look valid;
// the caller regenerates a fresh roster in that case.
export function loadRoster(): Roster | null {
  try {
    const raw = localStorage.getItem(activeRosterKey());
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
    // Spec 019 migration: every driver gets an experience (50 = the
    // pre-019 incident behavior), the player's get an empty training
    // ledger so upgrade costs start at level 0.
    for (const entry of parsed.entries) {
      for (const driver of entry.drivers) {
        if (typeof driver.experience !== 'number') driver.experience = 50;
      }
    }
    for (const driver of player.drivers) {
      if (!driver.training) driver.training = {};
    }
    // Migration: older saves have no race numbers (spec 008) — assign
    // by flat position (player entries are first, so they get 1-2).
    parsed.entries
      .flatMap((e) => e.drivers)
      .forEach((d, i) => {
        if (typeof d.number !== 'number') d.number = i + 1;
      });
    return parsed;
  } catch {
    return null; // corrupted save: start over
  }
}
