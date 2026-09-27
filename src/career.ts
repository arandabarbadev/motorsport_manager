import { INITIAL_BUDGET } from './roster';
import { ALL_TRACKS } from './tracks-generator';

// ============================================================
// CAREER STATE (Phase 4+5+6): persistent economy and season.
// - budget: single source of truth for money (prizes are added on
//   race end; "Mi Equipo" reads and spends this value).
// - calendar: 20 track ids in fixed season order.
// - currentRaceIndex: 0..19, the GP the season is on.
// - seasonNumber / seasonResults: season summary (Phase 6).
// Key: "f1manager:career:v1".
// ============================================================

export const CAREER_STORAGE_KEY = 'f1manager:career:v1';

export interface SeasonResult {
  trackId: string;
  position: number; // best of the two player cars
  prize: number; // total prize money of that race (both cars)
}

export interface CareerState {
  version: 1;
  budget: number;
  calendar: string[];
  currentRaceIndex: number;
  seasonNumber: number; // starts at 1
  seasonResults: SeasonResult[]; // one entry per completed race
}

export function createDefaultCareer(budget: number = INITIAL_BUDGET): CareerState {
  return {
    version: 1,
    budget,
    calendar: ALL_TRACKS.map((t) => t.id),
    currentRaceIndex: 0,
    seasonNumber: 1,
    seasonResults: [],
  };
}

export function saveCareer(career: CareerState): void {
  localStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(career));
}

export function isSeasonComplete(career: CareerState): boolean {
  return career.seasonResults.length >= career.calendar.length;
}

export function loadCareer(): CareerState | null {
  try {
    const raw = localStorage.getItem(CAREER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CareerState>;
    if (parsed.version !== 1 || typeof parsed.budget !== 'number') return null;
    // Merge with defaults so older saves (Phase 4/5, missing fields)
    // migrate forward without losing progress.
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
    };
    saveCareer(merged);
    return merged;
  } catch {
    return null;
  }
}

// Migration-friendly creation: if there is no career save yet
// (Phase 3 saves kept the budget inside the roster), start from
// fallbackBudget so nothing the player already spent is lost.
export function getOrCreateCareer(fallbackBudget: number = INITIAL_BUDGET): CareerState {
  return loadCareer() ?? createDefaultCareer(fallbackBudget);
}
