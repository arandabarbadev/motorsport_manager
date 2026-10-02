import { initTheme } from './theme';
import { createAuthScreen } from './auth-screen';
import { createTeamScreen } from './team-screen';
import { createRaceScreen } from './race-screen';
import { createSeasonScreen } from './season-screen';
import { loadRoster } from './roster';
import { buildRaceStateFromRoster } from './race-builder';
import { getOrCreateCareer, isSeasonComplete } from './career';
import { ALL_TRACKS, getTrackById } from './tracks-generator';
import { firebaseConfigured, initCloud, watchAuth } from './cloud';

// Entry point: login (Firebase) or local mode, then management.
// "Ir a la carrera" runs the calendar's current GP; a completed
// season opens the summary.
const app = document.getElementById('app')!;

initTheme();

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
    () => buildRaceStateFromRoster(roster, track, career),
    showTeamScreen,
    showSeasonScreen
  );
}

// Auth gate: with Firebase configured, wait for the restored session
// (or show the login screen). Without config, straight to local mode.
function start(): void {
  if (!firebaseConfigured) {
    createAuthScreen(app, showTeamScreen);
    return;
  }
  void initCloud().then(() => {
    const stop = watchAuth((uid) => {
      stop();
      if (uid) showTeamScreen();
      else createAuthScreen(app, showTeamScreen);
    });
  });
}

start();

// PWA: register the hand-written service worker so the game can be
// installed and played offline (only in the production build).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => undefined);
  });
}
