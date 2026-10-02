// Repairs src/firebase-config.ts after a messy paste: extracts the
// six values by name and rewrites the file in canonical form.
// Prints ONLY which keys were found/missing (never the values).
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'src', 'firebase-config.ts');
const KEYS = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

const raw = fs.readFileSync(FILE, 'utf8');
const get = (key) => {
  const m = raw.match(new RegExp(key + "\\s*:\\s*[\"']([^\"']+)"));
  return m ? m[1] : null;
};

const values = KEYS.map((k) => get(k) ?? '');
// apiKey/projectId/authDomain are the ones Auth+Firestore really need.
const essential = ['apiKey', 'projectId', 'authDomain'].filter(
  (k) => !get(k)
);
if (essential.length > 0) {
  console.log('FALTAN claves imprescindibles: ' + essential.join(', '));
  console.log('Vuelve a copiar el bloque completo desde Firebase (pestaña Config).');
  process.exit(1);
}
const missing = KEYS.filter((_, i) => !values[i]);

// Real Firebase web API keys are ~39 chars and never contain "...".
const looksReal =
  values[0].startsWith('AIza') && values[0].length >= 30 && !values[0].includes('..');
const out =
  '// FIREBASE CONFIG: valores de tu proyecto ( pegados desde la consola ).\n' +
  'const firebaseConfig = {\n' +
  KEYS.map((k, i) => `  ${k}: '${values[i]}',`).join('\n') +
  '\n};\n\nexport const FIREBASE_CONFIG = firebaseConfig;\n';

fs.writeFileSync(FILE, out);
if (missing.length > 0) {
  console.log('AVISO: quedaron vacias (no imprescindibles): ' + missing.join(', '));
}
console.log(looksReal
  ? 'OK: archivo reparado y los valores parecen reales.'
  : 'OK: archivo reparado, PERO los valores parecen el ejemplo falso (xxxx / sin AIza).');
