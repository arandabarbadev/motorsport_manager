import './team-screen.css';
import { Car } from './types';
import {
  createDefaultRoster,
  loadRoster,
  regenerateRivals,
  saveRoster,
  DEV_COST_PER_POINT,
  DEV_IDS,
  DEV_LABELS,
  DEV_MAX_LEVEL,
  Roster,
  TeamEntry,
} from './roster';
import {
  getOrCreateCareer,
  isSeasonComplete,
  saveCareer,
  STAFF_MAX_LEVEL,
  staffUpgradeCost,
  CareerState,
} from './career';
import { ALL_TRACKS, getTrackById } from './tracks-generator';
import { themeButtonLabel, toggleTheme } from './theme';
import { ALL_SPONSORS, getSponsor, isSponsorUnlocked } from './sponsors';
import { computeRaceFinance } from './finance';
import { logout, scheduleCloudSync, watchAuth } from './cloud';

// ============================================================
// TEAM SCREEN: management hub with 4 tabs (player request
// 2026-09-27): Mi Equipo (identity + 9 car developments), Sede
// (staff), Rivales (editor + stats) and Patrocinadores (100 fake
// companies). Header: budget, reset-season, theme, logout and
// the race button.
// ============================================================

type TabId = 'team' | 'hq' | 'rivals' | 'sponsors';
type StaffKey = 'mechanics' | 'engineers' | 'commercial';

const STAFF_INFO: Record<StaffKey, { label: string; effect: (level: number) => string }> = {
  mechanics: {
    label: '🧰 Mecánicos',
    effect: (l) => `Boxes: −${((l - 1) * 1.5).toFixed(1).replace('.', ',')} s por parada`,
  },
  engineers: {
    label: '👨‍🔬 Ingenieros',
    effect: (l) => `Mejoras del coche: −${(l - 1) * 5}% de coste`,
  },
  commercial: {
    label: '💼 Comerciales',
    effect: (l) => `Ingresos de patrocinio: +${(l - 1) * 5}%`,
  },
};

export function createTeamScreen(container: HTMLElement, onGoRace: () => void): void {
  container.innerHTML = '';
  let roster: Roster = loadRoster() ?? createDefaultRoster();
  saveRoster(roster);
  let career: CareerState = getOrCreateCareer(
    roster.entries.find((e) => e.team.id === roster.playerTeamId)!.team.budget
  );
  saveCareer(career);
  let tab: TabId = 'team';

  const root = document.createElement('div');
  root.className = 'team-screen';
  root.innerHTML = `
    <header class="team-header">
      <nav class="nav-tabs">
        <button type="button" class="btn nav-btn active" data-tab="team">🚗 Mi Equipo</button>
        <button type="button" class="btn nav-btn" data-tab="hq">🏛️ Sede</button>
        <button type="button" class="btn nav-btn" data-tab="rivals">🏁 Rivales</button>
        <button type="button" class="btn nav-btn" data-tab="sponsors">💼 Patrocinadores</button>
      </nav>
      <div class="header-right">
        <div class="budget-chip"><span class="budget-value"></span> M</div>
        <button type="button" class="btn reset-season-btn" title="Volver a la ronda 1 de esta temporada (conservas dinero, mejoras y sede)">↺ Temporada</button>
        <button type="button" class="btn theme-btn"></button>
        <button type="button" class="btn logout-btn hidden">🚪 Salir</button>
        <button type="button" class="btn primary go-race-btn">🏁 Carrera</button>
      </div>
    </header>
    <main class="team-main">
      <section class="card tab-panel"></section>
    </main>`;
  container.appendChild(root);

  const playerEntry = (): TeamEntry =>
    roster.entries.find((e) => e.team.id === roster.playerTeamId)!;

  const panel = root.querySelector<HTMLElement>('.tab-panel')!;
  const budgetValueEl = root.querySelector<HTMLElement>('.budget-value')!;
  const goRaceBtn = root.querySelector<HTMLButtonElement>('.go-race-btn')!;
  const themeBtn = root.querySelector<HTMLButtonElement>('.theme-btn')!;
  const resetBtn = root.querySelector<HTMLButtonElement>('.reset-season-btn')!;
  const logoutBtn = root.querySelector<HTMLButtonElement>('.logout-btn')!;
  const navBtns = [...root.querySelectorAll<HTMLButtonElement>('.nav-btn')];

  // Everything the screens save goes to localStorage + the cloud.
  function syncAll(): void {
    saveRoster(roster);
    saveCareer(career);
    scheduleCloudSync();
  }

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
        syncAll();
      }
    });
    input.addEventListener('change', () => {
      if (!input.value.trim()) input.value = get();
    });
  }

  // ---- Header controls ----
  themeBtn.textContent = themeButtonLabel();
  themeBtn.addEventListener('click', () => {
    toggleTheme();
    themeBtn.textContent = themeButtonLabel();
  });

  watchAuth((uid) => {
    logoutBtn.classList.toggle('hidden', !uid);
  });
  logoutBtn.addEventListener('click', () => {
    void logout().then(() => location.reload());
  });

  resetBtn.addEventListener('click', () => {
    if (
      !window.confirm(
        '¿Reiniciar la TEMPORADA? Vuelves a la ronda 1 de la temporada actual. Conservas dinero, mejoras del coche y sede.'
      )
    ) {
      return;
    }
    career.seasonResults = [];
    career.currentRaceIndex = 0;
    syncAll();
    refresh();
  });

  function updateRaceButton(): void {
    if (isSeasonComplete(career)) {
      goRaceBtn.textContent = '🏆 Ver temporada';
    } else {
      const track =
        getTrackById(career.calendar[career.currentRaceIndex]) ?? ALL_TRACKS[0];
      goRaceBtn.textContent = `🏁 Carrera · R${Math.min(
        career.currentRaceIndex + 1,
        career.calendar.length
      )}: ${track.name}`;
    }
  }
  goRaceBtn.addEventListener('click', () => onGoRace());

  // ---- Tabs ----
  for (const btn of navBtns) {
    btn.addEventListener('click', () => {
      tab = btn.dataset.tab as TabId;
      navBtns.forEach((b) => b.classList.toggle('active', b === btn));
      renderTab();
    });
  }

  function refresh(): void {
    budgetValueEl.textContent = String(Math.round(career.budget));
    updateRaceButton();
    renderTab();
  }

  function renderTab(): void {
    panel.innerHTML = '';
    if (tab === 'team') renderTeamTab();
    else if (tab === 'hq') renderHqTab();
    else if (tab === 'rivals') renderRivalsTab();
    else renderSponsorsTab();
  }

  // ---- Tab: Mi Equipo ----
  function renderTeamTab(): void {
    const title = document.createElement('h2');
    title.textContent = 'Mi Equipo';
    panel.appendChild(title);

    const identity = document.createElement('div');
    identity.className = 'form-row';
    identity.innerHTML = `
      <label class="field">Nombre del equipo
        <input class="in team-name-input" type="text" maxlength="24" />
      </label>
      <label class="field">Color de librea
        <input class="in team-color-input" type="color" />
      </label>
      <label class="field">Piloto 1
        <input class="in player-driver-input" data-seat="0" type="text" maxlength="24" />
      </label>
      <label class="field">Piloto 2
        <input class="in player-driver-input" data-seat="1" type="text" maxlength="24" />
      </label>`;
    panel.appendChild(identity);

    bindTextInput(
      identity.querySelector<HTMLInputElement>('.team-name-input')!,
      () => playerEntry().team.name,
      (v) => {
        playerEntry().team.name = v;
      }
    );
    const colorInput = identity.querySelector<HTMLInputElement>('.team-color-input')!;
    colorInput.value = playerEntry().team.color;
    colorInput.addEventListener('input', () => {
      playerEntry().team.color = colorInput.value;
      syncAll();
    });
    for (const input of identity.querySelectorAll<HTMLInputElement>('.player-driver-input')) {
      const seat = Number(input.dataset.seat);
      bindTextInput(
        input,
        () => playerEntry().drivers[seat].name,
        (v) => {
          playerEntry().drivers[seat].name = v;
        }
      );
    }

    const devTitle = document.createElement('h3');
    devTitle.textContent = 'Desarrollo del coche (tus 2 coches a la vez)';
    panel.appendChild(devTitle);

    const devList = document.createElement('div');
    devList.className = 'dev-list';
    const developments = playerEntry().developments ?? {};
    playerEntry().developments = developments;
    // Engineers discount on development costs.
    const cost = Math.ceil(DEV_COST_PER_POINT * (1 - 0.05 * (career.staff.engineers - 1)));
    for (const devId of DEV_IDS) {
      const level = developments[devId] ?? 0;
      const row = document.createElement('div');
      row.className = 'dev-row';
      row.innerHTML = `
        <span class="dev-name">${DEV_LABELS[devId]}</span>
        <span class="dev-level"></span>
        <button type="button" class="btn dev-btn"></button>`;
      const levelEl = row.querySelector<HTMLElement>('.dev-level')!;
      levelEl.textContent = `${level}/${DEV_MAX_LEVEL}`;
      const btn = row.querySelector<HTMLButtonElement>('.dev-btn')!;
      const maxed = level >= DEV_MAX_LEVEL;
      btn.textContent = maxed ? 'MÁX' : `+1 · ${cost} M€`;
      btn.disabled = maxed || career.budget < cost;
      btn.addEventListener('click', () => {
        if (level >= DEV_MAX_LEVEL || career.budget < cost) return;
        career.budget -= cost;
        developments[devId] = level + 1;
        syncAll();
        refresh();
      });
      devList.appendChild(row);
    }
    panel.appendChild(devList);
  }

  // ---- Tab: Sede ----
  function renderHqTab(): void {
    const title = document.createElement('h2');
    title.textContent = '🏛️ Sede del equipo';
    panel.appendChild(title);

    const staffList = document.createElement('div');
    staffList.className = 'staff-list';
    for (const key of ['mechanics', 'engineers', 'commercial'] as StaffKey[]) {
      const level = career.staff[key];
      const info = STAFF_INFO[key];
      const row = document.createElement('div');
      row.className = 'staff-row';
      row.innerHTML = `
        <div class="staff-head">
          <span class="staff-name">${info.label}</span>
          <span class="staff-level"></span>
        </div>
        <div class="staff-effect">${info.effect(level)}</div>
        <button type="button" class="btn staff-btn"></button>`;
      const levelEl = row.querySelector<HTMLElement>('.staff-level')!;
      levelEl.textContent = '▮'.repeat(level) + '▯'.repeat(STAFF_MAX_LEVEL - level);
      const btn = row.querySelector<HTMLButtonElement>('.staff-btn')!;
      const cost = staffUpgradeCost(level);
      const maxed = level >= STAFF_MAX_LEVEL;
      btn.textContent = maxed ? 'MÁX' : `Mejorar · ${cost} M€`;
      btn.disabled = maxed || career.budget < cost;
      btn.addEventListener('click', () => {
        if (maxed || career.budget < cost) return;
        career.budget -= cost;
        career.staff[key] += 1;
        syncAll();
        refresh();
      });
      staffList.appendChild(row);
    }
    panel.appendChild(staffList);

    const finance = computeRaceFinance(0, career);
    const costs = finance.driversCost + finance.staffCost + finance.rentCost;
    const costsEl = document.createElement('p');
    costsEl.className = 'hq-costs';
    costsEl.textContent = `Gastos fijos por carrera: −${costs} M€ (pilotos ${finance.driversCost}, personal ${finance.staffCost}, alquiler ${finance.rentCost})`;
    panel.appendChild(costsEl);
  }

  // ---- Tab: Rivales ----
  function renderRivalsTab(): void {
    const title = document.createElement('h2');
    title.textContent = 'Rivales';
    const regenBtn = document.createElement('button');
    regenBtn.type = 'button';
    regenBtn.className = 'btn';
    regenBtn.textContent = '🎲 Generar parrilla nueva';
    title.appendChild(regenBtn);
    panel.appendChild(title);

    regenBtn.addEventListener('click', () => {
      if (
        !window.confirm(
          '¿Generar una parrilla de rivales nueva? Se pierden los nombres editados de los rivales.'
        )
      ) {
        return;
      }
      roster = regenerateRivals(roster);
      syncAll();
      renderTab();
    });

    const rivalList = document.createElement('div');
    rivalList.className = 'rival-list';
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
        <input class="in rival-driver-name" data-seat="1" type="text" maxlength="24" />
        <span class="rival-stats"></span>`;
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
      const avg = (get: (c: Car) => number): number =>
        Math.round((get(entry.cars[0]) + get(entry.cars[1])) / 2);
      row.querySelector<HTMLElement>('.rival-stats')!.textContent =
        `A ${avg((c) => c.aero)} · M ${avg((c) => c.engine)} · C ${avg((c) => c.chassis)}`;
      rivalList.appendChild(row);
    }
    panel.appendChild(rivalList);
  }

  // ---- Tab: Patrocinadores ----
  function renderSponsorsTab(): void {
    const title = document.createElement('h2');
    title.textContent = '💼 Patrocinadores';
    panel.appendChild(title);

    const active = getSponsor(career.sponsorId);
    const current = document.createElement('p');
    current.className = 'sponsor-current';
    current.textContent = active
      ? `Patrocinador actual: ${active.name} (+${String(
          computeRaceFinance(0, career).sponsor
        ).replace('.', ',')} M€ por carrera)`
      : 'Sin patrocinador: firma uno para cobrar cada carrera.';
    panel.appendChild(current);

    const list = document.createElement('div');
    list.className = 'sponsor-list';
    // Best paid first.
    for (let i = ALL_SPONSORS.length - 1; i >= 0; i--) {
      const sponsor = ALL_SPONSORS[i];
      const row = document.createElement('div');
      row.className = 'sponsor-row';
      row.innerHTML = `
        <span class="sponsor-rank">#${i + 1}</span>
        <span class="sponsor-name"></span>
        <span class="sponsor-pay"></span>
        <button type="button" class="btn sponsor-btn"></button>`;
      row.querySelector<HTMLElement>('.sponsor-name')!.textContent = sponsor.name;
      row.querySelector<HTMLElement>('.sponsor-pay')!.textContent =
        `${String(sponsor.payPerRace).replace('.', ',')} M€/carrera · exige P${sponsor.requiredPosition}`;
      const btn = row.querySelector<HTMLButtonElement>('.sponsor-btn')!;
      const isActive = career.sponsorId === sponsor.id;
      const unlocked = isSponsorUnlocked(sponsor, career);
      btn.textContent = isActive ? '✅ Activo' : unlocked ? 'Firmar' : `🔒 P${sponsor.requiredPosition}`;
      btn.disabled = isActive || !unlocked;
      btn.addEventListener('click', () => {
        if (isActive || !unlocked) return;
        career.sponsorId = sponsor.id;
        syncAll();
        refresh();
      });
      list.appendChild(row);
    }
    panel.appendChild(list);
  }

  refresh();
}
