import { createTeamScreen } from './team-screen';
import { createRaceScreen } from './race-screen';
import { createSeasonScreen } from './season-screen';
import { loadRoster } from './roster';
import { buildRaceStateFromRoster } from './race-builder';
import { getOrCreateCareer, isSeasonComplete } from './career';
import { ALL_TRACKS, getTrackById } from './tracks-generator';

// Phase 6 entry point: management first; "Ir a la carrera" runs the
// calendar's current GP, and a completed season opens the summary.
const app = document.getElementById('app')!;

function showTeamScreen(): void {
  createTeamScreen(app, showRaceScreen);
}

function showSeasonScreen(): void {
  createSeasonScreen(app, showTeamScreen);
}

function showRaceScreen(): void {
  const roster = loadRoster();
  if (!roster) {
    showTeamScreen(); // no valid saved roster: back to management
    return;
  }
  const career = getOrCreateCareer();
  if (isSeasonComplete(career)) {
    showSeasonScreen(); // all 20 races done: season summary
    return;
  }
  const track =
    getTrackById(career.calendar[career.currentRaceIndex]) ?? ALL_TRACKS[0];
  // The race uses a snapshot of roster + track taken when entering.
  createRaceScreen(
    app,
    () => buildRaceStateFromRoster(roster, track),
    showTeamScreen,
    showSeasonScreen
  );
}

showTeamScreen();
