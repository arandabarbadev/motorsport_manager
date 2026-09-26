import { ALL_TRACKS } from './tracks-generator';
import { buildTrackSampler } from './track-path';

// ============================================================
// LAYOUTS PREVIEW (dev tool): renders every season track as an
// ASCII map in the console (npm run maps), so layouts can be
// checked without opening the game.
// ============================================================

const W = 64;
const H = 26;

function asciiMap(path: { x: number; y: number }[]): string[] {
  const grid: string[][] = Array.from({ length: H }, () => new Array(W).fill(' '));
  const sampler = buildTrackSampler(path, 1); // dense already; cheap resample
  const steps = 900;
  for (let i = 0; i <= steps; i++) {
    const pt = sampler.pointAt(i / steps);
    const gx = Math.min(W - 1, Math.max(0, Math.round(pt.x * (W - 1))));
    const gy = Math.min(H - 1, Math.max(0, Math.round(pt.y * (H - 1))));
    grid[gy][gx] = '#';
  }
  // Mark the start/finish point.
  const s = sampler.pointAt(0);
  grid[Math.round(s.y * (H - 1))][Math.round(s.x * (W - 1))] = 'S';
  return grid.map((row) => row.join(''));
}

export function layoutsPreview(): string {
  const blocks: string[] = [];
  ALL_TRACKS.forEach((t, i) => {
    blocks.push(`--- ${i + 1}. ${t.name} (${t.totalLaps} laps) ---`);
    blocks.push(...asciiMap(t.path));
    blocks.push('');
  });
  return blocks.join('\n');
}

// When executed directly with node (npm run maps), print the maps.
declare const require: { main: unknown };
declare const module: { exports: unknown };
if (
  typeof require !== 'undefined' &&
  typeof module !== 'undefined' &&
  require.main === module
) {
  console.log(layoutsPreview());
}
