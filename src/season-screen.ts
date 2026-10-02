import './season-screen.css';
import { getOrCreateCareer, isSeasonComplete, saveCareer } from './career';
import { getTrackById } from './tracks-generator';
import { themeButtonLabel, toggleTheme } from './theme';
import { scheduleCloudSync } from './cloud';

// ============================================================
// SEASON SCREEN (Phase 6): end-of-season summary. Lists every
// race of the season (track, best player position, prize) with
// the total earned, and the "start next season" button that
// resets the calendar and results but KEEPS budget and car
// upgrades.
// ============================================================

export function createSeasonScreen(container: HTMLElement, onExit: () => void): void {
  container.innerHTML = '';
  const career = getOrCreateCareer();

  const root = document.createElement('div');
  root.className = 'season-screen';

  const header = document.createElement('header');
  header.className = 'season-header';
  header.innerHTML = `<h1>Temporada ${career.seasonNumber} ${
    isSeasonComplete(career) ? 'completada' : '— resumen parcial'
  }</h1>`;
  const themeBtn = document.createElement('button');
  themeBtn.type = 'button';
  themeBtn.className = 'btn';
  themeBtn.textContent = themeButtonLabel();
  themeBtn.addEventListener('click', () => {
    toggleTheme();
    themeBtn.textContent = themeButtonLabel();
  });
  header.appendChild(themeBtn);
  root.appendChild(header);

  const main = document.createElement('main');
  main.className = 'season-main';

  const card = document.createElement('section');
  card.className = 'card';

  const list = document.createElement('div');
  list.className = 'season-list';
  let total = 0;
  career.seasonResults.forEach((result, i) => {
    total += result.prize;
    const row = document.createElement('div');
    row.className = 'season-row';
    const trackName = getTrackById(result.trackId)?.name ?? result.trackId;
    row.innerHTML = `
      <span class="round">R${String(i + 1).padStart(2, '0')}</span>
      <span class="track"></span>
      <span class="pos">P${result.position}</span>
      <span class="prize">+${result.prize} M€</span>`;
    (row.querySelector<HTMLElement>('.track')!).textContent = trackName;
    list.appendChild(row);
  });
  if (career.seasonResults.length === 0) {
    list.innerHTML = '<div class="empty">Todavía no hay carreras completadas.</div>';
  }
  card.appendChild(list);

  const totals = document.createElement('div');
  totals.className = 'season-totals';
  totals.innerHTML = `
    <div>Total ganado en premios: <strong>${total} M€</strong></div>
    <div>Presupuesto del equipo: <strong>${career.budget} M€</strong></div>`;
  card.appendChild(totals);

  const actions = document.createElement('div');
  actions.className = 'season-actions';
  const newSeasonBtn = document.createElement('button');
  newSeasonBtn.type = 'button';
  newSeasonBtn.className = 'btn primary';
  newSeasonBtn.textContent = 'Empezar temporada nueva';
  newSeasonBtn.addEventListener('click', () => {
    // Next season: index and results reset; budget and car upgrades
    // stay untouched.
    career.seasonNumber += 1;
    career.seasonResults = [];
    career.currentRaceIndex = 0;
    saveCareer(career);
    scheduleCloudSync();
    onExit();
  });
  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'btn';
  backBtn.textContent = 'Mi Equipo';
  backBtn.addEventListener('click', () => onExit());
  actions.append(newSeasonBtn, backBtn);
  card.appendChild(actions);

  main.appendChild(card);
  root.appendChild(main);
  container.appendChild(root);
}
