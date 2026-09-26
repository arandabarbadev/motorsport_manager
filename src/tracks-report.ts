import { ALL_TRACKS, TRACK_PROFILES } from './tracks-generator';

// ============================================================
// TRACKS REPORT: prints a summary table of the 20 season tracks
// (npm run tracks). Useful for tuning the profiles without
// opening the game.
// ============================================================

const pad = (s: string, n: number): string => (s.length >= n ? s : s + ' '.repeat(n - s.length));

export function tracksReport(): string {
  const lines = [
    '#   NAME             LAPS  KM   DEG   PIT(s)  DIFF',
    '-------------------------------------------------',
  ];
  ALL_TRACKS.forEach((t, i) => {
    lines.push(
      pad(String(i + 1), 4) +
        pad(t.name, 17) +
        pad(String(t.totalLaps), 5) +
        pad(TRACK_PROFILES[i].km.toFixed(1), 5) +
        pad(t.tyreDegradationFactor.toFixed(2), 6) +
        pad(String(t.pitLaneTimeLoss), 8) +
        t.overtakeDifficulty.toFixed(2)
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
