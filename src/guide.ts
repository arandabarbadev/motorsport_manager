// ============================================================
// FIRST-TIME GUIDES (spec 008): a small dismissible card shown
// ONCE per screen key, remembered in localStorage per BROWSER
// (not per save game and not synced to the cloud — a player who
// already knows the game should never be re-explained).
// ============================================================

const GUIDE_KEY = 'f1manager:tutorial:v1';

export function showGuideOnce(id: string, title: string, lines: string[]): void {
  // Mark as seen BEFORE showing: the guide appears exactly once per
  // screen, even if the page is reloaded while it is open.
  try {
    const seen = JSON.parse(localStorage.getItem(GUIDE_KEY) ?? '{}') as Record<string, number>;
    if (seen[id]) return;
    seen[id] = 1;
    localStorage.setItem(GUIDE_KEY, JSON.stringify(seen));
  } catch {
    return; // storage broken: skip the guide rather than block the game
  }

  const card = document.createElement('div');
  card.className = 'guide-card';
  const heading = document.createElement('h3');
  heading.textContent = title;
  const list = document.createElement('ul');
  for (const line of lines) {
    const li = document.createElement('li');
    li.textContent = line;
    list.appendChild(li);
  }
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn primary';
  btn.textContent = 'Entendido';
  btn.addEventListener('click', () => card.remove());
  card.append(heading, list, btn);
  document.body.appendChild(card);
}
