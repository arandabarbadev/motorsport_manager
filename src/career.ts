import { INITIAL_BUDGET } from './roster';

// ============================================================
// CAREER STATE (Phase 4): persistent economy. The team budget is
// the single source of truth HERE (not in the roster): race
// prizes are added when a race ends, and "Mi Equipo" reads and
// spends this value. Key: "f1manager:career:v1".
// ============================================================

export const CAREER_STORAGE_KEY = 'f1manager:career:v1';

export interface CareerState {
  version: 1;
  budget: number; // accumulated M€
}

export function loadCareer(): CareerState | null {
  try {
    const raw = localStorage.getItem(CAREER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CareerState;
    if (parsed.version !== 1 || typeof parsed.budget !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveCareer(career: CareerState): void {
  localStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(career));
}

// Migration-friendly creation: if there is no career save yet
// (Phase 3 saves kept the budget inside the roster), start from
// fallbackBudget so nothing the player already spent is lost.
export function getOrCreateCareer(fallbackBudget: number = INITIAL_BUDGET): CareerState {
  return loadCareer() ?? { version: 1, budget: fallbackBudget };
}
