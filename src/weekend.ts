import { WeekendEvent, Track, Driver, Car, RaceCarState } from './types';
import type { CareerState, SeasonResult } from './career';
import { pointsForPosition, RaceStandingEntry } from './championship';

// ============================================================
// WEEKEND FORMAT (spec 011): each round is quali -> Sprint 1 ->
// Sprint 2 -> race. Everything is DERIVED from the recorded
// season results (no extra persisted state): the pending event is
// the first one without a result for the current round, and each
// grid comes from the previous event's classification.
// ============================================================

export const EVENT_ORDER: readonly WeekendEvent[] = ['quali', 'sprint1', 'sprint2', 'race'];

export function eventLabel(event: WeekendEvent): string {
  switch (event) {
    case 'quali': return 'Clasificación';
    case 'sprint1': return 'Sprint 1';
    case 'sprint2': return 'Sprint 2';
    default: return 'Carrera';
  }
}

// Short tag for the season history rows (race keeps the plain round
// number because it is "the" result of the weekend).
export function eventShortLabel(event: WeekendEvent): string {
  switch (event) {
    case 'quali': return '·Q';
    case 'sprint1': return '·S1';
    case 'sprint2': return '·S2';
    default: return '';
  }
}

// Race distance per event: quali is a 3-lap mini-race, sprints a
// quarter of the full distance (never below 3 laps).
export function eventLaps(track: Track, event: WeekendEvent): number {
  if (event === 'quali') return 3;
  if (event === 'race') return track.totalLaps;
  return Math.max(3, Math.ceil(track.totalLaps / 4));
}

// Championship points per event: sprints score the top 8
// (8-7-6-5-4-3-2-1); the race uses the full F1 table (championship.ts);
// quali scores nothing.
export const SPRINT_POINTS: readonly number[] = [8, 7, 6, 5, 4, 3, 2, 1];

export function sprintPointsForPosition(position: number): number {
  return position <= SPRINT_POINTS.length ? SPRINT_POINTS[position - 1] : 0;
}

// Points table of one race for a given event: the race uses the full
// F1 table, sprints the top-8 table, quali nothing.
export function eventPointsForPosition(position: number, event: WeekendEvent): number {
  if (event === 'race') return pointsForPosition(position);
  if (event === 'quali') return 0;
  return sprintPointsForPosition(position);
}

// Standings table of one event, from its final classification (order
// preserved — it becomes the next event's grid).
export function standingsForEvent(
  classification: RaceCarState[],
  event: WeekendEvent
): RaceStandingEntry[] {
  return classification.map((c) => ({
    driverId: c.driverId,
    teamId: c.teamId,
    points: eventPointsForPosition(c.position, event),
  }));
}

// Prize scale per event (spec 011): sprints pay a quarter of the
// race table, quali pays nothing (grid order is its reward).
export const SPRINT_PRIZE_FACTOR = 0.25;
export function eventPrizeFactor(event: WeekendEvent): number {
  if (event === 'quali') return 0;
  if (event === 'race') return 1;
  return SPRINT_PRIZE_FACTOR;
}

// Rain lottery share for short events (spec 011): a quarter of the
// race's rain risk for quali and the sprints.
export function eventRainChance(event: WeekendEvent, raceChance: number): number {
  return event === 'race' ? raceChance : raceChance * 0.4;
}

// The event of the current round that is still to be run: the first
// one of the weekend without a recorded result. If the whole weekend
// is done, returns null (the calendar has moved on).
export function pendingEvent(career: CareerState): WeekendEvent | null {
  const trackId = career.calendar[career.currentRaceIndex];
  if (!trackId) return null;
  const done = new Set(
    career.seasonResults.filter((r) => r.trackId === trackId).map((r) => r.event)
  );
  return EVENT_ORDER.find((ev) => !done.has(ev)) ?? null;
}

// Grid for an event, as a list of driver ids (fastest first):
// - quali: expected pace (same weighting as the engine);
// - any other event: the final classification of the previous one,
//   reconstructed from its recorded standings (order preserved).
export function gridForEvent(
  career: CareerState,
  event: WeekendEvent,
  expectedPace: (d: Driver, spec: Car) => number,
  rosterSpecs: { drivers: Driver[]; specs: Car[] }
): string[] | null {
  if (event === 'quali') return null; // caller sorts by expected pace
  const trackId = career.calendar[career.currentRaceIndex];
  const idx = EVENT_ORDER.indexOf(event);
  const previous = EVENT_ORDER[idx - 1];
  const result = career.seasonResults.find(
    (r: SeasonResult) => r.trackId === trackId && r.event === previous
  );
  if (result?.standings?.length) {
    return result.standings.map((s) => s.driverId);
  }
  // No previous result (should not happen): fall back to pace order.
  return (
    rosterSpecs.drivers
      .map((d, i) => ({ id: d.id, pace: expectedPace(d, rosterSpecs.specs[i]) }))
      .sort((a, b) => b.pace - a.pace)
      .map((x) => x.id) ?? null
  );
}
