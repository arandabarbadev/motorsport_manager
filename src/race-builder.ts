import { Car, Driver, RaceCarState, RaceState, Track, TyreCompound } from './types';
import { Roster } from './roster';
import { CareerState } from './career';

// ============================================================
// RACE BUILDER: converts the persisted roster + career into the
// RaceState consumed by the engine and the race screen. The
// player's developments and staff levels are applied here:
//   - developments -> effective Car stats (capped at MAX_CAR_STAT)
//   - mechanics    -> shorter pit stops for the player's cars
// ============================================================

// Expected pace factor used to line up the grid (fastest first),
// same weighting as the simulation's basePaceFactor.
export const expectedPace = (d: Driver, spec: Car): number =>
  (d.pace / 100) * 0.6 + (((spec.aero + spec.engine + spec.chassis) / 3) / 100) * 0.4;

// Development category -> Car stat bonuses for the player cars.
function developmentBonuses(roster: Roster): {
  aero: number;
  engine: number;
  chassis: number;
  reliability: number;
} {
  const player = roster.entries.find((e) => e.team.id === roster.playerTeamId);
  const dev = player?.developments ?? {};
  return {
    aero: (dev.aero ?? 0) + (dev.alerones ?? 0),
    engine: (dev.motor ?? 0) + (dev.electronica ?? 0),
    chassis: (dev.chasis ?? 0) + (dev.suspension ?? 0) + (dev.neumaticos ?? 0),
    reliability: (dev.seguridad ?? 0) + (dev.volante ?? 0),
  };
}

export function buildRaceStateFromRoster(
  roster: Roster,
  track: Track,
  career: CareerState
): RaceState {
  const teams = roster.entries.map((e) => e.team);
  const bonus = developmentBonuses(roster);
  const isPlayerTeam = (teamId: string): boolean => teamId === roster.playerTeamId;

  const drivers: Driver[] = [];
  const carSpecs: Car[] = [];
  for (const entry of roster.entries) {
    drivers.push(...entry.drivers);
    for (const spec of entry.cars) {
      if (isPlayerTeam(spec.teamId)) {
        // Effective car: base stats + development points (capped).
        const cap = (value: number): number => Math.min(95, Math.round(value));
        carSpecs.push({
          ...spec,
          aero: cap(spec.aero + bonus.aero),
          engine: cap(spec.engine + bonus.engine),
          chassis: cap(spec.chassis + bonus.chassis),
          reliability: Math.min(99, spec.reliability + bonus.reliability),
        });
      } else {
        carSpecs.push(spec);
      }
    }
  }

  const pairs = drivers.map((d, i) => ({ d, spec: carSpecs[i] }));
  pairs.sort((a, b) => expectedPace(b.d, b.spec) - expectedPace(a.d, a.spec));

  const startCompounds: TyreCompound[] = ['soft', 'medium', 'hard'];
  const cars: RaceCarState[] = pairs.map((p, gridIndex) => {
    const playerCar = isPlayerTeam(p.spec.teamId);
    return {
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
      isPlayerControlled: playerCar,
      pitTimerSec: 0,
      // Mechanics staff: -1.5s in the pits per level above 1.
      ...(playerCar
        ? {
            pitLaneTimeOverrideSec: Math.max(
              10,
              Math.round(track.pitLaneTimeLoss - (career.staff.mechanics - 1) * 1.5)
            ),
          }
        : {}),
    };
  });

  return {
    track,
    weather: 'dry',
    cars,
    teams,
    drivers,
    carSpecs,
    currentTick: 0,
    simTimeMultiplier: 10,
    isPaused: false,
    flag: 'green',
    flagTimerSec: 0,
    raceEvents: [],
  };
}
