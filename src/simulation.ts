import {
  Car,
  Driver,
  PitCommand,
  RaceCarState,
  RaceState,
  Track,
  TyreCompound,
  Weather,
} from './types';

// ============================================================
// RACE TIME MODEL (architecture decision)
// One simulationTick advances the race by `simTimeMultiplier` simulated
// seconds. Each simulated second, a racing car covers
// pace / REFERENCE_LAP_SEC of a lap, so a lap takes roughly
// REFERENCE_LAP_SEC / pace seconds (~95-150s with current numbers).
// ============================================================
const REFERENCE_LAP_SEC = 90;

// Balance constants (starting values approved by the player,
// to be re-tuned by playtesting in later phases):
const TYRE_GRIP_LOSS_FACTOR = 0.35; // pace lost at 100% wear, scaled by track degradation
const WEAR_PER_SEC_BASE = 0.03;     // tyre wear per simulated second (x compound x track degradation)
const FORCE_PIT_WEAR = 90;          // wear level where the AI pits regardless of score (survival stop)
const MIN_TYRE_WEAR_TO_PIT = 25;    // AI never pits on almost fresh tyres
const MIN_LAPS_LEFT_TO_PIT = 3;     // AI never pits with fewer laps remaining
const AI_PIT_SCORE_THRESHOLD = 55;  // boxes AI triggers above this utility score

// Incidents & flags (per simulated second and car; with 20 cars over
// a ~4500s race the expected totals are ~3 yellow flags, ~1-2 crash
// DNFs and ~1 mechanical DNF per race):
const INCIDENT_MINOR_PER_SEC = 1 / 30000;  // spin/offs -> yellow flag
const INCIDENT_MAJOR_PER_SEC = 1 / 60000;  // crash -> DNF + yellow/red
const MECH_FAILURE_PER_SEC = 1 / 110000;   // breakdown -> DNF, no flag
const RED_FLAG_CHANCE = 0.25;              // share of crashes that stop the race
const YELLOW_DURATION_SEC = 25;
const RED_DURATION_SEC = 70;
const YELLOW_PACE_FACTOR = 0.55;           // everyone slows behind the yellow

// Fallbacks if an id is missing from the roster (keeps the sim running).
const FALLBACK_DRIVER: Driver = {
  id: 'fallback-driver',
  name: 'Unknown Driver',
  pace: 70,
  consistency: 70,
  aggression: 50,
  wetSkill: 50,
  riskTolerance: 50,
};
const FALLBACK_CAR: Car = {
  id: 'fallback-car',
  teamId: 'fallback-team',
  aero: 70,
  engine: 70,
  chassis: 70,
  reliability: 70,
};

const commandQueue: PitCommand[] = [];

export function queuePitCommand(cmd: PitCommand): void {
  // Ignore duplicate pending commands for the same driver.
  if (commandQueue.some((c) => c.carDriverId === cmd.carDriverId)) return;
  commandQueue.push(cmd);
}

function lookupDriver(state: RaceState, car: RaceCarState): Driver {
  return state.drivers.find((d) => d.id === car.driverId) ?? FALLBACK_DRIVER;
}

function lookupCarSpec(state: RaceState, car: RaceCarState): Car {
  return state.carSpecs.find((c) => c.id === car.carId) ?? FALLBACK_CAR;
}

function carRating(spec: Car): number {
  return (spec.aero + spec.engine + spec.chassis) / 3;
}

function computePace(
  car: RaceCarState,
  driver: Driver,
  spec: Car,
  track: Track,
  weather: Weather
): number {
  const tyrePenalty =
    (car.tyre.wear / 100) * track.tyreDegradationFactor * TYRE_GRIP_LOSS_FACTOR;
  const weatherPenalty = weather === 'dry' ? 0 : weather === 'lightRain' ? 0.05 : 0.15;
  const noiseRange = ((100 - driver.consistency) / 100) * 0.02;
  const noise = (Math.random() * 2 - 1) * noiseRange;
  const basePaceFactor = (driver.pace / 100) * 0.6 + (carRating(spec) / 100) * 0.4;
  // Floor of 0.05 so a car on dead tyres still crawls instead of freezing.
  return Math.max(0.05, basePaceFactor - tyrePenalty - weatherPenalty + noise);
}

function computeWearRate(car: RaceCarState, track: Track): number {
  const compoundFactor =
    car.tyre.compound === 'soft' ? 1.4 :
    car.tyre.compound === 'medium' ? 1.0 :
    car.tyre.compound === 'hard' ? 0.7 : 1.1;
  // Wear per simulated second (a ~100-130s lap => ~2.5-4.5%/lap depending
  // on compound and track degradation).
  return compoundFactor * track.tyreDegradationFactor * WEAR_PER_SEC_BASE;
}

export function computePitScore(
  car: RaceCarState,
  driverAggression: number,
  driverRiskTolerance: number,
  gapToCarBehindSec: number,
  track: Track
): number {
  const W_WEAR = 0.9;
  const W_UNDERCUT_THREAT = 0.6;
  const W_PIT_LOSS = 0.4;
  const W_AGGRESSION = 0.3;
  const W_POSITION_VALUE = 0.5;
  const W_RISK_TOLERANCE = 0.35;
  const undercutThreat =
    gapToCarBehindSec < 2 ? 1 : Math.max(0, 1 - gapToCarBehindSec / 10);
  const positionValue = car.position <= 3 ? 1 : car.position <= 10 ? 0.5 : 0.1;
  return (
    W_WEAR * (car.tyre.wear / 100) +
    W_UNDERCUT_THREAT * undercutThreat -
    W_PIT_LOSS * (track.pitLaneTimeLoss / 30) +
    W_AGGRESSION * (driverAggression / 100) -
    W_POSITION_VALUE * positionValue -
    W_RISK_TOLERANCE * (driverRiskTolerance / 100)
  ) * 100;
}

// Simple compound choice for the AI based on how much race is left:
// short final stint -> soft, long stint -> hard, otherwise medium.
function chooseCompound(lapsRemaining: number, totalLaps: number): TyreCompound {
  if (lapsRemaining <= totalLaps * 0.25) return 'soft';
  if (lapsRemaining >= totalLaps * 0.55) return 'hard';
  return 'medium';
}

// Race end condition (Phase 4): the race is over the moment the
// leader completes track.totalLaps. After that the state is frozen
// (simulationTick does nothing) and the classification is read as-is.
export function isRaceFinished(state: RaceState): boolean {
  return state.cars.some((c) => c.currentLap >= state.track.totalLaps);
}

// Final classification, best placed first.
export function getFinalClassification(state: RaceState): RaceCarState[] {
  return [...state.cars].sort((a, b) => a.position - b.position);
}

export function simulationTick(state: RaceState): void {
  if (state.isPaused) return;
  if (isRaceFinished(state)) return; // frozen after the chequered flag
  applyQueuedCommands(state);

  const seconds = state.simTimeMultiplier;

  // Flag timing: red suspends the race, yellow slows the whole field.
  if (state.flag !== 'green') {
    state.flagTimerSec -= seconds;
    if (state.flagTimerSec <= 0) {
      state.flag = 'green';
      state.flagTimerSec = 0;
    }
  }

  for (const car of state.cars) {
    if (car.status === 'dnf') continue;

    // Pitting cars stand still for their pit time (track default or
    // the player's staff-improved override).
    if (car.status === 'inPit') {
      car.pitTimerSec -= seconds;
      if (car.pitTimerSec <= 0) {
        car.status = 'racing';
        car.pitTimerSec = 0;
      }
      continue;
    }

    // Red flag: the race is suspended, nobody moves or wears tyres.
    if (state.flag === 'red') continue;

    const driver = lookupDriver(state, car);
    const spec = lookupCarSpec(state, car);
    let pace = computePace(car, driver, spec, state.track, state.weather);
    if (state.flag === 'yellow') pace *= YELLOW_PACE_FACTOR;

    for (let s = 0; s < seconds; s++) {
      car.lapProgress += pace / REFERENCE_LAP_SEC;
      if (car.lapProgress >= 1) {
        car.lapProgress -= 1;
        car.currentLap++;
      }
      car.tyre.wear = Math.min(100, car.tyre.wear + computeWearRate(car, state.track));
      car.tyre.lapsOnTyre += pace / REFERENCE_LAP_SEC;
    }
  }

  // Random incidents only under green flag conditions.
  if (state.flag === 'green') runIncidents(state, seconds);

  runPitStopAI(state);
  recalculatePositionsAndGaps(state);
  state.currentTick++;
}

function applyQueuedCommands(state: RaceState): void {
  while (commandQueue.length > 0) {
    const cmd = commandQueue.shift()!;
    const car = state.cars.find((c) => c.driverId === cmd.carDriverId);
    if (!car || car.status !== 'racing') continue;
    car.status = 'inPit';
    car.pitTimerSec = car.pitLaneTimeOverrideSec ?? state.track.pitLaneTimeLoss;
    car.tyre = { compound: cmd.newCompound, wear: 0, lapsOnTyre: 0 };
    car.pitStopsCompleted++;
  }
}

// ------------------------------------------------------------
// Random incidents: spins (yellow flag), crashes (DNF + yellow or
// red flag) and mechanical failures (DNF, no flag). Scaled by
// driver aggression/riskTolerance and the weather.
// ------------------------------------------------------------
function raiseFlag(state: RaceState, flag: 'yellow' | 'red', duration: number): void {
  if (state.flag === 'green') {
    state.flag = flag;
    state.flagTimerSec = duration;
  } else if (flag === 'red' && state.flag === 'yellow') {
    state.flag = 'red'; // a crash under yellow upgrades to red
    state.flagTimerSec = duration;
  }
}

function runIncidents(state: RaceState, seconds: number): void {
  const weatherFactor =
    state.weather === 'dry' ? 1 : state.weather === 'lightRain' ? 1.7 : 2.6;
  for (const car of state.cars) {
    if (car.status !== 'racing') continue;
    const driver = lookupDriver(state, car);
    const spec = lookupCarSpec(state, car);
    const risk = 0.55 + (driver.aggression + driver.riskTolerance) / 220; // ~0.7-1.4
    const pMinor = INCIDENT_MINOR_PER_SEC * risk * weatherFactor * seconds;
    const pMajor = INCIDENT_MAJOR_PER_SEC * risk * weatherFactor * seconds;
    const pMech = MECH_FAILURE_PER_SEC * (2 - spec.reliability / 100) * seconds;
    const roll = Math.random();
    if (roll < pMinor) {
      raiseFlag(state, 'yellow', YELLOW_DURATION_SEC);
    } else if (roll < pMinor + pMajor) {
      car.status = 'dnf'; // crash out
      if (Math.random() < RED_FLAG_CHANCE) {
        raiseFlag(state, 'red', RED_DURATION_SEC);
      } else {
        raiseFlag(state, 'yellow', YELLOW_DURATION_SEC);
      }
    } else if (roll < pMinor + pMajor + pMech) {
      car.status = 'dnf'; // mechanical failure, no flag
    }
  }
}

// Rival boxes AI: weighted utility via computePitScore, plus a survival
// stop when the tyres are dead. Player cars are skipped here; their stops
// only come from queuePitCommand.
function runPitStopAI(state: RaceState): void {
  if (state.flag === 'red') return; // race suspended: no stops planned
  for (const car of state.cars) {
    if (car.isPlayerControlled || car.status !== 'racing') continue;
    if (car.tyre.wear < MIN_TYRE_WEAR_TO_PIT) continue;
    const lapsRemaining = state.track.totalLaps - car.currentLap;
    if (lapsRemaining < MIN_LAPS_LEFT_TO_PIT) continue;

    const carBehind = state.cars.find((c) => c.position === car.position + 1);
    const gapToCarBehindSec = carBehind
      ? Math.max(0, car.gapToLeaderSec - carBehind.gapToLeaderSec)
      : 999;

    const driver = lookupDriver(state, car);
    const score = computePitScore(
      car,
      driver.aggression,
      driver.riskTolerance,
      gapToCarBehindSec,
      state.track
    );
    if (score > AI_PIT_SCORE_THRESHOLD || car.tyre.wear >= FORCE_PIT_WEAR) {
      queuePitCommand({
        carDriverId: car.driverId,
        newCompound: chooseCompound(lapsRemaining, state.track.totalLaps),
        requestedAtTick: state.currentTick,
      });
    }
  }
}

function totalProgress(car: RaceCarState): number {
  return car.currentLap + car.lapProgress;
}

function recalculatePositionsAndGaps(state: RaceState): void {
  const sorted = [...state.cars].sort((a, b) => totalProgress(b) - totalProgress(a));
  const leaderProgress = sorted.length > 0 ? totalProgress(sorted[0]) : 0;

  sorted.forEach((car, index) => {
    car.position = index + 1;
    const deficit = leaderProgress - totalProgress(car);
    if (deficit <= 0) {
      car.gapToLeaderSec = 0;
      return;
    }
    // Convert the lap-progress deficit into seconds using this car's pace.
    const driver = lookupDriver(state, car);
    const spec = lookupCarSpec(state, car);
    const pace = computePace(car, driver, spec, state.track, state.weather);
    car.gapToLeaderSec = (deficit * REFERENCE_LAP_SEC) / pace;
  });
}
