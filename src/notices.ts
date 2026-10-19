// ============================================================
// NOTICE HUB (spec 017): tiny reusable toast stack. Mount it in any
// positioned container and call notify() — the race HUD uses it for
// mechanical retirements, and future screens (sponsors, driver
// signings, morale) will reuse the exact same component. Pure DOM +
// CSS from ui.css; no engine or race dependencies live here.
// ============================================================

export type NoticeKind = 'info' | 'success' | 'alert';

export interface NoticeInput {
  title: string;
  body?: string;
  kind?: NoticeKind;
  ttlMs?: number;
}

export interface NoticeHub {
  notify(input: NoticeInput): void;
  clear(): void;
  destroy(): void;
}

export const NOTICE_MAX_VISIBLE = 4;
export const NOTICE_DEFAULT_TTL_MS = 7000;
const LEAVE_MS = 300;

export function createNoticeHub(mount: HTMLElement): NoticeHub {
  const stack = document.createElement('div');
  stack.className = 'notice-stack';
  mount.appendChild(stack);

  const removeCard = (card: HTMLElement): void => {
    card.classList.add('leaving');
    window.setTimeout(() => card.remove(), LEAVE_MS);
  };

  return {
    notify(input: NoticeInput): void {
      const card = document.createElement('div');
      card.className = 'notice ' + (input.kind ?? 'info');
      const title = document.createElement('div');
      title.className = 'notice-title';
      title.textContent = input.title;
      card.appendChild(title);
      if (input.body !== undefined && input.body !== '') {
        const body = document.createElement('div');
        body.className = 'notice-body';
        body.textContent = input.body;
        card.appendChild(body);
      }
      // Newest on top; past the cap the oldest card just falls off.
      stack.prepend(card);
      while (stack.children.length > NOTICE_MAX_VISIBLE) {
        stack.lastChild!.remove();
      }
      window.setTimeout(() => {
        if (card.isConnected) removeCard(card);
      }, input.ttlMs ?? NOTICE_DEFAULT_TTL_MS);
    },
    clear(): void {
      stack.innerHTML = '';
    },
    destroy(): void {
      stack.remove();
    },
  };
}
