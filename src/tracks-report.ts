import { ALL_TRACKS } from './tracks-generator';
import { buildTrackSampler } from './track-path';

// ============================================================
// TRACKS REPORT: prints a summary table of the 20 generated
// season tracks (npm run tracks). Useful for tuning the
// generator formulas without opening the game.
// ============================================================

const pad = (s: string, n: number): string => (s.length >= n ? s : s + ' '.repeat(n - s.length));

export function tracksReport(): string {
  const lines = [
    '#   NAME                LAPS   ~KM   DEG   PIT(s)  DIFF  PTS',
    '------------------------------------------------------------',
  ];
  ALL_TRACKS.forEach((t, i) => {
    const pts = buildTrackSampler(t.path).polyline();
    let len = 0;
    for (let j = 0; j < pts.length; j++) {
      const a = pts[j];
      const b = pts[(j + 1) % pts.length];
      len += Math.hypot(b.x - a.x, b.y - a.y);
    }
    const lapKm = len * 3; // same formula as the generator
    lines.push(
      pad(String(i + 1), 4) +
        pad(t.name, 19) +
        pad(String(t.totalLaps), 5) +
        pad(lapKm.toFixed(1), 6) +
        pad(t.tyreDegradationFactor.toFixed(2), 6) +
        pad(String(t.pitLaneTimeLoss), 8) +
        pad(t.overtakeDifficulty.toFixed(2), 6) +
        String(t.path.length)
    );
  });
  return lines.join('\n');
}

// When executed directly with node (npm run tracks), print the table.
declare const require: { main: unknown };
declare const module: { exports: unknown };
if (
  typeof require !== 'undefined' &&
  typeof module !== 'undefined' &&
  require.main === module
) {
  console.log(tracksReport());
}
