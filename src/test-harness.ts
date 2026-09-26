import { Car, Driver, RaceCarState, RaceState, Team, Track, TyreCompound } from './types';
import { simulationTick } from './simulation';

// ============================================================
// TEST HARNESS (Phase 1): builds a RaceState with 20 test cars
// with deliberately varied stats, runs simulationTick until the
// leader completes track.totalLaps (max 500 ticks at 10x speed),
// and returns the final classification plus pit stop timings.
// ============================================================

// Deterministic seeded RNG (mulberry32) so the test grid is reproducible.
function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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
  const rng = makeRng(20260926);
  const rand = (min: number, max: number): number => min + rng() * (max - min);

  // Test team names and colors (10 teams x 2 drivers = 20 cars).
  const teamData: { name: string; color: string }[] = [
    { name: 'Player Racing', color: '#e10600' },
    { name: 'Silver Arrows', color: '#27f4d2' },
    { name: 'Red Storm', color: '#3671c6' },
    { name: 'Papaya GP', color: '#ff8000' },
    { name: 'Green Bulls', color: '#229971' },
    { name: 'Azure Motors', color: '#0090ff' },
    { name: 'Night Falcon', color: '#b6babd' },
    { name: 'Violet Racing', color: '#b453c1' },
    { name: 'Gold Stars', color: '#f5c542' },
    { name: 'Coral Squad', color: '#ff5c8a' },
  ];

  // Generated stat ranges (test data, deliberately varied so the
  // acceptance criteria can be checked: better pace should finish
  // ahead, and different aggression/riskTolerance should produce
  // pit stops at different moments):
  //   pace 55-95, consistency 50-95, aggression 15-95,
  //   wetSkill 50-90, riskTolerance 10-90,
  //   car aero/engine/chassis 60-85, reliability 70-95.
  const teams: Team[] = [];
  const drivers: Driver[] = [];
  const carSpecs: Car[] = [];

  teamData.forEach((t, teamIndex) => {
    const teamId = `team-${teamIndex}`;
    teams.push({ id: teamId, name: t.name, budget: 0, color: t.color });
    for (let seat = 0; seat < 2; seat++) {
      drivers.push({
        id: `driver-${teamIndex}-${seat}`,
        name: `Driver ${String(teamIndex * 2 + seat + 1).padStart(2, '0')}`,
        pace: Math.round(rand(55, 95)),
        consistency: Math.round(rand(50, 95)),
        aggression: Math.round(rand(15, 95)),
        wetSkill: Math.round(rand(50, 90)),
        riskTolerance: Math.round(rand(10, 90)),
      });
      carSpecs.push({
        id: `car-${teamIndex}-${seat}`,
        teamId,
        aero: Math.round(rand(60, 85)),
        engine: Math.round(rand(60, 85)),
        chassis: Math.round(rand(60, 85)),
        reliability: Math.round(rand(70, 95)),
      });
    }
  });

  const track: Track = {
    id: 'test-oval',
    name: 'Test Oval',
    totalLaps: 40,
    // Placeholder closed loop (the Canvas renderer arrives in Phase 2).
    path: Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      return { x: 0.5 + Math.cos(angle) * 0.35, y: 0.5 + Math.sin(angle) * 0.25 };
    }),
    overtakeDifficulty: 0.5,
    tyreDegradationFactor: 1.0,
    pitLaneTimeLoss: 22,
  };

  // Race cars: drivers[i] pairs with carSpecs[i] (both pushed in the
  // same loop above). Grid slots staggered by expected pace, fastest first.
  const expectedPace = (d: Driver, spec: Car): number =>
    (d.pace / 100) * 0.6 + (((spec.aero + spec.engine + spec.chassis) / 3) / 100) * 0.4;

  const entries = drivers.map((d, i) => ({ d, spec: carSpecs[i] }));
  entries.sort((a, b) => expectedPace(b.d, b.spec) - expectedPace(a.d, a.spec));

  const startCompounds: TyreCompound[] = ['soft', 'medium', 'hard'];
  const raceCars: RaceCarState[] = entries.map((e, gridIndex) => ({
    driverId: e.d.id,
    carId: e.spec.id,
    teamId: e.spec.teamId,
    lapProgress: (entries.length - 1 - gridIndex) * 0.0022,
    currentLap: 0,
    tyre: { compound: startCompounds[Math.floor(rng() * 3)], wear: 0, lapsOnTyre: 0 },
    fuel: 50,
    gapToLeaderSec: 0,
    position: gridIndex + 1,
    pitStopsCompleted: 0,
    status: 'racing',
    isPlayerControlled: e.spec.teamId === 'team-0',
    pitTimerSec: 0,
  }));

  const state: RaceState = {
    track,
    weather: 'dry',
    cars: raceCars,
    drivers,
    carSpecs,
    currentTick: 0,
    simTimeMultiplier: 10,
    isPaused: false,
  };

  // Record when each stop happens: lap number + race second.
  const pitLog = new Map<string, { lap: number; raceSec: number }[]>();
  const prevStops = new Map<string, number>(
    raceCars.map((c) => [c.driverId, c.pitStopsCompleted])
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
    if (raceCars.some((c) => c.currentLap >= track.totalLaps)) break;
  }

  // ---- Final report ----
  const teamName = (teamId: string): string =>
    teams.find((t) => t.id === teamId)?.name ?? teamId;
  const order = [...state.cars].sort((a, b) => a.position - b.position);
  const leaderLaps = order[0].currentLap;

  const lines: string[] = [];
  lines.push(
    `=== TEST HARNESS | ${track.name} | ${track.totalLaps} laps | dry | ${ticksRun + 1} ticks (x${state.simTimeMultiplier}) ===`
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
    const driver = drivers.find((d) => d.id === car.driverId)!;
    const lapsDown = leaderLaps - car.currentLap;
    const gap =
      car.position === 1
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
  const paceValues = order.map((c) => drivers.find((d) => d.id === c.driverId)!.pace);
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
