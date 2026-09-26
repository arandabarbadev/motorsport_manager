import { createTeamScreen } from './team-screen';
import { createRaceScreen } from './race-screen';
import { loadRoster } from './roster';
import { buildRaceStateFromRoster } from './race-builder';

// Phase 3 entry point: the app opens on "Mi Equipo" management;
// "Ir a la carrera" builds the RaceState from the saved roster.
const app = document.getElementById('app')!;

function showTeamScreen(): void {
  createTeamScreen(app, showRaceScreen);
}

function showRaceScreen(): void {
  const roster = loadRoster();
  if (!roster) {
    showTeamScreen(); // no valid saved roster: back to management
    return;
  }
  // The race uses a snapshot of the roster taken when entering.
  createRaceScreen(app, () => buildRaceStateFromRoster(roster), showTeamScreen);
}

showTeamScreen();
