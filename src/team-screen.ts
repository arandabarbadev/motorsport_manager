import './team-screen.css';
import {
  createDefaultRoster,
  loadRoster,
  regenerateRivals,
  saveRoster,
  MAX_CAR_STAT,
  UPGRADE_COST,
  UPGRADE_STEP,
  Roster,
  TeamEntry,
} from './roster';
import { getOrCreateCareer, saveCareer, CareerState } from './career';

// ============================================================
// TEAM SCREEN (Phase 3): "Mi Equipo" management (name, livery
// color, budget, editable drivers, car upgrades) + rival editor
// (team name and driver names as plain text fields). Everything
// is persisted to localStorage on every change.
// ============================================================

type CarStat = 'aero' | 'engine' | 'chassis';

const STAT_LABELS: Record<CarStat, string> = {
  aero: 'Aerodinámica',
  engine: 'Motor',
  chassis: 'Chasis',
};

export function createTeamScreen(container: HTMLElement, onGoRace: () => void): void {
  container.innerHTML = '';
  let roster: Roster = loadRoster() ?? createDefaultRoster();
  saveRoster(roster); // first open: persist the generated grid

  const root = document.createElement('div');
  root.className = 'team-screen';
  root.innerHTML = `
    <header class="team-header">
      <h1>🏆 Motorsport Manager</h1>
      <div class="budget-chip">Presupuesto: <span class="budget-value"></span> M€</div>
      <button type="button" class="btn primary go-race-btn">🏁 Ir a la carrera</button>
    </header>
    <main class="team-main">
      <section class="card">
        <h2>Mi Equipo</h2>
        <div class="form-row">
          <label class="field">Nombre del equipo
            <input class="in team-name-input" type="text" maxlength="24" />
          </label>
          <label class="field">Color de librea
            <input class="in team-color-input" type="color" />
          </label>
        </div>
        <div class="form-row">
          <label class="field">Piloto 1
            <input class="in player-driver-input" data-seat="0" type="text" maxlength="24" />
          </label>
          <label class="field">Piloto 2
            <input class="in player-driver-input" data-seat="1" type="text" maxlength="24" />
          </label>
        </div>
        <h3>Desarrollo del coche (mejora tus 2 coches a la vez)</h3>
        <div class="upgrade-list"></div>
      </section>
      <section class="card">
        <h2>Rivales
          <button type="button" class="btn regen-btn">🎲 Generar parrilla nueva</button>
        </h2>
        <div class="rival-list"></div>
      </section>
    </main>`;
  container.appendChild(root);

  const playerEntry = (): TeamEntry =>
    roster.entries.find((e) => e.team.id === roster.playerTeamId)!;

  // Phase 4: the real budget lives in the persistent career state;
  // the roster copy only serves as fallback for old (Phase 3) saves.
  const career: CareerState = getOrCreateCareer(playerEntry().team.budget);
  saveCareer(career);

  const budgetValueEl = root.querySelector<HTMLElement>('.budget-value')!;
  const teamNameInput = root.querySelector<HTMLInputElement>('.team-name-input')!;
  const teamColorInput = root.querySelector<HTMLInputElement>('.team-color-input')!;
  const upgradeList = root.querySelector<HTMLElement>('.upgrade-list')!;
  const rivalList = root.querySelector<HTMLElement>('.rival-list')!;

  // Two-way text binding: saves on every edit, restores if left empty.
  function bindTextInput(
    input: HTMLInputElement,
    get: () => string,
    set: (v: string) => void
  ): void {
    input.value = get();
    input.addEventListener('input', () => {
      const v = input.value.trim();
      if (v) {
        set(v);
        saveRoster(roster);
      }
    });
    input.addEventListener('change', () => {
      if (!input.value.trim()) input.value = get();
    });
  }

  // ---- Mi Equipo ----
  bindTextInput(
    teamNameInput,
    () => playerEntry().team.name,
    (v) => {
      playerEntry().team.name = v;
    }
  );
  teamColorInput.value = playerEntry().team.color;
  teamColorInput.addEventListener('input', () => {
    playerEntry().team.color = teamColorInput.value;
    saveRoster(roster);
    renderRivals(); // refresh the color dots
  });
  for (const input of root.querySelectorAll<HTMLInputElement>('.player-driver-input')) {
    const seat = Number(input.dataset.seat);
    bindTextInput(
      input,
      () => playerEntry().drivers[seat].name,
      (v) => {
        playerEntry().drivers[seat].name = v;
      }
    );
  }

  // ---- Upgrades ----
  const upgradeButtons = new Map<CarStat, HTMLButtonElement>();
  const statValues = new Map<CarStat, HTMLElement>();
  for (const stat of ['aero', 'engine', 'chassis'] as CarStat[]) {
    const row = document.createElement('div');
    row.className = 'upgrade-row';
    row.innerHTML = `
      <span class="stat-name">${STAT_LABELS[stat]}</span>
      <span class="stat-value"></span>
      <button type="button" class="btn upgrade-btn"></button>`;
    statValues.set(stat, row.querySelector<HTMLElement>('.stat-value')!);
    const btn = row.querySelector<HTMLButtonElement>('.upgrade-btn')!;
    btn.addEventListener('click', () => {
      const entry = playerEntry();
      if (career.budget < UPGRADE_COST) return;
      if (entry.cars[0][stat] + UPGRADE_STEP > MAX_CAR_STAT) return;
      career.budget -= UPGRADE_COST;
      entry.team.budget = career.budget; // keep the roster copy in sync
      for (const car of entry.cars) car[stat] += UPGRADE_STEP;
      saveRoster(roster);
      saveCareer(career);
      refresh();
    });
    upgradeButtons.set(stat, btn);
    upgradeList.appendChild(row);
  }

  function refresh(): void {
    const entry = playerEntry();
    budgetValueEl.textContent = String(career.budget);
    for (const stat of upgradeButtons.keys()) {
      const value = entry.cars[0][stat];
      statValues.get(stat)!.textContent = String(value);
      const btn = upgradeButtons.get(stat)!;
      btn.textContent = `+${UPGRADE_STEP} · ${UPGRADE_COST} M€`;
      btn.disabled =
        value + UPGRADE_STEP > MAX_CAR_STAT || career.budget < UPGRADE_COST;
    }
  }

  // ---- Rival editor ----
  function renderRivals(): void {
    rivalList.innerHTML = '';
    for (const entry of roster.entries) {
      if (entry.team.id === roster.playerTeamId) continue;
      const row = document.createElement('div');
      row.className = 'rival-row';
      row.innerHTML = `
        <div class="rival-team-cell">
          <span class="rival-color" style="background:${entry.team.color}"></span>
          <input class="in rival-team-name" type="text" maxlength="24" />
        </div>
        <input class="in rival-driver-name" data-seat="0" type="text" maxlength="24" />
        <input class="in rival-driver-name" data-seat="1" type="text" maxlength="24" />`;
      bindTextInput(
        row.querySelector<HTMLInputElement>('.rival-team-name')!,
        () => entry.team.name,
        (v) => {
          entry.team.name = v;
        }
      );
      for (const input of row.querySelectorAll<HTMLInputElement>('.rival-driver-name')) {
        const seat = Number(input.dataset.seat);
        bindTextInput(
          input,
          () => entry.drivers[seat].name,
          (v) => {
            entry.drivers[seat].name = v;
          }
        );
      }
      rivalList.appendChild(row);
    }
  }

  root.querySelector<HTMLButtonElement>('.regen-btn')!.addEventListener('click', () => {
    if (
      !window.confirm(
        '¿Generar una parrilla de rivales nueva? Se pierden los nombres editados de los rivales.'
      )
    ) {
      return;
    }
    roster = regenerateRivals(roster);
    saveRoster(roster);
    renderRivals();
  });

  root.querySelector<HTMLButtonElement>('.go-race-btn')!.addEventListener('click', () => {
    onGoRace();
  });

  renderRivals();
  refresh();
}
