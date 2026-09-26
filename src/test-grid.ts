import { Car, Driver, RaceCarState, RaceState, Team, Track, TyreCompound } from './types';

// ============================================================
// TEST GRID (Phase 2): shared builder for the demo race used by
// both the browser race screen and the console test harness.
// The real editable roster arrives in Phase 3.
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

const TEST_SEED = 20260926;

export function buildTestRaceState(): RaceState {
  const rng = makeRng(TEST_SEED);
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
    // Placeholder closed loop (Phase 5 replaces it with generated tracks).
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

  return {
    track,
    weather: 'dry',
    cars: raceCars,
    teams,
    drivers,
    carSpecs,
    currentTick: 0,
    simTimeMultiplier: 10,
    isPaused: false,
  };
}
