import { INITIAL_BUDGET } from './roster';
import { ALL_TRACKS } from './tracks-generator';
import { CAREER_STORAGE_KEY } from './storage-keys';
import type { RaceStandingEntry } from './championship';

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

export const STAFF_MAX_LEVEL = 5;
export const STAFF_UPGRADE_BASE_COST = 30; // M€: next level costs 30 x nextLevel

export interface SeasonResult {
  trackId: string;
  position: number; // best of the two player cars
  prize: number; // total prize money of that race (both cars)
  // Phase 7: points earned by every driver in this race (championship).
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

export function isSeasonComplete(career: CareerState): boolean {
  return career.seasonResults.length >= career.calendar.length;
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
    // losing progress.
    const merged: CareerState = {
      version: 1,
      budget: parsed.budget,
      calendar: Array.isArray(parsed.calendar)
        ? parsed.calendar
        : ALL_TRACKS.map((t) => t.id),
      currentRaceIndex:
        typeof parsed.currentRaceIndex === 'number' ? parsed.currentRaceIndex : 0,
      seasonNumber: typeof parsed.seasonNumber === 'number' ? parsed.seasonNumber : 1,
      seasonResults: Array.isArray(parsed.seasonResults) ? parsed.seasonResults : [],
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
