import './race-screen.css';
import { RaceCarState, RaceState, TyreCompound, Weather, WeekendEvent } from './types';
import type { RaceEvent } from './types';
import { EVENT_ORDER, eventLabel, eventPrizeFactor, standingsForEvent } from './weekend';
import {
  getFinalClassification,
  isRaceFinished,
  queuePitCommand,
  resetPitCommands,
  simulationTick,
} from './simulation';
import { prizeForPosition } from './prize-table';
import { DIFFICULTY_PRESETS } from './difficulty';
import { getOrCreateCareer, saveCareer } from './career';
import { getTrackById } from './tracks-generator';
import { onThemeChange, themeButtonLabel, toggleTheme } from './theme';
import { computeRaceFinance } from './finance';
import { scheduleCloudSync } from './cloud';
import { showGuideOnce } from './guide';
import { buildTrackSampler, Point, TrackSampler } from './track-path';
import { lateralTarget, stepLateral } from './racing-line';
import { createNoticeHub } from './notices';

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
  // Spec 015: current-rubber line (compound chip + wear bar + %).
  tyre: HTMLElement;
  wearFill: HTMLElement;
  pct: HTMLElement;
}

export function createRaceScreen(
  container: HTMLElement,
  buildInitialState: () => RaceState,
  onExit?: () => void,
  onSeasonEnd?: () => void,
  event: WeekendEvent = 'race',
  onContinueToNext?: () => void
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
        <div class="start-lights hidden">
          <div class="lights-row">
            <span class="light"></span><span class="light"></span><span class="light"></span><span class="light"></span><span class="light"></span>
          </div>
          <div class="lights-label">Formación</div>
        </div>
        <div class="flag-indicator hidden"></div>
        <div class="results-overlay hidden">
          <div class="results-panel">
            <h2 class="results-title">Carrera terminada</h2>
            <div class="results-list"></div>
            <div class="finance-list"></div>
            <div class="results-total"></div>
            <div class="results-actions">
              <button type="button" class="btn primary overlay-continue-btn hidden">Continuar</button>
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
        <h2 class="hud-title">Dirección de carrera</h2>
        <ul class="feed-list"></ul>
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
  // Spec 012: start-light gantry and the race-control feed.
  const lightsEl = root.querySelector<HTMLElement>('.start-lights')!;
  const lightEls = [...root.querySelectorAll<HTMLElement>('.start-lights .light')];
  const lightsLabelEl = root.querySelector<HTMLElement>('.lights-label')!;
  const feedListEl = root.querySelector<HTMLUListElement>('.feed-list')!;
  const exitBtn = root.querySelector<HTMLButtonElement>('.exit-btn')!;
  if (onExit) exitBtn.addEventListener('click', onExit);
  else exitBtn.remove();
  const overlayExitBtn = root.querySelector<HTMLButtonElement>('.overlay-exit-btn')!;
  if (onExit) overlayExitBtn.addEventListener('click', onExit);
  else overlayExitBtn.remove();
  const overlaySeasonBtn = root.querySelector<HTMLButtonElement>('.overlay-season-btn')!;
  if (onSeasonEnd) overlaySeasonBtn.addEventListener('click', onSeasonEnd);
  else overlaySeasonBtn.remove();
  // Spec 011: after quali/sprints the overlay offers the next act.
  const overlayContinueBtn = root.querySelector<HTMLButtonElement>('.overlay-continue-btn')!;
  if (onContinueToNext) overlayContinueBtn.addEventListener('click', onContinueToNext);
  else overlayContinueBtn.remove();
  const resultsTitleEl = root.querySelector<HTMLElement>('.results-title')!;
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

  // Spec 017: generic notice hub, floating over the track. The race
  // uses it for mechanical retirements; the component itself is
  // screen-agnostic (see notices.ts).
  const notices = createNoticeHub(root.querySelector<HTMLElement>('.track-wrap')!);

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
  // Spec 012: incident flashes last longer and draw in red.
  const incidentUntil = new Map<string, number>();
  interface FloatingText {
    text: string;
    driverId: string;
    bornAt: number;
    color?: string;
  }
  let floatingTexts: FloatingText[] = [];

  // Spec 012: lateral position across the road (render-only state,
  // see racing-line.ts). gridPos is captured per race so the start
  // alternates sides stably; DNF ghosts freeze their last lateral.
  const lateralByCar = new Map<string, number>();
  const gridByCar = new Map<string, number>();
  let lastLateralStepAt = 0;

  // Spec 012: start-light phase. While active the simulation does
  // not tick and the clock does not advance (the formation is not
  // race time).
  interface LightsPhase {
    active: boolean;
    lit: number;
    nextAt: number;
    outAt: number;
    hideTimer: number;
  }
  let lights: LightsPhase = { active: false, lit: 0, nextAt: 0, outAt: 0, hideTimer: 0 };

  // Spec 012: race-control feed — last events, newest first, capped.
  function addFeed(text: string, kind: 'incident' | 'overtake' | 'pit'): void {
    const li = document.createElement('li');
    li.className = 'feed-item ' + kind;
    li.textContent = text;
    feedListEl.prepend(li);
    while (feedListEl.children.length > 8) feedListEl.lastChild!.remove();
  }

  const lapLabel = (): string =>
    `V${Math.min(
      Math.max(...state.cars.map((c) => c.currentLap)) + 1,
      state.track.totalLaps
    )}`;

  const INCIDENT_TEXT: Record<string, string> = {
    spin: '¡Trompo!',
    crash: '¡Accidente!',
    mechanical: '¡Avería!',
  };
  const INCIDENT_COLOR: Record<string, string> = {
    spin: '#ffb020',
    crash: '#ff5a3c',
    mechanical: '#aab4c0',
  };

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
          addFeed(
            `${driverById(ev.carDriverId).name} adelanta → P${ev.newPosition}`,
            'overtake'
          );
        }
      } else if (ev.type === 'pitEntry') {
        highlightUntil.set(ev.carDriverId, now + 900);
        const car = state.cars.find((c) => c.driverId === ev.carDriverId);
        if (car?.isPlayerControlled) {
          floatingTexts.push({ text: '¡A boxes!', driverId: ev.carDriverId, bornAt: now });
        }
        addFeed(`${driverById(ev.carDriverId).name} entra a boxes`, 'pit');
      } else if (ev.type === 'incident' && ev.incidentKind) {
        // Spec 012: visible for EVERY car, not just the player's.
        const car = state.cars.find((c) => c.driverId === ev.carDriverId);
        incidentUntil.set(ev.carDriverId, now + 1400);
        const label = INCIDENT_TEXT[ev.incidentKind];
        floatingTexts.push({
          text: `${label} P${car?.position ?? '?'}`,
          driverId: ev.carDriverId,
          bornAt: now,
          color: INCIDENT_COLOR[ev.incidentKind],
        });
        addFeed(
          `${lapLabel()} · ${label} ${driverById(ev.carDriverId).name} (P${car?.position ?? '?'})`,
          'incident'
        );
        // Spec 017: a retirement by FAILURE gets the notice card —
        // spins and crashes already read loud enough on their own.
        if (ev.incidentKind === 'mechanical') {
          notices.notify({
            kind: 'alert',
            title: 'Retirada por avería',
            body: `${driverById(ev.carDriverId).name} · P${car?.position ?? '?'}`,
          });
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
    resetPitCommands(); // no pit orders survive between races
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
    overlayContinueBtn.classList.add('hidden');
    prizeAwarded = false;
    // Spec 012: fresh lateral state and grid sides for this race.
    lateralByCar.clear();
    gridByCar.clear();
    state.cars.forEach((car, i) => {
      lateralByCar.set(car.driverId, 0);
      gridByCar.set(car.driverId, i + 1); // cars array is grid order
    });
    lastLateralStepAt = 0;
    startLights();
    buildStandings();
    buildPitPanel();
    updateControls();
    updateHeader();
    updateHud();
    resize();
    // First-time guide for the race screen (once per browser).
    showGuideOnce(
      'race',
      'Carrera y boxes en 4 ideas',
      [
        'La carrera corre sola: pausa y velocidades (1x-20x) arriba.',
        'Tus paradas se ordenan en "Mis boxes": la goma que llevas está al lado de los botones.',
        'La tabla muestra el hueco de los 20; la goma y su desgaste, solo de tus pilotos.',
        'Cada círculo lleva su dorsal pintado dentro: identifícalos sin depender de los colores.',
      ]
    );
  }

  // ---- Track drawing (offscreen layer) ----

  let view = { ox: 0, oy: 0, s: 1 };
  // Road width in px, set while drawing the layer: the lateral
  // offset is a fraction of it.
  let roadWidthPx = 40;

  // Spec 012: unit tangent of the track at lap fraction t.
  function tangentAt(t: number): Point {
    const a = sampler.pointAt(t - 0.002);
    const b = sampler.pointAt(t + 0.002);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len };
  }

  // Spec 012: normalized signed curvature ahead of t, in [-1, 1].
  // Positive = the inside of the corner is on the positive-normal
  // side (cross of the two tangents > 0, sin ~20° counts as "full").
  function curvatureAt(t: number): number {
    const t1 = tangentAt(t);
    const t2 = tangentAt(t + 0.01);
    const cross = t1.x * t2.y - t1.y * t2.x;
    return Math.max(-1, Math.min(1, cross / 0.35));
  }

  // Spec 012: eased lateral targets, stepped once per frame.
  function updateLaterals(now: number): void {
    const dt = lastLateralStepAt > 0 ? Math.min(0.1, (now - lastLateralStepAt) / 1000) : 0;
    lastLateralStepAt = now;
    const input = {
      cars: state.cars.map((car) => ({
        driverId: car.driverId,
        gridPos: gridByCar.get(car.driverId) ?? 1,
        totalProgress: car.currentLap + car.lapProgress,
        lateral: lateralByCar.get(car.driverId) ?? 0,
      })),
      curvatureAt,
      clockSec,
      yellow: state.flag === 'yellow',
    };
    for (const entry of input.cars) {
      const car = state.cars.find((c) => c.driverId === entry.driverId)!;
      if (car.status === 'dnf') continue; // ghost: frozen where it died
      const target = lateralTarget(entry, input);
      lateralByCar.set(entry.driverId, stepLateral(entry.lateral, target, dt));
    }
  }

  // Spec 012/014: screen point of a car, offset laterally from the
  // centerline by its lateral (up to ±42% of the road width).
  function carScreenPoint(car: RaceCarState, alpha: number): Point {
    const sh = shadow.get(car.driverId) ?? { lap: car.currentLap, progress: car.lapProgress };
    const prevTotal = sh.lap + sh.progress;
    const currTotal = car.currentLap + car.lapProgress;
    const total = prevTotal + (currTotal - prevTotal) * alpha;
    const base = toPx(sampler.pointAt(total));
    const tan = tangentAt(total);
    const off = (lateralByCar.get(car.driverId) ?? 0) * roadWidthPx * 0.42;
    return { x: base.x + -tan.y * off, y: base.y + tan.x * off };
  }

  // Spec 012: F1 start lights — 5 red lights, one by one, then all
  // out after a random hold. While the phase is active the sim
  // interval does not tick (formation, not race time).
  function startLights(): void {
    if (lights.hideTimer) window.clearTimeout(lights.hideTimer);
    lights = { active: true, lit: 0, nextAt: performance.now() + 600, outAt: 0, hideTimer: 0 };
    lightsEl.classList.remove('hidden', 'out');
    lightsLabelEl.textContent = 'Formación';
    lightEls.forEach((el) => el.classList.remove('on'));
  }

  function advanceLights(now: number): void {
    if (!lights.active) return;
    if (lights.lit < lightEls.length) {
      if (now >= lights.nextAt) {
        lightEls[lights.lit].classList.add('on');
        lights.lit++;
        lights.nextAt = now + 650;
        if (lights.lit === lightEls.length) {
          lights.outAt = now + 650 + 400 + Math.random() * 800;
        }
      }
    } else if (lights.outAt > 0 && now >= lights.outAt) {
      lights.active = false;
      lightsEl.classList.add('out');
      lightsLabelEl.textContent = '¡Luces fuera!';
      lights.hideTimer = window.setTimeout(() => lightsEl.classList.add('hidden'), 900);
    }
  }

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
    // Spec 014: wider road (7.5% of the canvas' short side) so the
    // lateral roam of the cars fits inside the asphalt.
    const roadWidth = Math.max(12, 0.075 * Math.min(w, h));
    roadWidthPx = roadWidth; // lateral offsets are a fraction of it
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
    // Spec 014: no center guide line anymore — the cars roam the
    // full width, a painted centerline read as a slot-car rail.

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
    // Spec 012: while the start lights are on there is no race yet —
    // anchor the render like the pause does (clock stays at 0).
    if (lights.active) {
      snapshotShadow();
      lastTickAt = performance.now();
      return;
    }
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
    advanceLights(now);
    updateLaterals(now);
    const alpha = Math.min(1, (now - lastTickAt) / TICK_MS);
    drawCars(alpha);
    drawEffects(now, alpha);
    if (now - lastHudAt >= HUD_INTERVAL_MS) {
      updateHud();
      updateHeader();
      lastHudAt = now;
    }
    requestAnimationFrame(render);
  }

  let lastHudAt = 0;

  // Spec 014: slightly slimmer cars (1.3% of the canvas' short side)
  // so the widened road reads wide and the roam stays on the asphalt.
  // Spec 015: minimum 7px so the race number fits INSIDE the dot on
  // small canvases too (phones render the track at ~38vh).
  const carRadius = (): number => Math.max(7, 0.013 * Math.min(canvas.width, canvas.height));

  // Event feedback layer: highlight rings + rising floating texts.
  function drawEffects(now: number, alpha: number): void {
    const r = carRadius();
    for (const car of state.cars) {
      const until = highlightUntil.get(car.driverId) ?? 0;
      if (now < until) {
        const p = carScreenPoint(car, alpha);
        const life = (until - now) / 900; // 1 -> 0
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 5 + (1 - life) * 3, 0, Math.PI * 2);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * life})`;
        ctx.stroke();
      }
      // Spec 012: incident flash — bigger red ring, 1400 ms.
      const incident = incidentUntil.get(car.driverId) ?? 0;
      if (now < incident) {
        const p = carScreenPoint(car, alpha);
        const life = (incident - now) / 1400; // 1 -> 0
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 6 + (1 - life) * 10, 0, Math.PI * 2);
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = `rgba(255, 90, 60, ${0.9 * life})`;
        ctx.stroke();
      } else if (incident > 0) {
        incidentUntil.delete(car.driverId);
      }
    }
    floatingTexts = floatingTexts.filter((f) => now - f.bornAt < 1200);
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    for (const f of floatingTexts) {
      const car = state.cars.find((c) => c.driverId === f.driverId);
      if (!car) continue;
      const p = carScreenPoint(car, alpha);
      const progress = (now - f.bornAt) / 1200;
      const y = p.y - r - 8 - progress * 26;
      ctx.globalAlpha = 1 - progress;
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.strokeText(f.text, p.x, y);
      ctx.fillStyle = f.color ?? '#ffd700';
      ctx.fillText(f.text, p.x, y);
      ctx.globalAlpha = 1;
    }
    ctx.textAlign = 'start';
  }

  function drawCars(alpha: number): void {
    // Positions interpolate between the last two ticks (alpha) and
    // carry the lateral offset from racing-line (spec 012).
    const r = carRadius();
    const sorted = [...state.cars].sort((a, b) => b.position - a.position);
    for (const car of sorted) {
      const p = carScreenPoint(car, alpha);
      const cssVar = (name: string): string =>
        getComputedStyle(document.documentElement).getPropertyValue(name).trim();

      if (car.status === 'dnf') {
        // Crashed/broken car: faded grey ghost on the track.
        // Spec 015: skip THIS car, never the rest of the field (the
        // old `return` left the canvas empty once a DNF sank to last).
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 0.8, 0, Math.PI * 2);
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = cssVar('--dim');
        ctx.fill();
        ctx.globalAlpha = 1;
        continue;
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

      // Spec 015: the race number lives INSIDE the car dot (spec 008
      // drew it floating above). It scales with the effective radius
      // (the dot shrinks in the pits); the dark outline is THIN so it
      // rings the digits without drowning the team color, and the
      // white fill stays readable over any color in both themes.
      const rr = car.status === 'inPit' ? r * 0.75 : r;
      const dorsal = String(driverById(car.driverId).number ?? '');
      if (dorsal) {
        ctx.font = `bold ${Math.max(9, Math.round(rr * 1.05))}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = Math.max(1.5, rr * 0.14);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.strokeText(dorsal, p.x, p.y);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(dorsal, p.x, p.y);
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
      }
    }
  }

  // ---- HUD ----

  function buildStandings(): void {
    standingsEl.innerHTML = '';
    rows.clear();
    for (const car of state.cars) {
      const li = document.createElement('li');
      // Spec 015: tyre compound + wear are the player's own strategy
      // info — rival rows keep the cells (grid alignment) but stay
      // empty.
      li.className =
        'standing-row' + (car.isPlayerControlled ? ' player' : ' no-tyre');
      li.innerHTML = `
        <span class="pos"></span>
        <span class="num"></span>
        <span class="tcolor"></span>
        <span class="dname"></span>
        <span class="gap"></span>
        <span class="tyre"></span>
        <span class="wear"><span class="wear-fill"></span></span>
        <span class="pitflag">BOX</span>`;
      const team = teamById(car.teamId);
      (li.querySelector<HTMLElement>('.tcolor')!).style.background = team.color;
      (li.querySelector<HTMLElement>('.num')!).textContent =
        String(driverById(car.driverId).number ?? '');
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
      if (car.isPlayerControlled) {
        // Spec 015: only the player's cars show rubber strategy; the
        // rivals' cells stay empty (class no-tyre hides the bar).
        row.tyre.textContent = COMPOUND_LABEL[car.tyre.compound];
        row.tyre.className = 'tyre ' + car.tyre.compound;
        const wear = Math.round(car.tyre.wear);
        row.wearFill.style.width = wear + '%';
        row.wearFill.className =
          'wear-fill' + (wear >= 80 ? ' danger' : wear >= 50 ? ' warn' : '');
      }
      row.root.classList.toggle('pitting', car.status === 'inPit');
      row.root.classList.toggle('dnf', car.status === 'dnf');
      row.pitflag.textContent =
        car.status === 'inPit' ? `BOX ${Math.ceil(car.pitTimerSec)}s` : 'BOX';
    }
    for (const box of pitBoxes) {
      const car = state.cars.find((c) => c.driverId === box.carDriverId)!;
      // Spec 015: current rubber next to the compound buttons.
      box.tyre.textContent = COMPOUND_LABEL[car.tyre.compound];
      box.tyre.className = 'tyre ' + car.tyre.compound;
      const wear = Math.round(car.tyre.wear);
      box.wearFill.style.width = wear + '%';
      box.wearFill.className =
        'wear-fill' + (wear >= 80 ? ' danger' : wear >= 50 ? ' warn' : '');
      box.pct.textContent = `${wear}%`;
      if (car.status === 'inPit') {
        pendingPit.delete(box.carDriverId);
        box.status.textContent = `En boxes: ${Math.ceil(car.pitTimerSec)}s`;
      } else if (pendingPit.has(box.carDriverId)) {
        box.status.textContent = 'Entra en boxes al cruzar meta…';
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
    nameEl.textContent = `${eventLabel(event)} · ${state.track.name}`;
    const leaderLap = Math.max(...state.cars.map((c) => c.currentLap));
    lapEl.textContent = `Vuelta ${Math.min(leaderLap + 1, state.track.totalLaps)}/${state.track.totalLaps}`;
    clockEl.textContent = formatClock(clockSec);
    weatherEl.textContent =
      WEATHER_LABEL[state.weather] +
      // Strategy hint while it is still dry in a race with rain risk.
      (state.weatherCanChange && state.weather === 'dry' ? ' · riesgo de lluvia' : '');
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
      // Spec 015: the rubber the car is ON, right where you pick the
      // next one — compound chip, wear bar and percentage.
      const tyreLine = document.createElement('div');
      tyreLine.className = 'pit-tyre';
      tyreLine.innerHTML = `
        <span class="tyre"></span>
        <span class="wear"><span class="wear-fill"></span></span>
        <span class="pit-tyre-pct"></span>`;
      const btns = document.createElement('div');
      btns.className = 'pit-btns';
      const buttons = compounds.map((compound) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn pit-btn';
        btn.textContent = COMPOUND_LABEL[compound];
        btn.title = compound;
        btn.addEventListener('click', () => {
          // Player command: queued NOW, executed when the car crosses
          // the start/finish line (never mid-lap).
          if (finished || state.isPaused || car.status !== 'racing') return;
          queuePitCommand({
            carDriverId: car.driverId,
            newCompound: compound,
            requestedAtTick: state.currentTick,
          });
          pendingPit.add(car.driverId);
          floatingTexts.push({
            text: 'Boxes al cruzar meta',
            driverId: car.driverId,
            bornAt: performance.now(),
          });
        });
        btns.appendChild(btn);
        return btn;
      });
      const status = document.createElement('div');
      status.className = 'pit-status';
      status.textContent = '0 parada(s)';
      box.append(title, tyreLine, btns, status);
      pitPanel.appendChild(box);
      pitBoxes.push({
        carDriverId: car.driverId,
        status,
        buttons,
        tyre: tyreLine.querySelector<HTMLElement>('.tyre')!,
        wearFill: tyreLine.querySelector<HTMLElement>('.wear-fill')!,
        pct: tyreLine.querySelector<HTMLElement>('.pit-tyre-pct')!,
      });
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
    if (lights.active) return; // nothing to pause before lights out
    state.isPaused = !state.isPaused;
    updateControls();
  });

  for (const btn of speedBtns) {
    btn.addEventListener('click', () => {
      state.simTimeMultiplier = Number(btn.dataset.speed) as 1 | 5 | 10 | 20;
      updateControls();
    });
  }

  // Spec 011: the restart button names the weekend act being re-run.
  restartBtn.textContent =
    event === 'race' ? 'Nueva carrera' : `Repetir ${eventLabel(event).toLowerCase()}`;
  restartBtn.addEventListener('click', () => setup());

  // Phase 4: add the prize money of both player cars to the persistent
  // career budget (exactly once per event) and show the results overlay.
  // Spec 011: quali pays no prize, sprints pay a quarter of the table,
  // and only the RACE settles sponsors, salaries and rent.
  function awardPrizesAndShowResults(): void {
    const career = getOrCreateCareer(0);
    const playerResults = getFinalClassification(state)
      .filter((c) => c.isPlayerControlled)
      .map((c) => ({
        position: c.position,
        name: driverById(c.driverId).name,
        // Spec 016: the prize table scaled by this save's difficulty.
        prize: Math.round(
          prizeForPosition(c.position, DIFFICULTY_PRESETS[career.difficulty].prizeScale) *
            eventPrizeFactor(event)
        ),
      }));
    const totalPrize = playerResults.reduce((sum, r) => sum + r.prize, 0);
    let nextLabel = '';
    // Replay guard: an event already recorded this season pays nothing
    // and is not recorded twice — but season progress NEVER freezes.
    const alreadyRecorded = career.seasonResults.some(
      (r) => r.trackId === state.track.id && r.event === event
    );
    if (!prizeAwarded) {
      prizeAwarded = true;
      if (!alreadyRecorded) {
        if (event === 'race') {
          // Full race finance: prizes + sponsor income - salaries - rent.
          const finance = computeRaceFinance(totalPrize, career);
          career.budget += finance.net;
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
        } else {
          // Short events pay the prize only: the weekend's bills are
          // settled together in the race.
          career.budget += totalPrize;
          financeListEl.innerHTML = '';
          const note = document.createElement('div');
          note.className = 'finance-row';
          const noteLabel = document.createElement('span');
          noteLabel.textContent = 'Patrocinadores y gastos';
          const noteValue = document.createElement('strong');
          noteValue.textContent = 'se liquidan en la carrera';
          note.append(noteLabel, noteValue);
          financeListEl.appendChild(note);
        }
        // Phase 6: record the season result (best of the two player cars).
        const bestPosition = Math.min(...playerResults.map((r) => r.position));
        career.seasonResults.push({
          trackId: state.track.id,
          event,
          position: bestPosition,
          prize: totalPrize,
          // Spec 011: championship points of THIS event (sprints pay the
          // top-8 table), in final order — it seeds the next act's grid.
          standings: standingsForEvent(getFinalClassification(state), event),
        });
      }
      if (event === 'race') {
        const wasLastRace = career.currentRaceIndex >= career.calendar.length - 1;
        if (!wasLastRace) {
          // Phase 5: advance the calendar after the finished race.
          career.currentRaceIndex += 1;
          const next = getTrackById(career.calendar[career.currentRaceIndex]);
          nextLabel = next ? `Siguiente GP: ${next.name}` : '';
        } else {
          // Phase 6: last race of the season -> do NOT advance.
          nextLabel = 'Temporada completada';
          overlaySeasonBtn.classList.remove('hidden');
        }
      } else {
        // Spec 011: chain to the next weekend act (quali -> S1 -> S2).
        const next = EVENT_ORDER[EVENT_ORDER.indexOf(event) + 1] ?? 'race';
        nextLabel = `Siguiente: ${eventLabel(next)}`;
        overlayContinueBtn.textContent = `Continuar a ${eventLabel(next)}`;
        overlayContinueBtn.classList.remove('hidden');
      }
      saveCareer(career);
      scheduleCloudSync();
    }

    resultsTitleEl.textContent = `${eventLabel(event)}: resultado`;
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
    resultsTotalEl.textContent = `Premio: +${totalPrize} M€ · Presupuesto: ${career.budget} M€ · ${nextLabel}`;
    overlayEl.classList.remove('hidden');
  }

  // ---- Start ----
  window.addEventListener('resize', resize);
  setup();
  requestAnimationFrame(render);
}
