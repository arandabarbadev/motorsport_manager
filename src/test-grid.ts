import { Car, Driver, RaceState, Team, Track } from './types';
import { buildRaceStateFromRoster } from './race-builder';
import { makeRng } from './rng';
import { Roster, TeamEntry } from './roster';
import { createDefaultCareer } from './career';

// ============================================================
// TEST GRID: deterministic demo roster (fixed seed) used by the
// console test harness, kept stable so results are comparable
// between runs. The real roster lives in localStorage (Phase 3).
// ============================================================

const TEST_SEED = 20260926;

function buildTestRoster(): Roster {
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
  const entries: TeamEntry[] = teamData.map((t, teamIndex) => {
    const team: Team = { id: `team-${teamIndex}`, name: t.name, budget: 0, color: t.color };
    const drivers: Driver[] = [];
    const cars: Car[] = [];
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
      cars.push({
        id: `car-${teamIndex}-${seat}`,
        teamId: team.id,
        aero: Math.round(rand(60, 85)),
        engine: Math.round(rand(60, 85)),
        chassis: Math.round(rand(60, 85)),
        reliability: Math.round(rand(70, 95)),
      });
    }
    return { team, drivers, cars };
  });

  return { version: 1, playerTeamId: 'team-0', entries };
}

export function buildTestRaceState(): RaceState {
  return buildRaceStateFromRoster(buildTestRoster(), buildTestTrack(), createDefaultCareer(0));
}

// The original placeholder oval: kept so harness results stay
// comparable across phases (the real game uses generated tracks).
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
