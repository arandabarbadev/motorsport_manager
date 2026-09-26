import { Track } from './types';
import { buildTrackSampler } from './track-path';

// ============================================================
// TRACKS GENERATOR (Phase 5): hand-drawn layouts inspired by the
// REAL F1 circuits (player request: "muy parecidos", not just
// inspired numbers). Each layout below traces the real circuit's
// silhouette with its signature features (Monaco's hairpin, Spa's
// triangle, Suzuka's figure-8 crossing, Mexico's stadium loop...).
// Layouts are fixed coordinates => trivially reproducible and
// deterministic. The renderer's Catmull-Rom turns the control
// points into a smooth closed circuit.
// ============================================================

interface TrackProfile {
  name: string;
  laps: number; // real-ish race distance
  km: number; // real-ish lap length (display/tuning reference)
  corneriness: number; // 0..1: twisty street circuit vs flowing speed temple
  deg: number; // tyreDegradationFactor
  pit: number; // pitLaneTimeLoss (seconds)
}

// The 20 GPs of our season, in calendar order, with approximate
// real-world values (starting numbers, tuned by playtesting).
export const TRACK_PROFILES: readonly TrackProfile[] = [
  { name: 'Melbourne', laps: 58, km: 5.3, corneriness: 0.45, deg: 0.95, pit: 21 },
  { name: 'Yeda', laps: 50, km: 6.2, corneriness: 0.7, deg: 0.9, pit: 24 },
  { name: 'Bakú', laps: 51, km: 6.0, corneriness: 0.6, deg: 0.9, pit: 25 },
  { name: 'Madrid', laps: 55, km: 5.5, corneriness: 0.65, deg: 1.0, pit: 22 },
  { name: 'Mónaco', laps: 78, km: 3.3, corneriness: 0.95, deg: 0.7, pit: 19 },
  { name: 'Barcelona', laps: 66, km: 4.7, corneriness: 0.4, deg: 1.3, pit: 21 },
  { name: 'Imola', laps: 63, km: 4.9, corneriness: 0.55, deg: 1.0, pit: 22 },
  { name: 'Montreal', laps: 70, km: 4.4, corneriness: 0.5, deg: 0.8, pit: 20 },
  { name: 'Silverstone', laps: 52, km: 5.9, corneriness: 0.3, deg: 1.2, pit: 22 },
  { name: 'Spa', laps: 44, km: 7.0, corneriness: 0.25, deg: 1.1, pit: 24 },
  { name: 'Hungría', laps: 70, km: 4.4, corneriness: 0.8, deg: 0.75, pit: 20 },
  { name: 'Zandvoort', laps: 72, km: 4.3, corneriness: 0.75, deg: 1.05, pit: 20 },
  { name: 'Monza', laps: 53, km: 5.8, corneriness: 0.15, deg: 1.15, pit: 23 },
  { name: 'Singapur', laps: 62, km: 5.0, corneriness: 0.9, deg: 0.85, pit: 23 },
  { name: 'Interlagos', laps: 71, km: 4.3, corneriness: 0.6, deg: 0.9, pit: 21 },
  { name: 'México', laps: 71, km: 4.3, corneriness: 0.5, deg: 0.85, pit: 21 },
  { name: 'Austin', laps: 56, km: 5.5, corneriness: 0.45, deg: 1.1, pit: 22 },
  { name: 'Las Vegas', laps: 50, km: 6.2, corneriness: 0.55, deg: 1.05, pit: 24 },
  { name: 'Suzuka', laps: 53, km: 5.8, corneriness: 0.5, deg: 1.1, pit: 23 },
  { name: 'Yas Marina', laps: 58, km: 5.3, corneriness: 0.5, deg: 0.9, pit: 22 },
];

// ============================================================
// HAND-DRAWN LAYOUTS (rough 0..100 space, y grows downward like
// the canvas; normalized later). Point clusters = hairpins and
// chicanes. See layouts-preview.ts to render them as ASCII maps.
// ============================================================

type Pt = { x: number; y: number };
const p = (x: number, y: number): Pt => ({ x, y });

const LAYOUTS: Pt[][] = [
  // 1 Melbourne (Albert Park): flowing park loop, wiggle on the top-right side.
  [p(14,72),p(34,82),p(56,86),p(74,82),p(88,70),p(92,54),p(84,40),p(70,36),p(58,40),p(52,32),p(58,22),p(50,12),p(36,10),p(24,16),p(20,30),p(26,42),p(18,54),p(10,62)],
  // 2 Yeda: long straight along the bottom, "comb" of flicks along the corniche
  // (top chain: x always decreases so the flicks never overlap).
  [p(10,70),p(30,78),p(55,80),p(80,76),p(92,66),p(90,52),p(80,46),p(72,52),p(66,44),p(72,36),p(64,30),p(58,38),p(52,30),p(58,22),p(48,18),p(42,26),p(36,20),p(30,26),p(26,34),p(16,32),p(8,44),p(6,56)],
  // 3 Bakú: long seaside straight, tight castle climb (top-left zigzag), parallel return.
  [p(8,80),p(30,86),p(55,84),p(80,78),p(92,66),p(90,50),p(82,38),p(70,32),p(60,24),p(68,16),p(58,10),p(46,14),p(38,22),p(30,14),p(20,10),p(10,18),p(14,30),p(6,42)],
  // 4 Madrid: mix of fast sweepers and the tight arena section (notch at the top).
  [p(12,62),p(26,80),p(48,86),p(70,80),p(86,66),p(90,50),p(80,38),p(66,34),p(56,42),p(46,34),p(50,22),p(38,12),p(26,14),p(18,26),p(10,40),p(14,54)],
  // 5 Mónaco: hairpin loop at the mid-left, tunnel diagonal to the bottom-right, pool section kinks.
  [p(64,84),p(76,72),p(82,56),p(80,40),p(86,26),p(78,14),p(64,8),p(50,10),p(40,16),p(32,26),p(24,34),p(14,30),p(10,40),p(18,46),p(28,52),p(40,58),p(54,62),p(66,68),p(74,76),p(64,82),p(54,78),p(46,82)],
  // 6 Barcelona: long main straight, chicane on the right, flowing top sector, final loop bottom-left.
  [p(10,66),p(28,80),p(50,86),p(70,80),p(84,68),p(88,52),p(80,40),p(70,36),p(74,26),p(62,16),p(46,12),p(38,8),p(30,14),p(22,26),p(14,40),p(8,54)],
  // 7 Imola: valley loop with Tamburello-style chicane (left) and Rivazza doubles (bottom-right).
  [p(12,56),p(20,72),p(36,84),p(56,88),p(74,84),p(88,72),p(90,54),p(82,40),p(86,26),p(74,14),p(58,10),p(44,14),p(34,24),p(24,20),p(16,28),p(24,38),p(14,44)],
  // 8 Montreal: slim paperclip, hairpin at the left end, kink at the right end.
  [p(16,64),p(30,78),p(50,84),p(68,80),p(82,70),p(86,54),p(78,42),p(84,30),p(74,18),p(58,14),p(42,18),p(34,28),p(26,22),p(16,30),p(22,42),p(14,52)],
  // 9 Silverstone: fast pentagon with the Magotts/Becketts esses (top-right wiggle chain).
  [p(12,58),p(22,74),p(40,86),p(60,88),p(76,82),p(88,68),p(86,52),p(78,44),p(82,34),p(72,24),p(60,18),p(64,28),p(56,36),p(46,30),p(38,20),p(26,22),p(16,32),p(20,44),p(10,50)],
  // 10 Spa: long and open: flat-out bottom edge, La Source-style hairpin loop
  // at the right end, esses climbing the right side, fast sweep across the top.
  [p(18,78),p(32,86),p(46,88),p(60,84),p(70,76),p(80,80),p(88,72),p(84,62),p(76,66),p(78,54),p(72,44),p(62,36),p(52,28),p(40,20),p(28,14),p(16,16),p(8,26),p(6,40),p(10,52),p(8,64)],
  // 11 Hungría: twisty paperclip, wiggles on the left, tight final corner onto the straight.
  [p(14,58),p(24,76),p(42,86),p(60,84),p(74,76),p(84,62),p(82,46),p(72,36),p(62,40),p(54,30),p(60,20),p(50,12),p(38,16),p(30,26),p(36,36),p(26,44),p(16,40),p(10,48)],
  // 12 Zandvoort: dunes teardrop, Tarzan kink top-right, notch at the top-left.
  [p(16,60),p(28,78),p(48,86),p(66,82),p(80,70),p(86,54),p(78,40),p(82,28),p(70,16),p(54,12),p(42,16),p(34,26),p(26,22),p(18,30),p(26,40),p(16,46)],
  // 13 Monza: rounded triangle, Curva Grande arc on the right, Ascari wiggle top-left, Parabolica big arc at the bottom.
  [p(20,78),p(36,84),p(54,86),p(70,82),p(84,72),p(92,56),p(84,40),p(76,28),p(82,18),p(70,10),p(56,14),p(60,24),p(50,32),p(40,26),p(30,18),p(20,24),p(12,36),p(8,52),p(12,68)],
  // 14 Singapur: bay rectangle with a notch, chains of 90° corners, hairpin on the right side.
  [p(12,60),p(18,76),p(34,86),p(54,88),p(72,84),p(86,74),p(90,58),p(86,42),p(78,32),p(66,24),p(68,36),p(56,32),p(44,24),p(32,28),p(22,22),p(12,30),p(20,40),p(10,48)],
  // 15 Interlagos: compact anticlockwise triangle, Senna S wiggle on the right, stadium notch at the bottom.
  [p(14,56),p(24,72),p(40,84),p(58,86),p(72,80),p(80,68),p(76,54),p(70,42),p(78,32),p(68,20),p(52,14),p(36,16),p(26,26),p(30,38),p(20,44),p(12,48)],
  // 16 México: long straights with the Foro Sol stadium bump at the bottom-left, esses on the right.
  [p(10,62),p(20,78),p(38,86),p(58,84),p(74,76),p(86,62),p(88,44),p(78,32),p(64,28),p(54,34),p(46,26),p(52,18),p(40,12),p(28,16),p(20,26),p(26,36),p(16,44)],
  // 17 Austin: COTA esses cascading down the left, Turn 1 hairpin notch at the top-right, stadium loop bottom.
  [p(12,54),p(20,70),p(36,84),p(56,88),p(74,82),p(88,68),p(90,50),p(80,38),p(72,42),p(64,34),p(54,38),p(46,30),p(38,36),p(30,28),p(22,32),p(28,42),p(18,46)],
  // 18 Las Vegas: two huge parallel straights, tight kinks at both ends, Sphere bump on the left.
  [p(14,64),p(34,78),p(56,82),p(78,76),p(90,62),p(88,46),p(76,38),p(80,26),p(68,16),p(52,12),p(38,16),p(30,26),p(38,34),p(28,40),p(20,50)],
  // 19 Suzuka: THE figure-8 with the crossover in the middle, esses on the top loop, Degner curls on the bottom loop.
  [p(54,54),p(66,60),p(74,72),p(66,84),p(50,88),p(34,84),p(26,72),p(32,58),p(46,52),p(58,44),p(70,38),p(76,32),p(70,26),p(70,18),p(56,14),p(40,18),p(32,28),p(38,40),p(50,48)],
  // 20 Yas Marina: big loop with the tight hotel complex dipping into the middle (left), kinked back straight.
  [p(12,58),p(22,74),p(40,86),p(60,88),p(78,82),p(90,68),p(88,50),p(78,38),p(82,26),p(70,16),p(54,12),p(40,16),p(32,26),p(42,34),p(34,42),p(24,38),p(16,44)],
];

const SUBDIVISIONS_PER_SEGMENT = 5;
const NORMALIZATION_MARGIN = 0.06;

export function generateTrack(seed: number): Track {
  const profile = TRACK_PROFILES[seed % TRACK_PROFILES.length];
  const layout = LAYOUTS[seed % LAYOUTS.length];

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
    id: `track-${seed}`,
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
