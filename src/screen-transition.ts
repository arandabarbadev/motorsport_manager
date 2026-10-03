// ============================================================
// SCREEN TRANSITION (Phase 7): ONE reusable wrapper for every
// screen swap (login, team, race, season) — quick fade out of the
// current screen, fade in of the next one. Same animation for all.
// ============================================================

export function swapScreen(container: HTMLElement, build: () => void): void {
  const current = container.firstElementChild as HTMLElement | null;

  const run = (): void => {
    build();
    const next = container.firstElementChild as HTMLElement | null;
    if (next) {
      next.classList.add('screen-enter');
      next.addEventListener(
        'animationend',
        () => next.classList.remove('screen-enter'),
        { once: true }
      );
    }
  };

  if (current) {
    current.classList.add('screen-leave');
    window.setTimeout(run, 150);
  } else {
    run();
  }
}
