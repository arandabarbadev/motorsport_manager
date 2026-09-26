// ============================================================
// MODELO DE DATOS BASE
// Estas interfaces son el contrato entre el motor de simulación,
// la IA de rivales y el render. No dependen de React ni de Canvas.
// ============================================================

export type TyreCompound = 'soft' | 'medium' | 'hard' | 'wet';
export type CarStatus = 'racing' | 'inPit' | 'dnf';
export type Weather = 'dry' | 'lightRain' | 'heavyRain';

export interface Driver {
  id: string;
  name: string;
  pace: number;
  consistency: number;
  aggression: number;
  wetSkill: number;
  riskTolerance: number;
}

export interface Car {
  id: string;
  teamId: string;
  aero: number;
  engine: number;
  chassis: number;
  reliability: number;
}

export interface Team {
  id: string;
  name: string;
  budget: number;
  color: string;
}

export interface TyreState {
  compound: TyreCompound;
  wear: number;
  lapsOnTyre: number;
}

export interface Track {
  id: string;
  name: string;
  totalLaps: number;
  path: { x: number; y: number }[];
  overtakeDifficulty: number;
  tyreDegradationFactor: number;
  pitLaneTimeLoss: number;
}

export interface RaceCarState {
  driverId: string;
  carId: string;
  teamId: string;
  lapProgress: number;
  currentLap: number;
  tyre: TyreState;
  fuel: number;
  gapToLeaderSec: number;
  position: number;
  pitStopsCompleted: number;
  status: CarStatus;
  isPlayerControlled: boolean;
  // Engine extension: simulated seconds of pit time still remaining
  // while status is 'inPit' (0 when racing).
  pitTimerSec: number;
}

export interface RaceState {
  track: Track;
  weather: Weather;
  cars: RaceCarState[];
  // Engine extension: roster lookup by id, so simulationTick can resolve
  // real Driver stats and Car ratings for every RaceCarState.
  drivers: Driver[];
  carSpecs: Car[];
  currentTick: number;
  simTimeMultiplier: 1 | 5 | 10;
  isPaused: boolean;
}

export interface PitCommand {
  carDriverId: string;
  newCompound: TyreCompound;
  requestedAtTick: number;
}
