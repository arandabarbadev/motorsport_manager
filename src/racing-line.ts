// ============================================================
// RACING LINE (spec 012): lateral position of each car across the
// road width, for the RENDER only. The engine never sees this —
// positions, gaps and overtakes stay exactly as the simulation
// computes them. Pure math, no Canvas/DOM: testable head-less.
//
// A car's lateral target is composed of:
//   - a slow personal drift (drivers don't ride the same line),
//   - the inside of the upcoming corner (the racing line),
//   - battle avoidance: two cars close together open to OPPOSITE
//     sides of the track (which also staggers the grid in two
//     columns, since grid gaps fall inside the battle window).
// Under a yellow flag everyone tidies up towards the racing line
// (battles are dropped, the rest is scaled down).
// ============================================================

// Lateral is normalized: -1..1 across the usable half-width on
// each side of the centerline. The renderer maps it to pixels.
export const LATERAL_MAX = 1;
// Progress window (fraction of a lap) that counts as a battle.
// The builder's grid gap is 0.0022, so grid pairs are "in battle"
// and line up in two columns from the start.
export const BATTLE_WINDOW = 0.0035;
// How strongly a battle pushes the cars apart.
const BATTLE_BIAS = 0.9;
// Personal drift amplitude and rhythm (no Math.random: the phase
// comes from a hash of the driver id, deterministic per race).
const DRIFT_AMPLITUDE = 0.32;
const DRIFT_RAD_PER_SEC = 0.3;
// Corner weight: how much of the normalized curvature becomes
// lateral bias (the renderer normalizes curvature to -1..1).
const CORNER_WEIGHT = 0.8;
// Yellow flag: everything except battles, scaled down (single file).
const YELLOW_SCALE = 0.4;
// Exponential smoothing time constant: a lane change takes ~1s.
const TAU_SEC = 0.45;

export interface LateralCar {
  driverId: string;
  // 1-based grid slot (stable tie-break side at the start line).
  gridPos: number;
  // currentLap + lapProgress.
  totalProgress: number;
  // Current smoothed lateral of this car.
  lateral: number;
}

export interface LateralInput {
  cars: LateralCar[];
  // Normalized signed curvature ahead of lap-fraction t, in
  // [-1, 1]: positive = the inside of the corner is on the
  // positive-normal side, negative = the other side, 0 = straight.
  curvatureAt(t: number): number;
  // Race clock in seconds (drives the personal drift).
  clockSec: number;
  yellow: boolean;
}

// djb2 string hash -> stable per driver id.
function hashPhase(id: string): number {
  let h = 5381;
  for (let i = 0; i < id.length; i++) {
    h = (h * 33 + id.charCodeAt(i)) >>> 0;
  }
  return (h % 1000) / 1000 * Math.PI * 2;
}

// Stable side for a car with no meaningful lateral yet: odd grid
// slots lean one way, even slots the other (two-by-two grid).
function sideBias(car: LateralCar): number {
  return car.gridPos % 2 === 1 ? 1 : -1;
}

function clampLateral(value: number): number {
  return Math.max(-LATERAL_MAX, Math.min(LATERAL_MAX, value));
}

// The lateral a car WANTS right now (before smoothing).
export function lateralTarget(car: LateralCar, input: LateralInput): number {
  const drift = DRIFT_AMPLITUDE * Math.sin(hashPhase(car.driverId) + input.clockSec * DRIFT_RAD_PER_SEC);
  const corner = clampLateral(input.curvatureAt(car.totalProgress)) * CORNER_WEIGHT;

  if (input.yellow) {
    // Yellow: no fighting, tidy up behind the leader.
    return clampLateral((drift + corner) * YELLOW_SCALE);
  }

  // Nearest car ahead and behind inside the battle window.
  let ahead: LateralCar | null = null;
  let behind: LateralCar | null = null;
  for (const other of input.cars) {
    if (other.driverId === car.driverId) continue;
    const gap = other.totalProgress - car.totalProgress;
    if (gap > 0 && gap < BATTLE_WINDOW && (!ahead || gap < ahead.totalProgress - car.totalProgress)) {
      ahead = other;
    } else if (gap < 0 && -gap < BATTLE_WINDOW && (!behind || -gap < car.totalProgress - behind.totalProgress)) {
      behind = other;
    }
  }
  const foe = ahead ?? behind;
  let battle = 0;
  if (foe) {
    const foeSide = Math.abs(foe.lateral) >= 0.15 ? Math.sign(foe.lateral) : sideBias(foe);
    battle = -foeSide * BATTLE_BIAS; // take the free side
  }

  return clampLateral(drift + corner + battle);
}

// Exponential smoothing towards the target: the target may jump
// every tick, the car never does.
export function stepLateral(current: number, target: number, dtSec: number): number {
  const alpha = 1 - Math.exp(-Math.max(0, dtSec) / TAU_SEC);
  return current + (target - current) * alpha;
}
