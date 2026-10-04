// ============================================================
// ICON GENERATOR: writes the PNG icons the PWA installer requires
// (192/512 "any" + 512 "maskable") with plain Node (zlib + a tiny
// PNG encoder) — no image libraries needed.
// Usage: node tools/make-icons.js
// ============================================================
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function pngEncode(size, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  // Raw scanlines with filter byte 0.
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Colors (same palette as icon.svg).
const BG = [13, 17, 23, 255];
const RING = [225, 6, 0, 255];
const HUB = [230, 237, 243, 255];

// Steering-wheel icon sampler in normalized coordinates.
function sample(nx, ny, maskable) {
  const scale = maskable ? 0.62 : 1;
  const d = Math.hypot(nx - 0.5, ny - 0.5);
  const hub = 0.105 * scale;
  const ringOuter = 0.34 * scale;
  const ringInner = 0.255 * scale;
  if (d <= hub) return HUB;
  if (d >= ringInner && d <= ringOuter) return RING;
  return BG;
}

function renderIcon(size, maskable) {
  const rgba = Buffer.alloc(size * size * 4);
  const SS = 3; // supersampling for smooth edges
  const corner = 0.2 * size; // rounded corner radius (non-maskable)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x + (sx + 0.5) / SS;
          const py = y + (sy + 0.5) / SS;
          // Outside the rounded square -> transparent (except maskable,
          // which must be full-bleed opaque).
          if (!maskable) {
            const cx = Math.min(Math.max(px, corner), size - corner);
            const cy = Math.min(Math.max(py, corner), size - corner);
            if (Math.hypot(px - cx, py - cy) > corner) continue;
          }
          const color = sample(px / size, py / size, maskable);
          r += color[0];
          g += color[1];
          b += color[2];
          a += color[3];
        }
      }
      const samples = SS * SS;
      const i = (y * size + x) * 4;
      rgba[i] = Math.round(r / samples);
      rgba[i + 1] = Math.round(g / samples);
      rgba[i + 2] = Math.round(b / samples);
      rgba[i + 3] = Math.round(a / samples);
    }
  }
  return pngEncode(size, rgba);
}

const OUT = path.join(__dirname, '..', 'public');
const files = [
  ['icon-192.png', renderIcon(192, false)],
  ['icon-512.png', renderIcon(512, false)],
  ['icon-maskable-512.png', renderIcon(512, true)],
];
for (const [name, buf] of files) {
  fs.writeFileSync(path.join(OUT, name), buf);
  console.log(`${name} (${buf.length} bytes)`);
}
