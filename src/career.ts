import { INITIAL_BUDGET } from './roster';
import { ALL_TRACKS } from './tracks-generator';

// ============================================================
// CAREER STATE (Phase 4+5): persistent economy and season.
// - budget: single source of truth for money (prizes are added on
//   race end; "Mi Equipo" reads and spends this value).
// - calendar: 20 generated track ids in fixed season order.
// - currentRaceIndex: 0..19, the GP the season is on.
// Key: "f1manager:career:v1".
// ============================================================

export const CAREER_STORAGE_KEY = 'f1manager:career:v1';

export interface CareerState {
  version: 1;
  budget: number;
  calendar: string[];
  currentRaceIndex: number;
}

export function createDefaultCareer(budget: number = INITIAL_BUDGET): CareerState {
  return {
    version: 1,
    budget,
    calendar: ALL_TRACKS.map((t) => t.id),
    currentRaceIndex: 0,
  };
}

export function saveCareer(career: CareerState): void {
  localStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(career));
}

export function loadCareer(): CareerState | null {
  try {
    const raw = localStorage.getItem(CAREER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CareerState>;
    if (parsed.version !== 1 || typeof parsed.budget !== 'number') return null;
    // Migrate Phase 4 saves (no calendar yet): attach a fresh season.
    if (!Array.isArray(parsed.calendar) || typeof parsed.currentRaceIndex !== 'number') {
      const migrated = createDefaultCareer(parsed.budget);
      saveCareer(migrated);
      return migrated;
    }
    return parsed as CareerState;
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
