import { RaceState } from './types';
import { simulationTick } from './simulation';
import { buildTestRaceState } from './test-grid';

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
