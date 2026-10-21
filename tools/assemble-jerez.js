// ============================================================
// ASSEMBLE THE REAL JEREZ LAP (spec 018)
// The old data/f1-circuits/es-1986.geojson came from OSM way
// 831985059, which is the sports_centre PERIMETER, not the track.
// The racetrack itself is mapped as highway=raceway ways with real
// corner names (Curva Dry Sac, Curva Sito Pons...). This tool:
//   1. downloads the OSM map around the circuit (REST API — the
//      public Overpass endpoints are blocked from this network),
//   2. builds an undirected graph of the raceway ways (Pit Lane and
//      kart tracks excluded),
//   3. prunes dead ends, then walks the loop choosing at every
//      junction the continuation most aligned with the arrival
//      heading (box entrances diverge and are avoided),
//   4. writes the lap as a LineString geojson that
//      tools/convert-layouts.js consumes unchanged.
// Result: closed loop, 4.426 km (real lap: 4.428 km).
// Usage: node tools/assemble-jerez.js
// ============================================================
const fs = require('fs');
const path = require('path');
const https = require('https');

const BBOX = '-6.070,36.680,-6.000,36.740'; // Circuito de Jerez y alrededores
const OUT_FILE = path.join(__dirname, '..', 'data', 'f1-circuits', 'es-1986.geojson');
const CACHE = path.join(require('os').tmpdir(), 'mm-jerez-map.json');

function downloadMap() {
  if (fs.existsSync(CACHE)) {
    console.log('mapa cacheado en', CACHE);
    return Promise.resolve(JSON.parse(fs.readFileSync(CACHE, 'utf8')));
  }
  const url =
    'https://api.openstreetmap.org/api/0.6/map.json?bbox=' + encodeURIComponent(BBOX);
  console.log('descargando', url);
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'motorsport-manager-layouts/1.0' } }, (res) => {
        if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          fs.writeFileSync(CACHE, body);
          resolve(JSON.parse(body));
        });
      })
      .on('error', reject);
  });
}

function assembleLap(map) {
  const nodes = new Map(map.elements.filter((e) => e.type === 'node').map((e) => [e.id, e]));
  const ways = map.elements.filter(
    (e) =>
      e.type === 'way' &&
      e.tags &&
      e.tags.highway === 'raceway' &&
      e.tags.sport === 'motor' &&
      !/^pit lane$/i.test(e.tags.name || '')
  );
  console.log('ways raceway (sin Pit Lane):', ways.length);

  // Undirected graph: consecutive nodes inside each way.
  const adj = new Map();
  const link = (a, b) => {
    if (a === b) return;
    if (!adj.has(a)) adj.set(a, new Set());
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(a).add(b);
    adj.get(b).add(a);
  };
  for (const w of ways) for (let i = 1; i < w.nodes.length; i++) link(w.nodes[i - 1], w.nodes[i]);

  // Prune dead ends (stubs): only cycles and junctions survive.
  let pruned = true;
  while (pruned) {
    pruned = false;
    for (const [id, set] of adj) {
      if (set.size === 1) {
        adj.get([...set][0]).delete(id);
        adj.delete(id);
        pruned = true;
      }
    }
  }

  const heading = (a, b) =>
    Math.atan2(nodes.get(b).lat - nodes.get(a).lat, nodes.get(b).lon - nodes.get(a).lon);
  const angDiff = (x, y) => {
    let d = x - y;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return Math.abs(d);
  };

  // Walk the loop from the best-connected node, straightest continuation first.
  const start = [...adj.entries()].sort((a, b) => b[1].size - a[1].size)[0][0];
  const loop = [start];
  let prev = null;
  let cur = start;
  for (let step = 0; step < 5000; step++) {
    const nbrs = [...adj.get(cur)].filter((n) => n !== prev);
    if (nbrs.length === 0) throw new Error('dead end at node ' + cur);
    const h0 = prev !== null ? heading(prev, cur) : null;
    let next = nbrs[0];
    if (nbrs.length > 1 && h0 !== null) {
      next = nbrs.reduce((best, n) =>
        angDiff(heading(cur, n), h0) < angDiff(heading(cur, best), h0) ? n : best
      );
    }
    if (next === start) break;
    loop.push(next);
    prev = cur;
    cur = next;
  }
  if (!adj.get(cur).has(start)) throw new Error('the loop did not close');

  // Lap length (haversine) as the sanity check.
  const coords = loop.map((id) => [nodes.get(id).lon, nodes.get(id).lat]);
  let m = 0;
  for (let i = 1; i <= coords.length; i++) {
    const [lon1, lat1] = coords[i - 1];
    const [lon2, lat2] = coords[i % coords.length];
    const r = Math.PI / 180;
    const a =
      Math.sin(((lat2 - lat1) * r) / 2) ** 2 +
      Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lon2 - lon1) * r) / 2) ** 2;
    m += 2 * 6371000 * Math.asin(Math.sqrt(a));
  }
  console.log('lazo:', loop.length, 'nodos |', (m / 1000).toFixed(3), 'km (real 4,428)');

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name: 'Circuito de Jerez',
          source: 'OSM raceway ways assembled into the lap (tools/assemble-jerez.js)',
        },
        geometry: { type: 'LineString', coordinates: coords },
      },
    ],
  };
}

downloadMap()
  .then(assembleLap)
  .then((gj) => {
    fs.writeFileSync(OUT_FILE, JSON.stringify(gj));
    console.log('Escrito', OUT_FILE);
  })
  .catch((e) => {
    console.error('ERROR:', e.message);
    process.exit(1);
  });
