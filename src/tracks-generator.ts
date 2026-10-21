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

// The 20 GPs of the season in REAL calendar order (spec 010): Melbourne
// opener, European summer, Yas Marina finale. Spec 018: only real F1
// rounds stay, plus Jerez — the one classic Rafa keeps (Kyalami, Le
// Mans, Nürburgring and Estoril left the calendar).
export const TRACK_PROFILES: readonly TrackProfile[] = [
  { slug: 'melbourne', name: 'Melbourne', laps: 58, km: 5.3, corneriness: 0.45, deg: 0.95, pit: 21 },
  { slug: 'yeda', name: 'Yeda', laps: 50, km: 6.2, corneriness: 0.7, deg: 0.9, pit: 24 },
  { slug: 'suzuka', name: 'Suzuka', laps: 53, km: 5.8, corneriness: 0.5, deg: 1.1, pit: 23 },
  { slug: 'baku', name: 'Bakú', laps: 51, km: 6.0, corneriness: 0.6, deg: 0.9, pit: 25 },
  { slug: 'madrid', name: 'Madrid', laps: 55, km: 5.5, corneriness: 0.65, deg: 1.0, pit: 22 },
  { slug: 'imola', name: 'Imola', laps: 63, km: 4.9, corneriness: 0.55, deg: 1.0, pit: 22 },
  { slug: 'monaco', name: 'Mónaco', laps: 78, km: 3.3, corneriness: 0.95, deg: 0.7, pit: 19 },
  { slug: 'montreal', name: 'Montreal', laps: 70, km: 4.4, corneriness: 0.5, deg: 0.8, pit: 20 },
  { slug: 'silverstone', name: 'Silverstone', laps: 52, km: 5.9, corneriness: 0.3, deg: 1.2, pit: 22 },
  { slug: 'spa', name: 'Spa', laps: 44, km: 7.0, corneriness: 0.25, deg: 1.1, pit: 24 },
  { slug: 'hungria', name: 'Hungría', laps: 70, km: 4.4, corneriness: 0.8, deg: 0.75, pit: 20 },
  { slug: 'zandvoort', name: 'Zandvoort', laps: 72, km: 4.3, corneriness: 0.75, deg: 1.05, pit: 20 },
  { slug: 'monza', name: 'Monza', laps: 53, km: 5.8, corneriness: 0.15, deg: 1.15, pit: 23 },
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

// --- Declash (spec 018) ---
// A track drawn as a road ribbon fuses wherever the lap runs close to
// itself (Singapore's castle esses, Mónaco's port section, Suzuka's
// bridge). declash() pushes path points apart until non-neighbor
// sections keep a minimum gap, then the caller re-normalizes. Two
// target gaps: pairs 6-10% of the lap apart are FOLDS of the same
// complex (esses, snake) and only need to peel apart a little; pairs
// further apart are true parallel sections and must fully separate.
// Pairs closer than ROAD_DECLASH_ARC_FRAC of the lap along the arc are
// left alone — that is the SAME corner (a hairpin or a chicane), not a
// clash. Deterministic: no randomness, fixed iteration budget.
const ROAD_DECLASH_TARGET = 0.078; // min gap between far parallel sections
const ROAD_DECLASH_NEAR_TARGET = 0.058; // softer gap for near folds (6-10% arc)
const ROAD_DECLASH_ARC_FRAC = 0.06; // arc share below which a pair is "same corner"
const ROAD_DECLASH_NEAR_ARC_FRAC = 0.1; // folds vs parallels boundary
const ROAD_DECLASH_ITERS = 300;
const ROAD_DECLASH_STEP = 0.28; // fraction of the gap closed per iteration
const ROAD_DECLASH_SMOOTH = 3; // displacement smoothing window (samples)

export function declash(points: { x: number; y: number }[]): { x: number; y: number }[] {
  const n = points.length;
  const pts = points.map((p) => ({ ...p }));
  // Arc length of the ORIGINAL positions: the "same corner" test does
  // not change as points move a little.
  const cum: number[] = [0];
  for (let i = 1; i <= n; i++) {
    const a = pts[i - 1];
    const b = pts[i % n];
    cum.push(cum[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
  }
  const total = cum[n];
  const minArc = total * ROAD_DECLASH_ARC_FRAC;
  const nearArc = total * ROAD_DECLASH_NEAR_ARC_FRAC;

  for (let iter = 0; iter < ROAD_DECLASH_ITERS; iter++) {
    const push = Array.from({ length: n }, () => ({ x: 0, y: 0 }));
    let worst = 1;
    // Spatial hash with target-sized cells: only close pairs are
    // examined instead of the full n x n.
    const grid = new Map<string, number[]>();
    const cellKey = (x: number, y: number): string =>
      Math.floor(x / ROAD_DECLASH_TARGET) + ':' + Math.floor(y / ROAD_DECLASH_TARGET);
    for (let i = 0; i < n; i++) {
      const k = cellKey(pts[i].x, pts[i].y);
      const list = grid.get(k);
      if (list) list.push(i);
      else grid.set(k, [i]);
    }
    for (let i = 0; i < n; i++) {
      const gx = Math.floor(pts[i].x / ROAD_DECLASH_TARGET);
      const gy = Math.floor(pts[i].y / ROAD_DECLASH_TARGET);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const list = grid.get(`${gx + dx}:${gy + dy}`);
          if (!list) continue;
          for (const j of list) {
            if (j <= i) continue;
            const arc = Math.min(cum[j] - cum[i], total - (cum[j] - cum[i]));
            if (arc < minArc) continue;
            const target = arc < nearArc ? ROAD_DECLASH_NEAR_TARGET : ROAD_DECLASH_TARGET;
            const ddx = pts[j].x - pts[i].x;
            const ddy = pts[j].y - pts[i].y;
            const d = Math.hypot(ddx, ddy);
            if (d >= target) continue;
            if (d < worst) worst = d;
            // The push normalizes by d, so it must be CAPPED — at a
            // true crossing (Suzuka's bridge) d ~ 0 and the raw force
            // would explode and shred the layout.
            const f = ((target - d) / Math.max(d, target * 0.25)) * 0.5 * ROAD_DECLASH_STEP;
            push[i].x -= ddx * f;
            push[i].y -= ddy * f;
            push[j].x += ddx * f;
            push[j].y += ddy * f;
          }
        }
      }
    }
    if (worst >= ROAD_DECLASH_NEAR_TARGET) break; // nothing left to fix
    // Smooth displacements along the path so single samples do not spike.
    const smoothed = push.map((_, i) => {
      let sx = 0;
      let sy = 0;
      for (let k = -ROAD_DECLASH_SMOOTH; k <= ROAD_DECLASH_SMOOTH; k++) {
        const q = push[(i + k + n) % n];
        sx += q.x;
        sy += q.y;
      }
      const c = 2 * ROAD_DECLASH_SMOOTH + 1;
      return { x: sx / c, y: sy / c };
    });
    for (let i = 0; i < n; i++) {
      pts[i].x += smoothed[i].x;
      pts[i].y += smoothed[i].y;
    }
  }
  return pts;
}

// Fit a closed path into NORMALIZATION_MARGIN..1-margin, keeping the
// aspect ratio (shared by the first pass and the post-declash pass).
function normalizeIntoMargin(
  pts: { x: number; y: number }[]
): { x: number; y: number }[] {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const q of pts) {
    if (q.x < minX) minX = q.x;
    if (q.x > maxX) maxX = q.x;
    if (q.y < minY) minY = q.y;
    if (q.y > maxY) maxY = q.y;
  }
  const span = Math.max(1e-6, maxX - minX, maxY - minY);
  const scale = (1 - 2 * NORMALIZATION_MARGIN) / span;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return pts.map((q) => ({
    x: 0.5 + (q.x - cx) * scale,
    y: 0.5 + (q.y - cy) * scale,
  }));
}

export function generateTrack(seed: number): Track {
  const profile = TRACK_PROFILES[seed % TRACK_PROFILES.length];
  const layout = REAL_LAYOUTS[seed % REAL_LAYOUTS.length];

  // Catmull-Rom smoothing into a closed dense loop (shared code with
  // the renderer), then normalize, declash and re-normalize (the push
  // can drift slightly out of the margins).
  const smooth = buildTrackSampler(layout, SUBDIVISIONS_PER_SEGMENT).polyline();
  const path = normalizeIntoMargin(declash(normalizeIntoMargin(smooth)));

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
