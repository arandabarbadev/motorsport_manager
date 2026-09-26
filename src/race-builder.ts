import { Car, Driver, RaceCarState, RaceState, Track, TyreCompound } from './types';
import { Roster } from './roster';

// ============================================================
// RACE BUILDER (Phase 3): converts the persisted roster into the
// RaceState consumed by the engine and the race screen.
// ============================================================

// Same placeholder track used since Phase 1 (Phase 5 replaces it
// with the generated calendar).
function buildTestTrack(): Track {
  return {
    id: 'test-oval',
    name: 'Test Oval',
    totalLaps: 40,
    path: Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      return { x: 0.5 + Math.cos(angle) * 0.35, y: 0.5 + Math.sin(angle) * 0.25 };
    }),
    overtakeDifficulty: 0.5,
    tyreDegradationFactor: 1.0,
    pitLaneTimeLoss: 22,
  };
}

// Expected pace factor used to line up the grid (fastest first),
// same weighting as the simulation's basePaceFactor.
export const expectedPace = (d: Driver, spec: Car): number =>
  (d.pace / 100) * 0.6 + (((spec.aero + spec.engine + spec.chassis) / 3) / 100) * 0.4;

export function buildRaceStateFromRoster(roster: Roster): RaceState {
  const teams = roster.entries.map((e) => e.team);
  const drivers: Driver[] = [];
  const carSpecs: Car[] = [];
  for (const entry of roster.entries) {
    drivers.push(...entry.drivers);
    carSpecs.push(...entry.cars);
  }

  const pairs = drivers.map((d, i) => ({ d, spec: carSpecs[i] }));
  pairs.sort((a, b) => expectedPace(b.d, b.spec) - expectedPace(a.d, a.spec));

  const startCompounds: TyreCompound[] = ['soft', 'medium', 'hard'];
  const cars: RaceCarState[] = pairs.map((p, gridIndex) => ({
    driverId: p.d.id,
    carId: p.spec.id,
    teamId: p.spec.teamId,
    // Staggered grid: leader ahead on the lap.
    lapProgress: (pairs.length - 1 - gridIndex) * 0.0022,
    currentLap: 0,
    tyre: { compound: startCompounds[Math.floor(Math.random() * 3)], wear: 0, lapsOnTyre: 0 },
    fuel: 50,
    gapToLeaderSec: 0,
    position: gridIndex + 1,
    pitStopsCompleted: 0,
    status: 'racing',
    isPlayerControlled: p.spec.teamId === roster.playerTeamId,
    pitTimerSec: 0,
  }));

  return {
    track: buildTestTrack(),
    weather: 'dry',
    cars,
    teams,
    drivers,
    carSpecs,
    currentTick: 0,
    simTimeMultiplier: 10,
    isPaused: false,
  };
}
