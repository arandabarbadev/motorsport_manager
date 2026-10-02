// Prints masked diagnostics of src/firebase-config.ts (shape only,
// never the full values).
const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'firebase-config.ts'),
  'utf8'
);

const get = (key) => {
  const m = raw.match(new RegExp(key + "\\s*:\\s*['\"]([^'\"]*)"));
  return m ? m[1] : '';
};

const mask = (v) =>
  v.length <= 12 ? '(demasiado corta)' : v.slice(0, 6) + '...' + v.slice(-4) + ` (${v.length} caracteres)`;

for (const key of ['apiKey', 'authDomain', 'projectId', 'appId']) {
  const v = get(key);
  console.log(`${key}: ${v ? mask(v) : '(vacía)'}`);
}
