import { Track } from './types';
import { makeRng } from './rng';
import { buildTrackSampler } from './track-path';

// ============================================================
// TRACKS GENERATOR (Phase 5): deterministic procedural circuits.
// generateTrack(seed) always produces the SAME track for the same
// seed (seeded rng, never global Math.random). Algorithm:
//   1. N points (~12-24, varies with seed) at increasing angles
//      0..2PI around center (0.5, 0.5): base radius + seed jitter.
//   2. Catmull-Rom smoothing (shared with the renderer) into a
//      closed loop, re-normalized into ~0.06..0.94 of the 0..1
//      space of Track.path (types.ts stays unchanged).
//   3. Gameplay numbers derived from the generated shape
//      (formulas documented below).
// ============================================================

// Simple made-up GP names (no real circuits, per design).
const TRACK_NAMES: string[] = [
  'Aurora Ring', 'Costa Brava', 'Monte Alto', 'Bahía Azul', 'Desierto Rojo',
  'Selva Verde', 'Ciudad Nova', 'Puerto Norte', 'Valle Oscuro', 'Lago Espejo',
  'Colina Dorada', 'Río Blanco', 'Sierra Negra', 'Costa Esmeralda', 'Pradera',
  'Circuito Real', 'Delta Grande', 'Altiplano', 'Curva del Sol', 'Islas Gemelas',
];

const SUBDIVISIONS_PER_SEGMENT = 6;
const NORMALIZATION_MARGIN = 0.06;

export function generateTrack(seed: number): Track {
  // Unique rng stream per track (prime offset avoids overlapping streams).
  const rng = makeRng(1013904223 + seed * 7919);

  // --- 1) Spoke control points with seed-driven jitter ---
  const pointCount = 12 + Math.floor(rng() * 13); // 12..24 points
  const baseRadius = 0.28 + rng() * 0.07; // 0.28..0.35
  const radiusJitter = 0.05 + rng() * 0.09; // 0.05..0.14
  const squashY = 0.72 + rng() * 0.12; // vertical squash for variety
  const spokeStep = (Math.PI * 2) / pointCount;
  const control: { x: number; y: number }[] = [];
  for (let i = 0; i < pointCount; i++) {
    // Jitter stays under half a spoke step, so angles keep increasing.
    const angle = i * spokeStep + (rng() * 2 - 1) * spokeStep * 0.35;
    const radius = Math.max(0.12, baseRadius + (rng() * 2 - 1) * radiusJitter);
    control.push({
      x: 0.5 + Math.cos(angle) * radius,
      y: 0.5 + Math.sin(angle) * radius * squashY,
    });
  }

  // --- 2) Catmull-Rom smoothing into a closed dense loop ---
  const smooth = buildTrackSampler(control, SUBDIVISIONS_PER_SEGMENT).polyline();

  // --- Normalize into NORMALIZATION_MARGIN..1-margin of the 0..1 space ---
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of smooth) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const span = Math.max(1e-6, maxX - minX, maxY - minY);
  const scale = (1 - 2 * NORMALIZATION_MARGIN) / span;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const path = smooth.map((p) => ({
    x: 0.5 + (p.x - cx) * scale,
    y: 0.5 + (p.y - cy) * scale,
  }));

  // --- 3) Derive gameplay numbers from the generated shape ---
  // Raw measurements of the dense normalized loop:
  let rawLength = 0;
  for (let i = 0; i < path.length; i++) {
    const a = path[i];
    const b = path[(i + 1) % path.length];
    rawLength += Math.hypot(b.x - a.x, b.y - a.y);
  }
  let turning = 0; // total heading change of the closed loop (radians)
  for (let i = 0; i < path.length; i++) {
    const a = path[(i - 1 + path.length) % path.length];
    const b = path[i];
    const c = path[(i + 1) % path.length];
    let d =
      Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(b.y - a.y, b.x - a.x);
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    turning += Math.abs(d);
  }
  // Formulas (starting numbers, tuned later by playtesting):
  //   lapKm           = rawLength * 3                    (normalized loop -> ~4-7 km)
  //   cornersPerKm    = (turning / (PI/2)) / lapKm       (90-degree-equivalent corners per km)
  //   totalLaps       = clamp(round(300 / lapKm), 35, 70) (~300 km of race distance)
  //   overtakeDiff.   = clamp(0.25 + cornersPerKm * 0.18, 0.2, 0.9)
  //   tyreDegradation = clamp(0.7 + cornersPerKm * 0.12, 0.7, 1.4)
  //   pitLaneTimeLoss = clamp(round(16 + lapKm * 1.4), 18, 28) seconds
  const lapKm = rawLength * 3;
  const cornersPerKm = turning / (Math.PI / 2) / lapKm;
  const totalLaps = Math.min(70, Math.max(35, Math.round(300 / lapKm)));
  const overtakeDifficulty = Math.min(0.9, Math.max(0.2, 0.25 + cornersPerKm * 0.18));
  const tyreDegradationFactor = Math.min(1.4, Math.max(0.7, 0.7 + cornersPerKm * 0.12));
  const pitLaneTimeLoss = Math.min(28, Math.max(18, Math.round(16 + lapKm * 1.4)));
  const round2 = (v: number): number => Math.round(v * 100) / 100;

  return {
    id: `track-${seed}`,
    name: TRACK_NAMES[seed % TRACK_NAMES.length],
    totalLaps,
    path,
    overtakeDifficulty: round2(overtakeDifficulty),
    tyreDegradationFactor: round2(tyreDegradationFactor),
    pitLaneTimeLoss,
  };
}

// The 20 season tracks, generated once with seeds 0..19 (stable order).
export const ALL_TRACKS: Track[] = Array.from({ length: 20 }, (_, seed) =>
  generateTrack(seed)
);

export function getTrackById(id: string): Track | undefined {
  return ALL_TRACKS.find((t) => t.id === id);
}
