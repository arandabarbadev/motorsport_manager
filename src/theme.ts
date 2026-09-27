// ============================================================
// THEME (light/dark, Instagram-style toggle). The choice is
// persisted in localStorage ("f1manager:theme") and applied as
// data-theme on <html>; all screens style themselves with CSS
// variables. Dark is the default.
// ============================================================

export type Theme = 'light' | 'dark';

const THEME_KEY = 'f1manager:theme';

const listeners = new Set<() => void>();

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  for (const cb of listeners) cb();
}

export function initTheme(): void {
  const saved = localStorage.getItem(THEME_KEY);
  document.documentElement.dataset.theme = saved === 'light' ? 'light' : 'dark';
}

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function toggleTheme(): void {
  applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
}

// Label for toggle buttons: shows what you would switch to.
export function themeButtonLabel(): string {
  return currentTheme() === 'dark' ? '☀️ Claro' : '🌙 Oscuro';
}

// React to theme changes (e.g. the canvas track layer repaints).
export function onThemeChange(cb: () => void): void {
  listeners.add(cb);
}
