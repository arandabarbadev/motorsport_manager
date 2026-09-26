import { Track } from './types';
import { makeRng } from './rng';
import { buildTrackSampler } from './track-path';

// ============================================================
// TRACKS GENERATOR (Phase 5): deterministic procedural circuits
// inspired by real F1 GPs (player request: "Bakú, Mónaco, Las
// Vegas, Madrid..."). Each seed maps to a TrackProfile that gives
// the circuit its personality (real-ish laps, tyre wear, pit loss
// and shape twist) while the layout itself stays procedural and
// reproducible (seeded rng, never global Math.random).
// ============================================================

interface TrackProfile {
  name: string;
  laps: number; // real-ish race distance
  km: number; // real-ish lap length (display/tuning reference)
  corneriness: number; // 0..1: twisty street circuit vs flowing speed temple
  deg: number; // tyreDegradationFactor
  pit: number; // pitLaneTimeLoss (seconds)
  squash: number; // vertical squash: elongated (Bakú ~0.42) vs compact layouts
}

// The 20 GPs of our season, in calendar order, with approximate
// real-world values (starting numbers, tuned by playtesting).
export const TRACK_PROFILES: readonly TrackProfile[] = [
  { name: 'Melbourne', laps: 58, km: 5.3, corneriness: 0.45, deg: 0.95, pit: 21, squash: 0.72 },
  { name: 'Yeda', laps: 50, km: 6.2, corneriness: 0.7, deg: 0.9, pit: 24, squash: 0.5 },
  { name: 'Bakú', laps: 51, km: 6.0, corneriness: 0.6, deg: 0.9, pit: 25, squash: 0.42 },
  { name: 'Madrid', laps: 55, km: 5.5, corneriness: 0.65, deg: 1.0, pit: 22, squash: 0.6 },
  { name: 'Mónaco', laps: 78, km: 3.3, corneriness: 0.95, deg: 0.7, pit: 19, squash: 0.8 },
  { name: 'Barcelona', laps: 66, km: 4.7, corneriness: 0.4, deg: 1.3, pit: 21, squash: 0.85 },
  { name: 'Imola', laps: 63, km: 4.9, corneriness: 0.55, deg: 1.0, pit: 22, squash: 0.75 },
  { name: 'Montreal', laps: 70, km: 4.4, corneriness: 0.5, deg: 0.8, pit: 20, squash: 0.62 },
  { name: 'Silverstone', laps: 52, km: 5.9, corneriness: 0.3, deg: 1.2, pit: 22, squash: 0.78 },
  { name: 'Spa', laps: 44, km: 7.0, corneriness: 0.25, deg: 1.1, pit: 24, squash: 0.7 },
  { name: 'Hungría', laps: 70, km: 4.4, corneriness: 0.8, deg: 0.75, pit: 20, squash: 0.85 },
  { name: 'Zandvoort', laps: 72, km: 4.3, corneriness: 0.75, deg: 1.05, pit: 20, squash: 0.8 },
  { name: 'Monza', laps: 53, km: 5.8, corneriness: 0.15, deg: 1.15, pit: 23, squash: 0.65 },
  { name: 'Singapur', laps: 62, km: 5.0, corneriness: 0.9, deg: 0.85, pit: 23, squash: 0.68 },
  { name: 'Interlagos', laps: 71, km: 4.3, corneriness: 0.6, deg: 0.9, pit: 21, squash: 0.88 },
  { name: 'México', laps: 71, km: 4.3, corneriness: 0.5, deg: 0.85, pit: 21, squash: 0.7 },
  { name: 'Austin', laps: 56, km: 5.5, corneriness: 0.45, deg: 1.1, pit: 22, squash: 0.82 },
  { name: 'Las Vegas', laps: 50, km: 6.2, corneriness: 0.55, deg: 1.05, pit: 24, squash: 0.45 },
  { name: 'Suzuka', laps: 53, km: 5.8, corneriness: 0.5, deg: 1.1, pit: 23, squash: 0.75 },
  { name: 'Yas Marina', laps: 58, km: 5.3, corneriness: 0.5, deg: 0.9, pit: 22, squash: 0.72 },
];

const SUBDIVISIONS_PER_SEGMENT = 6;
const NORMALIZATION_MARGIN = 0.06;

export function generateTrack(seed: number): Track {
  const profile = TRACK_PROFILES[seed % TRACK_PROFILES.length];
  // Unique rng stream per track (prime offset avoids overlapping streams).
  const rng = makeRng(1013904223 + seed * 7919);

  // --- 1) Spoke control points: the profile decides HOW twisty ---
  // (twisty circuits get more, shorter-radius control points).
  const pointCount = 10 + Math.round(profile.corneriness * 14); // 10..24
  const baseRadius = 0.32;
  const radiusJitter = 0.04 + profile.corneriness * 0.12;
  const angleJitterFactor = 0.2 + profile.corneriness * 0.28; // < 0.5 keeps order
  const spokeStep = (Math.PI * 2) / pointCount;
  const control: { x: number; y: number }[] = [];
  for (let i = 0; i < pointCount; i++) {
    // Jitter stays under half a spoke step, so angles keep increasing.
    const angle = i * spokeStep + (rng() * 2 - 1) * spokeStep * angleJitterFactor;
    const radius = Math.max(0.12, baseRadius + (rng() * 2 - 1) * radiusJitter);
    control.push({
      x: 0.5 + Math.cos(angle) * radius,
      y: 0.5 + Math.sin(angle) * radius * profile.squash,
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

  // --- 3) Personality numbers from the profile (real-ish values) ---
  // overtakeDifficulty is derived from corneriness:
  //   clamp(0.25 + corneriness * 0.65, 0.2, 0.9)
  const clamp = (v: number, lo: number, hi: number): number =>
    Math.min(hi, Math.max(lo, v));
  const round2 = (v: number): number => Math.round(v * 100) / 100;

  return {
    id: `track-${seed}`,
    name: profile.name,
    totalLaps: profile.laps,
    path,
    overtakeDifficulty: round2(clamp(0.25 + profile.corneriness * 0.65, 0.2, 0.9)),
    tyreDegradationFactor: round2(profile.deg),
    pitLaneTimeLoss: profile.pit,
  };
}

// The 20 season tracks, generated once with seeds 0..19 (stable order:
// the career calendar stores these ids and survives regenerations).
export const ALL_TRACKS: Track[] = Array.from({ length: TRACK_PROFILES.length }, (_, seed) =>
  generateTrack(seed)
);

export function getTrackById(id: string): Track | undefined {
  return ALL_TRACKS.find((t) => t.id === id);
}
