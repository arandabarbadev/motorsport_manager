import './race-screen.css';
import { RaceCarState, RaceState, TyreCompound, Weather } from './types';
import { queuePitCommand, simulationTick } from './simulation';
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
  buildInitialState: () => RaceState
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
        <button type="button" class="btn pause-btn"></button>
        <button type="button" class="btn speed-btn" data-speed="1">1x</button>
        <button type="button" class="btn speed-btn" data-speed="5">5x</button>
        <button type="button" class="btn speed-btn" data-speed="10">10x</button>
        <button type="button" class="btn restart-btn">↻ Nueva carrera</button>
      </div>
    </header>
    <div class="race-body">
      <div class="track-wrap">
        <canvas class="track-canvas"></canvas>
        <div class="race-banner hidden"></div>
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
  const bannerEl = root.querySelector<HTMLElement>('.race-banner')!;
  const nameEl = root.querySelector<HTMLElement>('.race-name')!;
  const lapEl = root.querySelector<HTMLElement>('.race-lap')!;
  const weatherEl = root.querySelector<HTMLElement>('.race-weather')!;
  const clockEl = root.querySelector<HTMLElement>('.race-clock')!;
  const pauseBtn = root.querySelector<HTMLButtonElement>('.pause-btn')!;
  const speedBtns = [...root.querySelectorAll<HTMLButtonElement>('.speed-btn')];
  const restartBtn = root.querySelector<HTMLButtonElement>('.restart-btn')!;
  const pitPanel = root.querySelector<HTMLElement>('.pit-panel')!;
  const standingsEl = root.querySelector<HTMLOListElement>('.standings')!;

  // Mutable screen state (rebuilt on restart).
  let state = buildInitialState();
  let sampler: TrackSampler = buildTrackSampler(state.track.path);
  // Pre-tick positions, used to interpolate smooth motion between ticks.
  const shadow = new Map<string, { lap: number; progress: number }>();
  let lastTickAt = performance.now();
  let clockSec = 0;
  let finished = false;
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
    bannerEl.classList.add('hidden');
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
    const roadWidth = Math.max(10, 0.045 * Math.min(w, h));

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

    strokeLoop(roadWidth + Math.max(2, roadWidth * 0.12), '#1b2129'); // kerb border
    strokeLoop(roadWidth, '#30363d'); // asphalt
    strokeLoop(1.5, 'rgba(230,237,243,0.35)'); // centerline

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
    layerCtx.strokeStyle = '#e6edf3';
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
    clockSec += state.simTimeMultiplier;
    lastTickAt = performance.now();

    // Chequered flag (full results screen arrives in Phase 4).
    if (state.cars.some((c) => c.currentLap >= state.track.totalLaps)) {
      finished = true;
      state.isPaused = true;
      const winner = [...state.cars].sort((a, b) => a.position - b.position)[0];
      showBanner(`🏁 Fin de carrera — gana ${driverById(winner.driverId).name}`);
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
    if (now - lastHudAt >= HUD_INTERVAL_MS) {
      updateHud();
      updateHeader();
      lastHudAt = now;
    }
    requestAnimationFrame(render);
  }

  let lastHudAt = 0;

  function drawCars(now: number): void {
    // Interpolate positions between the last two ticks for smooth motion.
    const alpha = Math.min(1, (now - lastTickAt) / TICK_MS);
    const r = Math.max(4, 0.016 * Math.min(canvas.width, canvas.height));
    const sorted = [...state.cars].sort((a, b) => b.position - a.position);
    for (const car of sorted) {
      const sh = shadow.get(car.driverId) ?? {
        lap: car.currentLap,
        progress: car.lapProgress,
      };
      const prevTotal = sh.lap + sh.progress;
      const currTotal = car.currentLap + car.lapProgress;
      const p = toPx(sampler.pointAt(prevTotal + (currTotal - prevTotal) * alpha));
      ctx.beginPath();
      ctx.arc(p.x, p.y, car.status === 'inPit' ? r * 0.75 : r, 0, Math.PI * 2);
      ctx.fillStyle = teamById(car.teamId).color;
      ctx.globalAlpha = car.status === 'inPit' ? 0.35 : 1;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = Math.max(1.2, r * 0.3);
      ctx.strokeStyle = car.isPlayerControlled ? '#ffd700' : 'rgba(0,0,0,0.55)';
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
        <span class="pitflag">🔧</span>`;
      const team = teamById(car.teamId);
      (li.querySelector<HTMLElement>('.tcolor')!).style.background = team.color;
      (li.querySelector<HTMLElement>('.dname')!).textContent =
        driverById(car.driverId).name + (car.isPlayerControlled ? ' ★' : '');
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
      row.gap.textContent = formatGap(car, leaderLap);
      row.tyre.textContent = COMPOUND_LABEL[car.tyre.compound];
      row.tyre.className = 'tyre ' + car.tyre.compound;
      const wear = Math.round(car.tyre.wear);
      row.wearFill.style.width = wear + '%';
      row.wearFill.className =
        'wear-fill' + (wear >= 80 ? ' danger' : wear >= 50 ? ' warn' : '');
      row.root.classList.toggle('pitting', car.status === 'inPit');
      row.pitflag.textContent =
        car.status === 'inPit' ? `🔧${Math.ceil(car.pitTimerSec)}s` : '🔧';
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
    const compounds: TyreCompound[] = ['soft', 'medium', 'hard'];
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
    pauseBtn.textContent = state.isPaused ? '▶ Seguir' : '⏸ Pausa';
    pauseBtn.disabled = finished;
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
      state.simTimeMultiplier = Number(btn.dataset.speed) as 1 | 5 | 10;
      updateControls();
    });
  }

  restartBtn.addEventListener('click', () => setup());

  function showBanner(text: string): void {
    bannerEl.textContent = text;
    bannerEl.classList.remove('hidden');
  }

  // ---- Start ----
  window.addEventListener('resize', resize);
  setup();
  requestAnimationFrame(render);
}
