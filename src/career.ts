import { INITIAL_BUDGET } from './roster';
import { ALL_TRACKS } from './tracks-generator';
import { CAREER_STORAGE_KEY } from './storage-keys';
import type { RaceStandingEntry } from './championship';
import type { WeekendEvent } from './types';

// ============================================================
// CAREER STATE: persistent economy and season.
// - budget: single source of truth for money.
// - calendar/currentRaceIndex/seasonNumber/seasonResults: season.
// - staff: headquarters staff levels (pit time, cheaper upgrades,
//   better sponsor income).
// - sponsorId: the signed sponsor (0..99), see sponsors.ts.
// Key: "f1manager:career:v1".
// ============================================================

export interface StaffState {
  mechanics: number; // levels 1..5: -1.5s in the pits per level
  engineers: number; // levels 1..5: -5% development cost per level
  commercial: number; // levels 1..5: +5% sponsor income per level
}

export const STAFF_MAX_LEVEL = 10; // spec 009 (was 5)
export const STAFF_UPGRADE_BASE_COST = 30; // M€: next level costs 30 x nextLevel

export interface SeasonResult {
  trackId: string;
  // Spec 011: which weekend act this result belongs to
  // ('quali' | 'sprint1' | 'sprint2' | 'race'; legacy saves migrate to 'race').
  event: WeekendEvent;
  position: number; // best of the two player cars
  prize: number; // total prize money of that event (both cars)
  // Phase 7: points earned by every driver in this event (championship),
  // in final-classification order (it seeds the next event's grid).
  standings?: RaceStandingEntry[];
}

export interface CareerState {
  version: 1;
  budget: number;
  calendar: string[];
  currentRaceIndex: number;
  seasonNumber: number; // starts at 1
  seasonResults: SeasonResult[]; // one entry per completed race
  staff: StaffState;
  sponsorIds: number[]; // signed sponsors (up to MAX_ACTIVE_SPONSORS)
}

// Spec 010 migration table: names of the OLD (pre-010) calendar in
// index order, used to translate legacy 'track-N' ids into the new
// stable by-name ids. Barcelona was removed from the game, so its
// results are dropped from the season history (prize money and
// championship points already earned are untouched).
const LEGACY_TRACK_ORDER: readonly string[] = [
  'Melbourne', 'Yeda', 'Bakú', 'Madrid', 'Mónaco', 'Barcelona', 'Imola',
  'Montreal', 'Silverstone', 'Spa', 'Hungría', 'Zandvoort', 'Monza',
  'Singapur', 'Interlagos', 'México', 'Austin', 'Las Vegas', 'Suzuka',
  'Yas Marina',
];

function migrateTrackId(id: string): string | null {
  if (!id.startsWith('track-')) return id; // already the new by-name format
  const idx = Number(id.slice('track-'.length));
  const name = LEGACY_TRACK_ORDER[idx];
  if (!name) return null;
  return ALL_TRACKS.find((t) => t.name === name)?.id ?? null;
}

export function createDefaultCareer(budget: number = INITIAL_BUDGET): CareerState {
  return {
    version: 1,
    budget,
    calendar: ALL_TRACKS.map((t) => t.id),
    currentRaceIndex: 0,
    seasonNumber: 1,
    seasonResults: [],
    staff: { mechanics: 1, engineers: 1, commercial: 1 },
    sponsorIds: [],
  };
}

export function saveCareer(career: CareerState): void {
  localStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(career));
}

// Spec 011: the season is done when every round has its RACE result
// (quali and sprints are extra recorded acts of the same weekend).
export function isSeasonComplete(career: CareerState): boolean {
  const races = career.seasonResults.filter((r) => r.event === 'race').length;
  return races >= career.calendar.length;
}

// Next level cost of a staff category (1 -> 2 costs 30, 4 -> 5 costs 120).
export function staffUpgradeCost(currentLevel: number): number {
  return STAFF_UPGRADE_BASE_COST * currentLevel;
}

export function loadCareer(): CareerState | null {
  try {
    const raw = localStorage.getItem(CAREER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CareerState>;
    if (parsed.version !== 1 || typeof parsed.budget !== 'number') return null;
    // Merge with defaults so older saves migrate forward without
    // losing progress. Spec 010: the calendar is rebuilt with the new
    // by-name ids in real order, results are re-mapped (dropping
    // circuits that no longer exist) and re-ordered by the new
    // calendar, and the current round index is kept (clamped).
    const newCalendar = ALL_TRACKS.map((t) => t.id);
    const migratedResults: SeasonResult[] = (
      Array.isArray(parsed.seasonResults) ? parsed.seasonResults : []
    )
      .map((r) =>
        r && typeof r.trackId === 'string'
          ? {
              ...r,
              trackId: migrateTrackId(r.trackId),
              // Spec 011 migration: pre-weekend saves only had races.
              event: (r.event ?? 'race') as WeekendEvent,
            }
          : null
      )
      .filter((r): r is SeasonResult => r !== null && r.trackId !== null)
      .sort(
        (a, b) => newCalendar.indexOf(a.trackId) - newCalendar.indexOf(b.trackId)
      );
    const merged: CareerState = {
      version: 1,
      budget: parsed.budget,
      calendar: newCalendar,
      currentRaceIndex: Math.min(
        Math.max(typeof parsed.currentRaceIndex === 'number' ? parsed.currentRaceIndex : 0, 0),
        newCalendar.length - 1
      ),
      seasonNumber: typeof parsed.seasonNumber === 'number' ? parsed.seasonNumber : 1,
      seasonResults: migratedResults,
      staff: {
        mechanics: parsed.staff?.mechanics ?? 1,
        engineers: parsed.staff?.engineers ?? 1,
        commercial: parsed.staff?.commercial ?? 1,
      },
      // Migration: the old single sponsorId becomes a one-item list.
      sponsorIds: Array.isArray(parsed.sponsorIds)
        ? parsed.sponsorIds
        : typeof (parsed as { sponsorId?: number | null }).sponsorId === 'number'
          ? [(parsed as { sponsorId: number }).sponsorId]
          : [],
    };
    return merged;
  } catch {
    return null;
  }
}

// Migration-friendly creation: if there is no career save yet, start
// from fallbackBudget so nothing the player already spent is lost.
export function getOrCreateCareer(fallbackBudget: number = INITIAL_BUDGET): CareerState {
  return loadCareer() ?? createDefaultCareer(fallbackBudget);
}
