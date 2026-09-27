// ============================================================
// CONVERT REAL F1 LAYOUTS (dev tool)
// Reads the downloaded GPS traces (data/f1-circuits/*.geojson,
// from github.com/bacinger/f1-circuits, OpenStreetMap data) and
// generates src/real-layouts.ts: normalized 0..1 control points
// for the game's track renderer.
//
// Usage: node tools/convert-layouts.js
// ============================================================
const fs = require('fs');
const path = require('path');

// Calendar order: file name (repo id) -> season round name.
const CALENDAR = [
  ['au-1953', 'Melbourne'],
  ['sa-2021', 'Yeda'],
  ['az-2016', 'Bakú'],
  ['es-2026', 'Madrid'],
  ['mc-1929', 'Mónaco'],
  ['es-1991', 'Barcelona'],
  ['it-1953', 'Imola'],
  ['ca-1978', 'Montreal'],
  ['gb-1948', 'Silverstone'],
  ['be-1925', 'Spa'],
  ['hu-1986', 'Hungría'],
  ['nl-1948', 'Zandvoort'],
  ['it-1922', 'Monza'],
  ['sg-2008', 'Singapur'],
  ['br-1977', 'Interlagos'],
  ['mx-1962', 'México'],
  ['us-2012', 'Austin'],
  ['us-2023', 'Las Vegas'],
  ['jp-1962', 'Suzuka'],
  ['ae-2009', 'Yas Marina'],
];

const DATA_DIR = path.join(__dirname, '..', 'data', 'f1-circuits');
const OUT_FILE = path.join(__dirname, '..', 'src', 'real-layouts.ts');

const MARGIN = 0.06;
const MAX_POINTS = 140; // cap per layout (Catmull-Rom re-smooths anyway)
const KEEP_HEADING_CHANGE = 14 * (Math.PI / 180); // rad between kept corners
const KEEP_MAX_DIST_FRAC = 0.012; // keep a point at least every 1.2% of diag

function loadTrace(file) {
  const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file + '.geojson'), 'utf8'));
  const feature = raw.features.find((f) => f.geometry && f.geometry.coordinates);
  const coords = feature.geometry.coordinates;
  if (feature.geometry.type === 'LineString') return coords;
  if (feature.geometry.type === 'MultiLineString') return coords[0];
  throw new Error(file + ': unsupported geometry ' + feature.geometry.type);
}

function project(coords) {
  // Equirectangular with cos(meanLat) correction; y flipped (north up
  // in GPS becomes up on screen).
  const meanLat = (coords.reduce((s, c) => s + c[1], 0) / coords.length) * (Math.PI / 180);
  const kx = Math.cos(meanLat);
  return coords.map(([lon, lat]) => ({ x: lon * kx, y: -lat }));
}

function simplify(points) {
  const diag = Math.hypot(
    Math.max(...points.map((p) => p.x)) - Math.min(...points.map((p) => p.x)),
    Math.max(...points.map((p) => p.y)) - Math.min(...points.map((p) => p.y))
  );
  const maxDist = diag * KEEP_MAX_DIST_FRAC;
  const kept = [points[0]];
  let acc = 0;
  let lastHeading = null;
  let lastKept = points[0];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    const heading = Math.atan2(cur.y - prev.y, cur.x - prev.x);
    if (lastHeading !== null) {
      let d = heading - lastHeading;
      while (d > Math.PI) d -= 2 * Math.PI;
      while (d < -Math.PI) d += 2 * Math.PI;
      acc += Math.abs(d);
    }
    lastHeading = heading;
    const distFromKept = Math.hypot(cur.x - lastKept.x, cur.y - lastKept.y);
    if (acc >= KEEP_HEADING_CHANGE || distFromKept >= maxDist) {
      kept.push(cur);
      acc = 0;
      lastKept = cur;
    }
  }
  // Drop a closing point that is too close to the first one.
  if (kept.length > 2) {
    const a = kept[kept.length - 1];
    const b = kept[0];
    if (Math.hypot(a.x - b.x, a.y - b.y) < diag * 0.005) kept.pop();
  }
  // If still too dense, thin uniformly.
  while (kept.length > MAX_POINTS) {
    const step = Math.ceil(kept.length / MAX_POINTS);
    for (let i = step; i < kept.length; i += step) kept.splice(i, 1);
    break;
  }
  return kept;
}

function normalize(points) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = Math.max(1e-9, maxX - minX);
  const spanY = Math.max(1e-9, maxY - minY);
  const scale = (1 - 2 * MARGIN) / Math.max(spanX, spanY);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const r = (v) => Math.round(v * 10000) / 10000;
  return points.map((p) => ({ x: r(0.5 + (p.x - cx) * scale), y: r(0.5 + (p.y - cy) * scale) }));
}

const blocks = [];
const summary = [];
CALENDAR.forEach(([file, name], i) => {
  const trace = project(loadTrace(file));
  const simplified = simplify(trace);
  const layout = normalize(simplified);
  summary.push(`${String(i + 1).padStart(2)} ${name.padEnd(12)} trace=${String(trace.length).padStart(4)} -> ${layout.length} pts`);
  const body = layout.map((p) => `  {x:${p.x},y:${p.y}},`).join('\n');
  blocks.push(`  // ${i + 1}. ${name} (${file})\n[\n${body}\n],`);
});

const out = `// ============================================================
// REAL F1 CIRCUIT LAYOUTS — AUTO-GENERATED, DO NOT EDIT BY HAND.
// Derived from GPS traces of the real circuits (OpenStreetMap data
// via github.com/bacinger/f1-circuits). Regenerate with:
//   node tools/convert-layouts.js
// Coordinates are normalized to 0..1 (y grows downward like the
// canvas, so the shape appears with north up).
// ============================================================

export const REAL_LAYOUTS: { x: number; y: number }[][] = [
${blocks.join('\n')}
];
`;

fs.writeFileSync(OUT_FILE, out);
console.log(summary.join('\n'));
console.log(`\nEscrito ${OUT_FILE} (${CALENDAR.length} circuitos)`);
