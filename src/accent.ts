// ============================================================
// TEAM ACCENT (spec 019): the player team's livery color drives
// the whole UI. applyTeamAccent writes --accent over :root (the
// stylesheet's color-mix variants follow for free) and picks the
// button-text color by luminance — a yellow livery needs dark
// text, everything else white. Called at boot (main.ts), whenever
// the team screen mounts (covers slot switching) and live when
// the color input changes.
// ============================================================

// WCAG relative luminance of a #rrggbb color.
function relativeLuminance(hex: string): number {
  const channel = (from: number): number => {
    const c = parseInt(hex.slice(from, from + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

export function applyTeamAccent(color?: string): void {
  const root = document.documentElement;
  if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) {
    // Back to the theme default (F1 red).
    root.style.removeProperty('--accent');
    root.style.removeProperty('--accent-contrast');
    return;
  }
  root.style.setProperty('--accent', color.toLowerCase());
  // Light liveries (yellow, white…) get dark text on accent fills.
  root.style.setProperty(
    '--accent-contrast',
    relativeLuminance(color.toLowerCase()) > 0.55 ? '#101112' : '#ffffff'
  );
}
