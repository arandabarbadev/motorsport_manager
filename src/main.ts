import { createTeamScreen } from './team-screen';
import { createRaceScreen } from './race-screen';
import { loadRoster } from './roster';
import { buildRaceStateFromRoster } from './race-builder';
import { getOrCreateCareer } from './career';
import { ALL_TRACKS, getTrackById } from './tracks-generator';

// Phase 5 entry point: management screen first; "Ir a la carrera"
// uses the track of the season calendar at currentRaceIndex.
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
  const career = getOrCreateCareer();
  const track =
    getTrackById(career.calendar[career.currentRaceIndex]) ?? ALL_TRACKS[0];
  // The race uses a snapshot of roster + track taken when entering.
  createRaceScreen(app, () => buildRaceStateFromRoster(roster, track), showTeamScreen);
}

showTeamScreen();
