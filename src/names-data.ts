// ============================================================
// LOCAL NAME LISTS (Phase 3): used to generate rival driver and
// team names. 100% local data, no external API calls.
// ============================================================

export const FIRST_NAMES: string[] = [
  'Leo', 'Enzo', 'Kai', 'Max', 'Nico', 'Ryu', 'Mateo', 'Dante',
  'Aria', 'Lena', 'Iris', 'Nora', 'Elio', 'Bruno', 'Luca', 'Silas',
  'Theo', 'Jonas', 'Milo', 'Ezra', 'Ravi', 'Omar', 'Ivan', 'Hugo',
];

export const LAST_NAMES: string[] = [
  'Rossi', 'Silva', 'Moreau', 'Weber', 'Novak', 'Sato', 'Larsen', 'Vidal',
  'Klein', 'Marchetti', 'Okafor', 'Duarte', 'Haugen', 'Reyes', 'Farkas', 'Ibrahim',
  'Yamada', 'Petrov', 'Salas', 'Berger', 'Fontana', 'Iversen', 'Navarro', 'Adeyemi',
];

export const TEAM_NAME_PREFIXES: string[] = [
  'Scuderia', 'Apex', 'Nova', 'Velocity', 'Titan', 'Falcon',
  'Crimson', 'Comet', 'Vortex', 'Aurora', 'Zenith', 'Sable',
];

export const TEAM_NAME_SUFFIXES: string[] = [
  'Racing', 'GP', 'Motorsport', 'Racing Team', 'Grand Prix', 'Squadra', 'Team', 'Racing Co.',
];

// 9 distinct colors for the rival teams (player default is #e10600).
export const RIVAL_TEAM_COLORS: string[] = [
  '#27f4d2', '#3671c6', '#ff8000', '#229971', '#0090ff',
  '#b6babd', '#b453c1', '#f5c542', '#ff5c8a',
];
