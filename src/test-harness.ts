import { RaceState } from './types';
import { simulationTick } from './simulation';
import { buildTestRaceState } from './test-grid';
import { LATERAL_MAX, lateralTarget, stepLateral } from './racing-line';
import {
  DIFFICULTY_ORDER,
  DIFFICULTY_PRESETS,
  difficultyOrHard,
} from './difficulty';
import { ALL_SPONSORS, SPONSOR_COUNT, sponsorPayPerRace } from './sponsors';
import { prizeForPosition } from './prize-table';

// ============================================================
// TEST HARNESS (Phase 1): runs the simulation head-less (no UI)
// over the shared test grid until the leader completes
// track.totalLaps (max 500 ticks at 10x) and returns the final
// classification plus pit stop timings.
// ============================================================

// Spearman rank correlation. A negative value between pace and final
// position means faster drivers finish further up the order.
function spearman(xs: number[], ys: number[]): number {
  const rank = (arr: number[]): number[] => {
    const order = arr.map((v, i) => ({ v, i })).sort((p, q) => p.v - q.v);
    const r: number[] = new Array(arr.length);
    order.forEach((o, idx) => {
      r[o.i] = idx;
    });
    return r;
  };
  const rx = rank(xs);
  const ry = rank(ys);
  const n = xs.length;
  const mx = rx.reduce((s, v) => s + v, 0) / n;
  const my = ry.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    num += (rx[i] - mx) * (ry[i] - my);
    dx += (rx[i] - mx) ** 2;
    dy += (ry[i] - my) ** 2;
  }
  return num / Math.sqrt(dx * dy);
}

// Acceptance check 3 (spec 012): the lateral (render-only) racing
// line holds its invariants with deterministic inputs.
function racingLineSelfCheck(lines: string[]): void {
  let failures = 0;
  const expect = (ok: boolean, what: string): void => {
    if (!ok) {
      failures++;
      lines.push('FAIL lateral: ' + what);
    }
  };

  // 1) Bounded: targets always within [-1, 1] whatever the inputs.
  for (let t = 0; t < 40; t++) {
    const target = lateralTarget(
      { driverId: 'd' + t, gridPos: (t % 20) + 1, totalProgress: t * 1.7, lateral: -1 },
      {
        cars: [],
        curvatureAt: () => Math.sin(t * 3.1),
        clockSec: t * 11,
        yellow: t % 3 === 0,
      }
    );
    expect(Math.abs(target) <= LATERAL_MAX, 'acotado (t=' + t + ' -> ' + target + ')');
  }

  // 2) Battles open to opposite sides; yellow drops the battle.
  const duel = (yellow: boolean): [number, number] => {
    const a = { driverId: 'alpha', gridPos: 1, totalProgress: 10.0, lateral: 0 };
    const b = { driverId: 'bravo', gridPos: 2, totalProgress: 10.001, lateral: 0 };
    const input = { cars: [a, b], curvatureAt: () => 0, clockSec: 5, yellow };
    return [lateralTarget(a, input), lateralTarget(b, input)];
  };
  const [ta, tb] = duel(false);
  expect(ta > 0 && tb < 0, 'batalla a lados opuestos (' + ta.toFixed(2) + ' / ' + tb.toFixed(2) + ')');
  const [ya, yb] = duel(true);
  expect(Math.abs(ya - yb) < 0.6, 'amarilla sin batalla (' + ya.toFixed(2) + ' / ' + yb.toFixed(2) + ')');

  // 3) Smoothing converges to the target without overshooting.
  let current = 0;
  for (let i = 0; i < 10; i++) current = stepLateral(current, 0.9, 0.2);
  expect(current > 0.8 && current <= 0.9, 'convergencia (0 -> ' + current.toFixed(3) + ')');

  lines.push(
    failures === 0
      ? 'Lateral check: acotado OK | batallas OK | amarilla OK | convergencia OK'
      : 'Lateral check: ' + failures + ' FALLOS'
  );
}

// Acceptance check 4 (spec 016): the difficulty presets hold their
// invariants — 'hard' replicates spec 009, easier tiers are strictly
// richer, sponsor pay endpoints match each preset and the prize
// table scales; unknown values fall back to 'hard'.
function difficultySelfCheck(lines: string[]): void {
  let failures = 0;
  const expect = (ok: boolean, what: string): void => {
    if (!ok) {
      failures++;
      lines.push('FAIL dificultad: ' + what);
    }
  };

  const [easy, normal] = DIFFICULTY_ORDER;
  expect(DIFFICULTY_ORDER.length === 3, 'tres presets');
  expect(
    DIFFICULTY_PRESETS.easy.initialBudget > DIFFICULTY_PRESETS.normal.initialBudget &&
      DIFFICULTY_PRESETS.normal.initialBudget > DIFFICULTY_PRESETS.hard.initialBudget,
    'presupuesto easy > normal > hard'
  );
  expect(
    DIFFICULTY_PRESETS[easy].prizeScale > DIFFICULTY_PRESETS[normal].prizeScale &&
      DIFFICULTY_PRESETS[normal].prizeScale > DIFFICULTY_PRESETS.hard.prizeScale,
    'escala de premios decreciente'
  );
  // 'hard' IS spec 009, constant by constant.
  expect(DIFFICULTY_PRESETS.hard.initialBudget === 200, 'hard: 200 M€ (009)');
  expect(DIFFICULTY_PRESETS.hard.sponsorPayMin === 0.3 && DIFFICULTY_PRESETS.hard.sponsorPayMax === 3.0, 'hard: 0,3..3,0 M€ (009)');
  expect(DIFFICULTY_PRESETS.hard.prizeScale === 1, 'hard: premios x1 (009)');
  // Sponsor pay endpoints for every tier.
  const worst = ALL_SPONSORS[0];
  const best = ALL_SPONSORS[SPONSOR_COUNT - 1];
  for (const id of DIFFICULTY_ORDER) {
    expect(sponsorPayPerRace(worst, id) === DIFFICULTY_PRESETS[id].sponsorPayMin, id + ': peor patrocinador = min');
    expect(sponsorPayPerRace(best, id) === DIFFICULTY_PRESETS[id].sponsorPayMax, id + ': mejor patrocinador = max');
  }
  expect(sponsorPayPerRace(worst, 'hard') === 0.3 && sponsorPayPerRace(best, 'easy') === 5, '009 duro abajo, pre-009 facil arriba');
  // Prize scale math (rounded to whole M€).
  expect(prizeForPosition(1) === 100 && prizeForPosition(1, 1.5) === 150, 'P1: 100 -> 150 en facil');
  expect(prizeForPosition(5, 1.25) === 56, 'P5 normal: 45 x 1,25 = 56');
  // Defensive fallback.
  expect(difficultyOrHard(undefined) === 'hard' && difficultyOrHard('turbo') === 'hard' && difficultyOrHard('easy') === 'easy', 'default/legacy = hard');

  lines.push(
    failures === 0
      ? 'Difficulty check: presets OK | extremos OK | premios OK | default hard OK'
      : 'Difficulty check: ' + failures + ' FALLOS'
  );
}

const pad = (s: string, n: number): string => (s.length >= n ? s : s + ' '.repeat(n - s.length));
const padL = (s: string, n: number): string => (s.length >= n ? s : ' '.repeat(n - s.length) + s);

export function runTestHarness(): string {
  const state: RaceState = buildTestRaceState();

  // Record when each stop happens: lap number + race second.
  const pitLog = new Map<string, { lap: number; raceSec: number }[]>();
  const prevStops = new Map<string, number>(
    state.cars.map((c) => [c.driverId, c.pitStopsCompleted])
  );

  const MAX_TICKS = 500;
  let ticksRun = 0;
  for (; ticksRun < MAX_TICKS; ticksRun++) {
    simulationTick(state);
    const raceSec = (ticksRun + 1) * state.simTimeMultiplier;
    for (const car of state.cars) {
      const prev = prevStops.get(car.driverId) ?? 0;
      if (car.pitStopsCompleted > prev) {
        const list = pitLog.get(car.driverId) ?? [];
        list.push({ lap: car.currentLap + 1, raceSec });
        pitLog.set(car.driverId, list);
        prevStops.set(car.driverId, car.pitStopsCompleted);
      }
    }
    // Chequered flag: leader completed all the laps.
    if (state.cars.some((c) => c.currentLap >= state.track.totalLaps)) break;
  }

  // ---- Final report ----
  const teamName = (teamId: string): string =>
    state.teams.find((t) => t.id === teamId)?.name ?? teamId;
  const order = [...state.cars].sort((a, b) => a.position - b.position);
  const leaderLaps = order[0].currentLap;

  const lines: string[] = [];
  lines.push(
    `=== TEST HARNESS | ${state.track.name} | ${state.track.totalLaps} laps | dry | ${ticksRun + 1} ticks (x${state.simTimeMultiplier}) ===`
  );
  lines.push('');
  lines.push(
    pad('POS', 5) +
      pad('DRIVER', 16) +
      pad('TEAM', 15) +
      pad('PACE', 6) +
      pad('LAPS', 6) +
      pad('GAP', 10) +
      pad('TYRE', 9) +
      pad('WEAR', 7) +
      pad('PITS', 6) +
      'PIT LAPS'
  );

  for (const car of order) {
    const driver = state.drivers.find((d) => d.id === car.driverId)!;
    const lapsDown = leaderLaps - car.currentLap;
    const gap =
      car.status === 'dnf'
        ? 'DNF'
        : car.position === 1
          ? 'leader'
          : lapsDown > 0
            ? `+${lapsDown} lap${lapsDown > 1 ? 's' : ''}`
            : `+${car.gapToLeaderSec.toFixed(1)}s`;
    const stops = pitLog.get(car.driverId) ?? [];
    const pitLaps = stops.length > 0 ? stops.map((s) => s.lap).join(', ') : '-';
    lines.push(
      padL(String(car.position), 5) +
        pad(driver.name + (car.isPlayerControlled ? ' *' : ''), 16) +
        pad(teamName(car.teamId), 15) +
        padL(String(driver.pace), 6) +
        padL(String(car.currentLap), 6) +
        pad(gap, 10) +
        pad(car.tyre.compound, 9) +
        padL(`${Math.round(car.tyre.wear)}%`, 7) +
        padL(String(car.pitStopsCompleted), 6) +
        pitLaps
    );
  }

  lines.push('');
  lines.push('(*) = player-controlled cars (no AI pit calls, only manual commands).');

  // Acceptance check 1: better pace should finish generally ahead.
  const paceValues = order.map((c) => state.drivers.find((d) => d.id === c.driverId)!.pace);
  const positions = order.map((c) => c.position);
  const corr = spearman(paceValues, positions);
  lines.push(
    `Pace vs final position rank correlation: ${corr.toFixed(2)} (negative = faster drivers finish ahead)`
  );

  // Acceptance check 2: pit stops spread across different laps.
  const allStops = [...pitLog.values()].flat();
  if (allStops.length > 0) {
    const lapNumbers = allStops.map((s) => s.lap);
    lines.push(
      `Total pit stops: ${allStops.length} | first on lap ${Math.min(...lapNumbers)}, last on lap ${Math.max(...lapNumbers)}`
    );
  } else {
    lines.push('WARNING: no pit stops happened.');
  }

  // Acceptance check 3 (spec 012): lateral racing-line invariants.
  racingLineSelfCheck(lines);

  // Acceptance check 4 (spec 016): difficulty preset invariants.
  difficultySelfCheck(lines);

  return lines.join('\n');
}

// When executed directly with node (npm run harness), print the report.
// The typeof guards keep this block out of the browser build.
declare const require: { main: unknown };
declare const module: { exports: unknown };
if (
  typeof require !== 'undefined' &&
  typeof module !== 'undefined' &&
  require.main === module
) {
  console.log(runTestHarness());
}
