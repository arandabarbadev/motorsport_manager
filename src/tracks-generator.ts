import { Track } from './types';
import { buildTrackSampler } from './track-path';
import { REAL_LAYOUTS } from './real-layouts';

// ============================================================
// TRACKS GENERATOR (Phase 5): the season's 20 circuits use the
// REAL layouts (GPS traces of the actual tracks, see
// src/real-layouts.ts). Fixed coordinates => deterministic.
// The renderer's Catmull-Rom turns the control points into a
// smooth closed circuit. Gameplay numbers come from the profiles
// below (real-ish values).
// ============================================================

interface TrackProfile {
  slug: string; // stable id suffix: gp-<slug> (survives reordering)
  name: string;
  laps: number; // real-ish race distance
  km: number; // real-ish lap length (display/tuning reference)
  corneriness: number; // 0..1: twisty street circuit vs flowing speed temple
  deg: number; // tyreDegradationFactor
  pit: number; // pitLaneTimeLoss (seconds)
}

// The 24 GPs of the season in REAL calendar order (spec 010):
// Melbourne opener, European summer, Yas Marina finale. Five famous
// classics added (Nürburgring, Le Mans, Estoril, Jerez, Kyalami),
// Barcelona removed.
export const TRACK_PROFILES: readonly TrackProfile[] = [
  { slug: 'melbourne', name: 'Melbourne', laps: 58, km: 5.3, corneriness: 0.45, deg: 0.95, pit: 21 },
  { slug: 'kyalami', name: 'Kyalami', laps: 68, km: 4.5, corneriness: 0.55, deg: 0.9, pit: 21 },
  { slug: 'yeda', name: 'Yeda', laps: 50, km: 6.2, corneriness: 0.7, deg: 0.9, pit: 24 },
  { slug: 'suzuka', name: 'Suzuka', laps: 53, km: 5.8, corneriness: 0.5, deg: 1.1, pit: 23 },
  { slug: 'baku', name: 'Bakú', laps: 51, km: 6.0, corneriness: 0.6, deg: 0.9, pit: 25 },
  { slug: 'madrid', name: 'Madrid', laps: 55, km: 5.5, corneriness: 0.65, deg: 1.0, pit: 22 },
  { slug: 'imola', name: 'Imola', laps: 63, km: 4.9, corneriness: 0.55, deg: 1.0, pit: 22 },
  { slug: 'monaco', name: 'Mónaco', laps: 78, km: 3.3, corneriness: 0.95, deg: 0.7, pit: 19 },
  { slug: 'montreal', name: 'Montreal', laps: 70, km: 4.4, corneriness: 0.5, deg: 0.8, pit: 20 },
  { slug: 'silverstone', name: 'Silverstone', laps: 52, km: 5.9, corneriness: 0.3, deg: 1.2, pit: 22 },
  { slug: 'lemans', name: 'Le Mans', laps: 80, km: 4.2, corneriness: 0.5, deg: 0.85, pit: 21 },
  { slug: 'nurburgring', name: 'Nürburgring', laps: 24, km: 20.8, corneriness: 0.85, deg: 1.35, pit: 24 },
  { slug: 'spa', name: 'Spa', laps: 44, km: 7.0, corneriness: 0.25, deg: 1.1, pit: 24 },
  { slug: 'hungria', name: 'Hungría', laps: 70, km: 4.4, corneriness: 0.8, deg: 0.75, pit: 20 },
  { slug: 'zandvoort', name: 'Zandvoort', laps: 72, km: 4.3, corneriness: 0.75, deg: 1.05, pit: 20 },
  { slug: 'monza', name: 'Monza', laps: 53, km: 5.8, corneriness: 0.15, deg: 1.15, pit: 23 },
  { slug: 'estoril', name: 'Estoril', laps: 70, km: 4.2, corneriness: 0.7, deg: 1.0, pit: 20 },
  { slug: 'singapur', name: 'Singapur', laps: 62, km: 5.0, corneriness: 0.9, deg: 0.85, pit: 23 },
  { slug: 'jerez', name: 'Jerez', laps: 69, km: 4.4, corneriness: 0.75, deg: 1.2, pit: 21 },
  { slug: 'austin', name: 'Austin', laps: 56, km: 5.5, corneriness: 0.45, deg: 1.1, pit: 22 },
  { slug: 'mexico', name: 'México', laps: 71, km: 4.3, corneriness: 0.5, deg: 0.85, pit: 21 },
  { slug: 'interlagos', name: 'Interlagos', laps: 71, km: 4.3, corneriness: 0.6, deg: 0.9, pit: 21 },
  { slug: 'lasvegas', name: 'Las Vegas', laps: 50, km: 6.2, corneriness: 0.55, deg: 1.05, pit: 24 },
  { slug: 'yasmarina', name: 'Yas Marina', laps: 58, km: 5.3, corneriness: 0.5, deg: 0.9, pit: 22 },
];

// The layouts are dense already (real traces), so a light smoothing
// pass is enough.
const SUBDIVISIONS_PER_SEGMENT = 3;
const NORMALIZATION_MARGIN = 0.06;

export function generateTrack(seed: number): Track {
  const profile = TRACK_PROFILES[seed % TRACK_PROFILES.length];
  const layout = REAL_LAYOUTS[seed % REAL_LAYOUTS.length];

  // Catmull-Rom smoothing into a closed dense loop (shared code with
  // the renderer).
  const smooth = buildTrackSampler(layout, SUBDIVISIONS_PER_SEGMENT).polyline();

  // --- Normalize into NORMALIZATION_MARGIN..1-margin of the 0..1 space ---
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const q of smooth) {
    if (q.x < minX) minX = q.x;
    if (q.x > maxX) maxX = q.x;
    if (q.y < minY) minY = q.y;
    if (q.y > maxY) maxY = q.y;
  }
  const span = Math.max(1e-6, maxX - minX, maxY - minY);
  const scale = (1 - 2 * NORMALIZATION_MARGIN) / span;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const path = smooth.map((q) => ({
    x: 0.5 + (q.x - cx) * scale,
    y: 0.5 + (q.y - cy) * scale,
  }));

  // Personality numbers from the profile (real-ish values).
  // overtakeDifficulty is derived from corneriness:
  //   clamp(0.25 + corneriness * 0.65, 0.2, 0.9)
  const clamp = (v: number, lo: number, hi: number): number =>
    Math.min(hi, Math.max(lo, v));
  const round2 = (v: number): number => Math.round(v * 100) / 100;

  return {
    // Stable id by name (spec 010): reordering the calendar no longer
    // changes what a saved id points to.
    id: `gp-${profile.slug}`,
    name: profile.name,
    totalLaps: profile.laps,
    path,
    overtakeDifficulty: round2(clamp(0.25 + profile.corneriness * 0.65, 0.2, 0.9)),
    tyreDegradationFactor: round2(profile.deg),
    pitLaneTimeLoss: profile.pit,
  };
}

// The 20 season tracks (stable ids: the career calendar survives).
export const ALL_TRACKS: Track[] = Array.from({ length: TRACK_PROFILES.length }, (_, seed) =>
  generateTrack(seed)
);

export function getTrackById(id: string): Track | undefined {
  return ALL_TRACKS.find((t) => t.id === id);
}
