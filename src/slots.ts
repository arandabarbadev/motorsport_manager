import { CAREER_STORAGE_KEY, ROSTER_STORAGE_KEY } from './storage-keys';

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

// ---- Slot lifecycle ----

// A slot "exists" when it has a career save in it.
export function slotExists(slot: SlotId): boolean {
  return localStorage.getItem(careerKeyFor(slot)) !== null;
}

// Delete ONE slot. If it was the active one, the active slot moves
// to the first slot with content ('a' when everything is empty —
// the team screen will create a fresh save there).
export function deleteSlot(slot: SlotId): void {
  localStorage.removeItem(rosterKeyFor(slot));
  localStorage.removeItem(careerKeyFor(slot));
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
    };
  } catch {
    return null;
  }
}
