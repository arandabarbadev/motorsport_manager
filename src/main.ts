import { createRaceScreen } from './race-screen';
import { buildTestRaceState } from './test-grid';

// Phase 2 entry point: open the race screen on the shared test grid.
// Phase 3 replaces buildTestRaceState with the real editable roster.
createRaceScreen(document.getElementById('app')!, buildTestRaceState);
