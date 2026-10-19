import { CAREER_STORAGE_KEY, ROSTER_STORAGE_KEY } from './storage-keys';
import { difficultyOrHard, Difficulty, isDifficulty } from './difficulty';

// ============================================================
// SAVE SLOTS (spec 013): three independent saves (a/b/c), each
// one with its own roster + career keys in localStorage. The
// ACTIVE slot decides what the whole game loads and saves — the
// screens never know about slots, they just call loadRoster() /
// saveCareer() which use the active slot's key.
// ============================================================

export type SlotId = 'a' | 'b' | 'c';
export const SLOT_IDS: readonly SlotId[] = ['a', 'b', 'c'];

const ACTIVE_KEY = 'f1manager:active-slot';
const META_KEY = 'f1manager:slots-meta'; // { a: "nombre", ... }
// Spec 016: the difficulty chosen on an EMPTY slot's card, waiting
// for the team screen to bake it into the new career (local only —
// what travels to the cloud is the career itself).
const DIFF_KEY = 'f1manager:slot-diff';
const NAME_MAX = 24;

const DEFAULT_NAMES: Record<SlotId, string> = {
  a: 'Partida 1',
  b: 'Partida 2',
  c: 'Partida 3',
};

export function rosterKeyFor(slot: SlotId): string {
  return `f1manager:roster:${slot}`;
}

export function careerKeyFor(slot: SlotId): string {
  return `f1manager:career:${slot}`;
}

// Keys of the ACTIVE slot (used by roster.ts / career.ts).
export function activeRosterKey(): string {
  return rosterKeyFor(getActiveSlot());
}

export function activeCareerKey(): string {
  return careerKeyFor(getActiveSlot());
}

export function getActiveSlot(): SlotId {
  const value = localStorage.getItem(ACTIVE_KEY);
  return value === 'b' || value === 'c' ? value : 'a';
}

export function setActiveSlot(slot: SlotId): void {
  localStorage.setItem(ACTIVE_KEY, slot);
}

// ---- Slot names ----

function readMeta(): Partial<Record<SlotId, string>> {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeMeta(meta: Partial<Record<SlotId, string>>): void {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

// Raw stored name (null when only the default), for cloud sync.
export function rawSlotName(slot: SlotId): string | null {
  return readMeta()[slot] ?? null;
}

export function slotName(slot: SlotId): string {
  const stored = (readMeta()[slot] ?? '').trim();
  return stored !== '' ? stored : DEFAULT_NAMES[slot];
}

// Empty (or default) names are simply removed from the meta map.
export function setSlotName(slot: SlotId, name: string): void {
  const meta = readMeta();
  const value = name.trim().slice(0, NAME_MAX);
  if (value !== '' && value !== DEFAULT_NAMES[slot]) {
    meta[slot] = value;
  } else {
    delete meta[slot];
  }
  writeMeta(meta);
}

// ---- Pending difficulty (spec 016) ----

// Difficulty selected on an empty slot's card. Defaults to 'normal'
// for brand-new games; existing saves read their own career's
// difficulty instead of this.
export function getSlotDifficulty(slot: SlotId): Difficulty {
  try {
    const map = JSON.parse(localStorage.getItem(DIFF_KEY) ?? '{}') as Record<string, unknown>;
    return isDifficulty(map[slot]) ? map[slot] : 'normal';
  } catch {
    return 'normal';
  }
}

export function setSlotDifficulty(slot: SlotId, difficulty: Difficulty): void {
  try {
    const map = JSON.parse(localStorage.getItem(DIFF_KEY) ?? '{}') as Record<string, unknown>;
    if (difficulty === 'normal') delete map[slot]; // normal = default, keep it clean
    else map[slot] = difficulty;
    localStorage.setItem(DIFF_KEY, JSON.stringify(map));
  } catch {
    // corrupt map: start it over with just this slot
    localStorage.setItem(DIFF_KEY, JSON.stringify({ [slot]: difficulty }));
  }
}

// ---- Slot lifecycle ----

// A slot "exists" when it has a career save in it.
export function slotExists(slot: SlotId): boolean {
  return localStorage.getItem(careerKeyFor(slot)) !== null;
}

// Delete ONE slot. If it was the active one, the active slot moves
// to the first slot with content ('a' when everything is empty —
// the team screen will create a fresh save there). Spec 016: the
// pending difficulty choice dies with the slot.
export function deleteSlot(slot: SlotId): void {
  localStorage.removeItem(rosterKeyFor(slot));
  localStorage.removeItem(careerKeyFor(slot));
  setSlotDifficulty(slot, 'normal'); // clears a non-default entry
  const meta = readMeta();
  delete meta[slot];
  writeMeta(meta);
  if (getActiveSlot() === slot) {
    const next = SLOT_IDS.find((s) => s !== slot && slotExists(s)) ?? 'a';
    setActiveSlot(next);
  }
}

// One-time migration (spec 013): the pre-slots saves (roster:v1 +
// career:v1) become slot 'a', which is also the active slot. The
// old keys are REMOVED so this never runs twice. A slot 'a' with
// content is never overwritten.
export function migrateLegacySaves(): void {
  if (localStorage.getItem(careerKeyFor('a')) !== null) return;
  const roster = localStorage.getItem(ROSTER_STORAGE_KEY);
  const career = localStorage.getItem(CAREER_STORAGE_KEY);
  if (roster === null && career === null) return;
  if (career !== null) localStorage.setItem(careerKeyFor('a'), career);
  if (roster !== null) localStorage.setItem(rosterKeyFor('a'), roster);
  localStorage.removeItem(CAREER_STORAGE_KEY);
  localStorage.removeItem(ROSTER_STORAGE_KEY);
  setActiveSlot('a');
}

// Card summary of one slot (null when empty), parsed defensively.
export interface SlotSummary {
  season: number;
  round: number;
  rounds: number;
  budget: number;
  difficulty: Difficulty; // spec 016 (legacy saves read as 'hard')
}

export function slotSummary(slot: SlotId): SlotSummary | null {
  const raw = localStorage.getItem(careerKeyFor(slot));
  if (raw === null) return null;
  try {
    const career = JSON.parse(raw) as Partial<{
      seasonNumber: number;
      currentRaceIndex: number;
      calendar: unknown[];
      budget: number;
      difficulty: unknown;
    }>;
    const rounds = Array.isArray(career.calendar) ? career.calendar.length : 24;
    return {
      season: typeof career.seasonNumber === 'number' ? career.seasonNumber : 1,
      round: Math.min(
        (typeof career.currentRaceIndex === 'number' ? career.currentRaceIndex : 0) + 1,
        rounds
      ),
      rounds,
      budget: typeof career.budget === 'number' ? career.budget : 0,
      difficulty: difficultyOrHard(career.difficulty),
    };
  } catch {
    return null;
  }
}
