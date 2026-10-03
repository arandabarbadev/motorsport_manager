import './race-screen.css';
import { RaceCarState, RaceState, TyreCompound, Weather } from './types';
import type { RaceEvent } from './types';
import { standingsFromClassification } from './championship';
import {
  getFinalClassification,
  isRaceFinished,
  queuePitCommand,
  simulationTick,
} from './simulation';
import { prizeForPosition } from './prize-table';
import { getOrCreateCareer, saveCareer } from './career';
import { getTrackById } from './tracks-generator';
import { onThemeChange, themeButtonLabel, toggleTheme } from './theme';
import { computeRaceFinance } from './finance';
import { scheduleCloudSync } from './cloud';
import { buildTrackSampler, Point, TrackSampler } from './track-path';

// ============================================================
// RACE SCREEN (Phase 2)
// Canvas renderer + HUD, fully decoupled from the engine:
// - simulationTick runs on its own setInterval (TICK_MS).
// - requestAnimationFrame only READS RaceState and draws.
// - Player pit stops go through queuePitCommand, so they are
//   applied at the start of the next simulation tick.
// ============================================================

// One simulation tick every TICK_MS real milliseconds. Each tick advances
// simTimeMultiplier simulated seconds, so at 1x the race runs 5x faster
// than real time (a ~4500s race takes ~15 real minutes). Purely a
// game-feel constant: lower = smoother and slower.
const TICK_MS = 200;

// The canvas redraws every frame; the DOM HUD refreshes at this rate.
const HUD_INTERVAL_MS = 200;

const COMPOUND_LABEL: Record<TyreCompound, string> = {
  soft: 'S',
  medium: 'M',
  hard: 'H',
  wet: 'W',
};

const WEATHER_LABEL: Record<Weather, string> = {
  dry: 'Seco',
  lightRain: 'Lluvia ligera',
  heavyRain: 'Lluvia fuerte',
};

interface StandingRow {
  root: HTMLLIElement;
  pos: HTMLElement;
  gap: HTMLElement;
  tyre: HTMLElement;
  wearFill: HTMLElement;
  pitflag: HTMLElement;
}

interface PitBox {
  carDriverId: string;
  status: HTMLElement;
  buttons: HTMLButtonElement[];
}

export function createRaceScreen(
  container: HTMLElement,
  buildInitialState: () => RaceState,
  onExit?: () => void,
  onSeasonEnd?: () => void
): void {
  container.innerHTML = '';

  const root = document.createElement('div');
  root.className = 'race-screen';
  root.innerHTML = `
    <header class="race-header">
      <div class="race-title">
        <span class="race-name"></span>
        <span class="race-lap"></span>
      </div>
      <div class="race-meta">
        <span class="race-weather"></span>
        <span class="race-clock"></span>
      </div>
      <div class="race-controls">
        <button type="button" class="btn exit-btn">Mi Equipo</button>
        <button type="button" class="btn pause-btn"></button>
        <button type="button" class="btn speed-btn" data-speed="1">1x</button>
        <button type="button" class="btn speed-btn" data-speed="5">5x</button>
        <button type="button" class="btn speed-btn" data-speed="10">10x</button>
        <button type="button" class="btn speed-btn" data-speed="20">20x</button>
        <button type="button" class="btn restart-btn">Nueva carrera</button>
        <button type="button" class="btn theme-btn"></button>
      </div>
    </header>
    <div class="race-body">
      <div class="track-wrap">
        <canvas class="track-canvas"></canvas>
        <div class="flag-indicator hidden"></div>
        <div class="results-overlay hidden">
          <div class="results-panel">
            <h2>Carrera terminada</h2>
            <div class="results-list"></div>
            <div class="finance-list"></div>
            <div class="results-total"></div>
            <div class="results-actions">
              <button type="button" class="btn primary overlay-season-btn hidden">Ver resumen de temporada</button>
              <button type="button" class="btn overlay-exit-btn">Mi Equipo</button>
            </div>
          </div>
        </div>
      </div>
      <aside class="hud">
        <div class="pit-panel"></div>
        <h2 class="hud-title">Clasificación</h2>
        <ol class="standings"></ol>
      </aside>
    </div>
  `;
  container.appendChild(root);

  const canvas = root.querySelector<HTMLCanvasElement>('.track-canvas')!;
  const ctx = canvas.getContext('2d')!;
  // The track is static during a race: draw it once to an offscreen layer.
  const trackLayer = document.createElement('canvas');
  const layerCtx = trackLayer.getContext('2d')!;
  const overlayEl = root.querySelector<HTMLElement>('.results-overlay')!;
  const resultsListEl = root.querySelector<HTMLElement>('.results-list')!;
  const financeListEl = root.querySelector<HTMLElement>('.finance-list')!;
  const resultsTotalEl = root.querySelector<HTMLElement>('.results-total')!;
  const flagEl = root.querySelector<HTMLElement>('.flag-indicator')!;
  const nameEl = root.querySelector<HTMLElement>('.race-name')!;
  const lapEl = root.querySelector<HTMLElement>('.race-lap')!;
  const weatherEl = root.querySelector<HTMLElement>('.race-weather')!;
  const clockEl = root.querySelector<HTMLElement>('.race-clock')!;
  const pauseBtn = root.querySelector<HTMLButtonElement>('.pause-btn')!;
  const speedBtns = [...root.querySelectorAll<HTMLButtonElement>('.speed-btn')];
  const restartBtn = root.querySelector<HTMLButtonElement>('.restart-btn')!;
  const pitPanel = root.querySelector<HTMLElement>('.pit-panel')!;
  const standingsEl = root.querySelector<HTMLOListElement>('.standings')!;
  const exitBtn = root.querySelector<HTMLButtonElement>('.exit-btn')!;
  if (onExit) exitBtn.addEventListener('click', onExit);
  else exitBtn.remove();
  const overlayExitBtn = root.querySelector<HTMLButtonElement>('.overlay-exit-btn')!;
  if (onExit) overlayExitBtn.addEventListener('click', onExit);
  else overlayExitBtn.remove();
  const overlaySeasonBtn = root.querySelector<HTMLButtonElement>('.overlay-season-btn')!;
  if (onSeasonEnd) overlaySeasonBtn.addEventListener('click', onSeasonEnd);
  else overlaySeasonBtn.remove();
  const themeBtn = root.querySelector<HTMLButtonElement>('.theme-btn')!;
  themeBtn.textContent = themeButtonLabel();
  themeBtn.addEventListener('click', () => {
    toggleTheme();
  });
  // The cached track layer uses theme colors: repaint on theme change.
  onThemeChange(() => {
    themeBtn.textContent = themeButtonLabel();
    drawTrackLayer();
  });

  // Mutable screen state (rebuilt on restart).
  let state = buildInitialState();
  let sampler: TrackSampler = buildTrackSampler(state.track.path);
  // Phase 7 smooth motion: prevLapProgress/prevLap of each car from the
  // PREVIOUS tick, kept here in the render layer only — the engine's
  // RaceCarState stays untouched. The rendered position interpolates
  // between prev and current with alpha = timeSinceLastTick / tickMs.
  const shadow = new Map<string, { lap: number; progress: number }>();
  let lastTickAt = performance.now();
  let clockSec = 0;
  let finished = false;
  let prizeAwarded = false; // prize money is added exactly once per race

  // Race event feedback (Phase 7): brief highlights + floating texts,
  // driven ONLY by the engine's per-tick raceEvents list.
  const highlightUntil = new Map<string, number>();
  interface FloatingText {
    text: string;
    driverId: string;
    bornAt: number;
  }
  let floatingTexts: FloatingText[] = [];

  function consumeRaceEvents(events: RaceEvent[]): void {
    const now = performance.now();
    for (const ev of events) {
      if (ev.type === 'overtake') {
        highlightUntil.set(ev.carDriverId, now + 900);
        const car = state.cars.find((c) => c.driverId === ev.carDriverId);
        if (car?.isPlayerControlled && ev.newPosition !== undefined) {
          floatingTexts.push({
            text: `¡Adelantamiento! P${ev.newPosition}`,
            driverId: ev.carDriverId,
            bornAt: now,
          });
        }
      } else if (ev.type === 'pitEntry') {
        highlightUntil.set(ev.carDriverId, now + 900);
        const car = state.cars.find((c) => c.driverId === ev.carDriverId);
        if (car?.isPlayerControlled) {
          floatingTexts.push({ text: '¡A boxes!', driverId: ev.carDriverId, bornAt: now });
        }
      }
    }
    if (floatingTexts.length > 6) floatingTexts = floatingTexts.slice(-6);
  }
  let pendingPit = new Set<string>();
  const rows = new Map<string, StandingRow>();
  const pitBoxes: PitBox[] = [];

  const teamById = (id: string) => state.teams.find((t) => t.id === id)!;
  const driverById = (id: string) => state.drivers.find((d) => d.id === id)!;

  function snapshotShadow(): void {
    for (const car of state.cars) {
      shadow.set(car.driverId, { lap: car.currentLap, progress: car.lapProgress });
    }
  }

  // Full (re)build: used on first load and on "Nueva carrera".
  function setup(): void {
    state = buildInitialState();
    state.simTimeMultiplier = 1; // start slow, the player speeds up at will
    sampler = buildTrackSampler(state.track.path);
    shadow.clear();
    snapshotShadow();
    pendingPit = new Set<string>();
    clockSec = 0;
    finished = false;
    lastTickAt = performance.now();
    overlayEl.classList.add('hidden');
    overlaySeasonBtn.classList.add('hidden');
    prizeAwarded = false;
    buildStandings();
    buildPitPanel();
    updateControls();
    updateHeader();
    updateHud();
    resize();
  }

  // ---- Track drawing (offscreen layer) ----

  let view = { ox: 0, oy: 0, s: 1 };

  const toPx = (p: Point): Point => ({ x: p.x * view.s + view.ox, y: p.y * view.s + view.oy });

  function computeView(): void {
    const pts = sampler.polyline();
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of pts) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const w = canvas.width;
    const h = canvas.height;
    const margin = 0.07 * Math.min(w, h);
    const sx = (w - 2 * margin) / Math.max(1e-6, maxX - minX);
    const sy = (h - 2 * margin) / Math.max(1e-6, maxY - minY);
    view.s = Math.min(sx, sy);
    view.ox = (w - (maxX - minX) * view.s) / 2 - minX * view.s;
    view.oy = (h - (maxY - minY) * view.s) / 2 - minY * view.s;
  }

  function drawTrackLayer(): void {
    const w = trackLayer.width;
    const h = trackLayer.height;
    layerCtx.clearRect(0, 0, w, h);
    const roadWidth = Math.max(12, 0.062 * Math.min(w, h)); // wide enough to see overtakes
    // Track colors follow the active theme (light/dark).
    const cssVar = (name: string): string =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    const strokeLoop = (width: number, color: string): void => {
      layerCtx.beginPath();
      const pts = sampler.polyline();
      pts.forEach((p, i) => {
        const q = toPx(p);
        if (i === 0) layerCtx.moveTo(q.x, q.y);
        else layerCtx.lineTo(q.x, q.y);
      });
      layerCtx.closePath();
      layerCtx.lineWidth = width;
      layerCtx.strokeStyle = color;
      layerCtx.lineJoin = 'round';
      layerCtx.lineCap = 'round';
      layerCtx.stroke();
    };

    strokeLoop(roadWidth + Math.max(2, roadWidth * 0.12), cssVar('--track-border'));
    strokeLoop(roadWidth, cssVar('--track-asphalt'));
    strokeLoop(1.5, cssVar('--track-line'));

    // Start/finish line across the track at t = 0.
    const a = toPx(sampler.pointAt(0.998));
    const b = toPx(sampler.pointAt(0.002));
    const mid = toPx(sampler.pointAt(0));
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    layerCtx.beginPath();
    layerCtx.moveTo(mid.x + nx * roadWidth * 0.55, mid.y + ny * roadWidth * 0.55);
    layerCtx.lineTo(mid.x - nx * roadWidth * 0.55, mid.y - ny * roadWidth * 0.55);
    layerCtx.lineWidth = 4;
    layerCtx.strokeStyle = cssVar('--track-start');
    layerCtx.stroke();
  }

  function resize(): void {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(120, Math.round(rect.width * dpr));
    canvas.height = Math.max(120, Math.round(rect.height * dpr));
    trackLayer.width = canvas.width;
    trackLayer.height = canvas.height;
    computeView();
    drawTrackLayer();
  }

  // ---- Simulation loop (own interval, decoupled from rendering) ----

  window.setInterval(() => {
    if (state.isPaused || finished) {
      snapshotShadow(); // keep the render lerp anchored while paused
      lastTickAt = performance.now();
      return;
    }
    snapshotShadow();
    simulationTick(state);
    consumeRaceEvents(state.raceEvents);
    clockSec += state.simTimeMultiplier;
    lastTickAt = performance.now();

    // Chequered flag (engine condition) -> prizes + results overlay.
    if (isRaceFinished(state)) {
      finished = true;
      state.isPaused = true;
      awardPrizesAndShowResults();
      updateControls();
      updateHud();
    }
  }, TICK_MS);

  // ---- Render loop (requestAnimationFrame, only reads state) ----

  function render(now: number): void {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    if (
      Math.round(rect.width * dpr) !== canvas.width ||
      Math.round(rect.height * dpr) !== canvas.height
    ) {
      resize();
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(trackLayer, 0, 0);
    drawCars(now);
    drawEffects(now);
    if (now - lastHudAt >= HUD_INTERVAL_MS) {
      updateHud();
      updateHeader();
      lastHudAt = now;
    }
    requestAnimationFrame(render);
  }

  let lastHudAt = 0;

  const carRadius = (): number => Math.max(4, 0.016 * Math.min(canvas.width, canvas.height));

  // Event feedback layer: highlight rings + rising floating texts.
  function drawEffects(now: number): void {
    const r = carRadius();
    for (const car of state.cars) {
      const until = highlightUntil.get(car.driverId) ?? 0;
      if (now >= until) continue;
      const total = car.currentLap + car.lapProgress;
      const p = toPx(sampler.pointAt(total));
      const life = (until - now) / 900; // 1 -> 0
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 5 + (1 - life) * 3, 0, Math.PI * 2);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * life})`;
      ctx.stroke();
    }
    floatingTexts = floatingTexts.filter((f) => now - f.bornAt < 1200);
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    for (const f of floatingTexts) {
      const car = state.cars.find((c) => c.driverId === f.driverId);
      if (!car) continue;
      const total = car.currentLap + car.lapProgress;
      const p = toPx(sampler.pointAt(total));
      const progress = (now - f.bornAt) / 1200;
      const y = p.y - r - 8 - progress * 26;
      ctx.globalAlpha = 1 - progress;
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.strokeText(f.text, p.x, y);
      ctx.fillStyle = '#ffd700';
      ctx.fillText(f.text, p.x, y);
      ctx.globalAlpha = 1;
    }
    ctx.textAlign = 'start';
  }

  function drawCars(now: number): void {
    // Interpolate positions between the last two ticks for smooth motion
    // (prevLapProgress -> lapProgress, alpha = timeSinceLastTick / tickMs).
    const alpha = Math.min(1, (now - lastTickAt) / TICK_MS);
    const r = carRadius();
    const sorted = [...state.cars].sort((a, b) => b.position - a.position);
    for (const car of sorted) {
      const sh = shadow.get(car.driverId) ?? {
        lap: car.currentLap,
        progress: car.lapProgress,
      };
      const prevTotal = sh.lap + sh.progress;
      const currTotal = car.currentLap + car.lapProgress;
      const p = toPx(sampler.pointAt(prevTotal + (currTotal - prevTotal) * alpha));
      const cssVar = (name: string): string =>
        getComputedStyle(document.documentElement).getPropertyValue(name).trim();

      if (car.status === 'dnf') {
        // Crashed/broken car: faded grey ghost on the track.
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 0.8, 0, Math.PI * 2);
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = cssVar('--dim');
        ctx.fill();
        ctx.globalAlpha = 1;
        return;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, car.status === 'inPit' ? r * 0.75 : r, 0, Math.PI * 2);
      ctx.fillStyle = teamById(car.teamId).color;
      ctx.globalAlpha = car.status === 'inPit' ? 0.35 : 1;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = Math.max(1.2, r * 0.3);
      ctx.strokeStyle = car.isPlayerControlled ? '#ffd700' : cssVar('--car-outline');
      ctx.stroke();
    }
  }

  // ---- HUD ----

  function buildStandings(): void {
    standingsEl.innerHTML = '';
    rows.clear();
    for (const car of state.cars) {
      const li = document.createElement('li');
      li.className = 'standing-row' + (car.isPlayerControlled ? ' player' : '');
      li.innerHTML = `
        <span class="pos"></span>
        <span class="tcolor"></span>
        <span class="dname"></span>
        <span class="gap"></span>
        <span class="tyre"></span>
        <span class="wear"><span class="wear-fill"></span></span>
        <span class="pitflag">BOX</span>`;
      const team = teamById(car.teamId);
      (li.querySelector<HTMLElement>('.tcolor')!).style.background = team.color;
      (li.querySelector<HTMLElement>('.dname')!).textContent =
        driverById(car.driverId).name + (car.isPlayerControlled ? ' (tú)' : '');
      rows.set(car.driverId, {
        root: li,
        pos: li.querySelector<HTMLElement>('.pos')!,
        gap: li.querySelector<HTMLElement>('.gap')!,
        tyre: li.querySelector<HTMLElement>('.tyre')!,
        wearFill: li.querySelector<HTMLElement>('.wear-fill')!,
        pitflag: li.querySelector<HTMLElement>('.pitflag')!,
      });
      standingsEl.appendChild(li);
    }
  }

  function updateHud(): void {
    const order = [...state.cars].sort((a, b) => a.position - b.position);
    const leaderLap = order[0].currentLap;
    for (const car of order) {
      const row = rows.get(car.driverId);
      if (!row) continue;
      // Re-append in position order (appendChild moves existing nodes).
      standingsEl.appendChild(row.root);
      row.pos.textContent = String(car.position);
      row.gap.textContent = car.status === 'dnf' ? 'DNF' : formatGap(car, leaderLap);
      row.tyre.textContent = COMPOUND_LABEL[car.tyre.compound];
      row.tyre.className = 'tyre ' + car.tyre.compound;
      const wear = Math.round(car.tyre.wear);
      row.wearFill.style.width = wear + '%';
      row.wearFill.className =
        'wear-fill' + (wear >= 80 ? ' danger' : wear >= 50 ? ' warn' : '');
      row.root.classList.toggle('pitting', car.status === 'inPit');
      row.root.classList.toggle('dnf', car.status === 'dnf');
      row.pitflag.textContent =
        car.status === 'inPit' ? `BOX ${Math.ceil(car.pitTimerSec)}s` : 'BOX';
    }
    for (const box of pitBoxes) {
      const car = state.cars.find((c) => c.driverId === box.carDriverId)!;
      if (car.status === 'inPit') {
        pendingPit.delete(box.carDriverId);
        box.status.textContent = `En boxes: ${Math.ceil(car.pitTimerSec)}s`;
      } else if (pendingPit.has(box.carDriverId)) {
        box.status.textContent = 'Orden enviada…';
      } else {
        box.status.textContent = `${car.pitStopsCompleted} parada(s)`;
      }
      for (const btn of box.buttons) {
        btn.disabled = finished || car.status !== 'racing';
      }
    }
  }

  function formatGap(car: RaceCarState, leaderLap: number): string {
    if (car.position === 1) return 'líder';
    const lapsDown = leaderLap - car.currentLap;
    if (lapsDown > 0) return `+${lapsDown}L`;
    return `+${car.gapToLeaderSec.toFixed(1)}s`;
  }

  function updateHeader(): void {
    nameEl.textContent = state.track.name;
    const leaderLap = Math.max(...state.cars.map((c) => c.currentLap));
    lapEl.textContent = `Vuelta ${Math.min(leaderLap + 1, state.track.totalLaps)}/${state.track.totalLaps}`;
    clockEl.textContent = formatClock(clockSec);
    weatherEl.textContent = WEATHER_LABEL[state.weather];
    // Race control flags, top-left over the track.
    if (finished) {
      flagEl.textContent = '¡BANDERA A CUADROS!';
      flagEl.className = 'flag-indicator checkered';
    } else if (state.flag === 'red') {
      flagEl.textContent = `BANDERA ROJA (${Math.ceil(state.flagTimerSec)}s)`;
      flagEl.className = 'flag-indicator red';
    } else if (state.flag === 'yellow') {
      flagEl.textContent = `BANDERA AMARILLA (${Math.ceil(state.flagTimerSec)}s)`;
      flagEl.className = 'flag-indicator yellow';
    } else {
      flagEl.className = 'flag-indicator hidden';
    }
  }

  function formatClock(totalSec: number): string {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = Math.floor(totalSec % 60);
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
  }

  // ---- Player pit commands ----

  function buildPitPanel(): void {
    pitPanel.innerHTML = '<h2 class="hud-title">Mis boxes</h2>';
    pitBoxes.length = 0;
    const compounds: TyreCompound[] = ['soft', 'medium', 'hard', 'wet'];
    for (const car of state.cars.filter((c) => c.isPlayerControlled)) {
      const box = document.createElement('div');
      box.className = 'pit-box';
      const title = document.createElement('div');
      title.className = 'pit-name';
      title.textContent = `${driverById(car.driverId).name} — cambiar a:`;
      const btns = document.createElement('div');
      btns.className = 'pit-btns';
      const buttons = compounds.map((compound) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn pit-btn';
        btn.textContent = COMPOUND_LABEL[compound];
        btn.title = compound;
        btn.addEventListener('click', () => {
          // Player command: queued and applied at the next tick start.
          if (finished || state.isPaused || car.status !== 'racing') return;
          queuePitCommand({
            carDriverId: car.driverId,
            newCompound: compound,
            requestedAtTick: state.currentTick,
          });
          pendingPit.add(car.driverId);
        });
        btns.appendChild(btn);
        return btn;
      });
      const status = document.createElement('div');
      status.className = 'pit-status';
      status.textContent = '0 parada(s)';
      box.append(title, btns, status);
      pitPanel.appendChild(box);
      pitBoxes.push({ carDriverId: car.driverId, status, buttons });
    }
  }

  // ---- Controls ----

  function updateControls(): void {
    pauseBtn.textContent = state.isPaused ? 'Seguir' : 'Pausa';
    pauseBtn.disabled = finished;
    // After the chequered flag the calendar moves on: no restart of
    // the same GP (the next one is entered from "Mi Equipo").
    restartBtn.disabled = finished;
    for (const btn of speedBtns) {
      btn.classList.toggle(
        'active',
        Number(btn.dataset.speed) === state.simTimeMultiplier
      );
      btn.disabled = finished;
    }
  }

  pauseBtn.addEventListener('click', () => {
    state.isPaused = !state.isPaused;
    updateControls();
  });

  for (const btn of speedBtns) {
    btn.addEventListener('click', () => {
      state.simTimeMultiplier = Number(btn.dataset.speed) as 1 | 5 | 10 | 20;
      updateControls();
    });
  }

  restartBtn.addEventListener('click', () => setup());

  // Phase 4: add the prize money of both player cars to the persistent
  // career budget (exactly once per race) and show the results overlay.
  function awardPrizesAndShowResults(): void {
    const playerResults = getFinalClassification(state)
      .filter((c) => c.isPlayerControlled)
      .map((c) => ({
        position: c.position,
        name: driverById(c.driverId).name,
        prize: prizeForPosition(c.position),
      }));
    const totalPrize = playerResults.reduce((sum, r) => sum + r.prize, 0);

    const career = getOrCreateCareer(0);
    let nextRaceLabel = '';
    const wasLastRace = career.currentRaceIndex >= career.calendar.length - 1;
    // Replay guard: a race already recorded this season pays nothing and
    // is not recorded twice — but season progress NEVER freezes.
    const alreadyRecorded = career.seasonResults.some(
      (r) => r.trackId === state.track.id
    );
    if (!prizeAwarded) {
      prizeAwarded = true;
      if (!alreadyRecorded) {
        // Full race finance: prizes + sponsor income - salaries - rent.
        const finance = computeRaceFinance(totalPrize, career);
        career.budget += finance.net;
        // Phase 6: record the season result (best of the two player cars).
        const bestPosition = Math.min(...playerResults.map((r) => r.position));
        career.seasonResults.push({
          trackId: state.track.id,
          position: bestPosition,
          prize: totalPrize,
          // Phase 7: championship points for every driver of this race.
          standings: standingsFromClassification(getFinalClassification(state)),
        });
        // Breakdown rows for the results overlay.
        financeListEl.innerHTML = '';
        const addFinanceRow = (label: string, value: string): void => {
          const row = document.createElement('div');
          row.className = 'finance-row';
          const labelEl = document.createElement('span');
          labelEl.textContent = label;
          const valueEl = document.createElement('strong');
          valueEl.textContent = value;
          row.append(labelEl, valueEl);
          financeListEl.appendChild(row);
        };
        addFinanceRow('Patrocinador', `+${String(finance.sponsor).replace('.', ',')} M€`);
        addFinanceRow('Sueldos de pilotos', `−${finance.driversCost} M€`);
        addFinanceRow('Sueldos del personal', `−${finance.staffCost} M€`);
        addFinanceRow('Alquiler de instalaciones', `−${finance.rentCost} M€`);
        addFinanceRow(
          'Balance de la carrera',
          `${finance.net >= 0 ? '+' : '−'}${String(Math.abs(finance.net)).replace('.', ',')} M€`
        );
      }
      if (!wasLastRace) {
        // Phase 5: advance the calendar after a finished race.
        career.currentRaceIndex += 1;
        const next = getTrackById(career.calendar[career.currentRaceIndex]);
        nextRaceLabel = next ? `Siguiente GP: ${next.name}` : '';
      } else {
        // Phase 6: last race of the season -> do NOT advance.
        nextRaceLabel = 'Temporada completada';
        overlaySeasonBtn.classList.remove('hidden');
      }
      saveCareer(career);
      scheduleCloudSync();
    }

    resultsListEl.innerHTML = '';
    for (const r of playerResults) {
      const row = document.createElement('div');
      row.className = 'result-row';
      row.innerHTML = `
        <span class="result-pos">P${r.position}</span>
        <span class="result-name"></span>
        <span class="result-prize">+${r.prize} M€</span>`;
      (row.querySelector<HTMLElement>('.result-name')!).textContent = r.name;
      resultsListEl.appendChild(row);
    }
    resultsTotalEl.textContent = `Premio: +${totalPrize} M€ · Presupuesto: ${career.budget} M€ · ${nextRaceLabel}`;
    overlayEl.classList.remove('hidden');
  }

  // ---- Start ----
  window.addEventListener('resize', resize);
  setup();
  requestAnimationFrame(render);
}
