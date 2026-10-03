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
import { swapScreen } from './screen-transition';

// Entry point: login (Firebase) or local mode, then management.
// "Ir a la carrera" runs the calendar's current GP; a completed
// season opens the summary. Every swap goes through the same
// fade transition (Phase 7).
const app = document.getElementById('app')!;

initTheme();

function showTeamScreen(): void {
  swapScreen(app, () => createTeamScreen(app, showRaceScreen));
}

function showSeasonScreen(): void {
  swapScreen(app, () => createSeasonScreen(app, showTeamScreen));
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
  const rosterSnapshot = roster;
  const careerSnapshot = career;
  swapScreen(app, () =>
    createRaceScreen(
      app,
      () => buildRaceStateFromRoster(rosterSnapshot, track, careerSnapshot),
      showTeamScreen,
      showSeasonScreen
    )
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
