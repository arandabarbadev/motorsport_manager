import './slots-screen.css';
import {
  SlotId,
  getActiveSlot,
  setActiveSlot,
  slotExists,
  slotName,
  slotSummary,
  setSlotName,
  deleteSlot,
  getSlotDifficulty,
  setSlotDifficulty,
} from './slots';
import { DIFFICULTY_ORDER, DIFFICULTY_PRESETS } from './difficulty';
import { themeButtonLabel, toggleTheme } from './theme';
import { scheduleCloudSync } from './cloud';

// ============================================================
// SLOTS SCREEN (spec 013): the three save slots. Each card shows
// its name (editable), a summary (season/round/budget) or "Vacía",
// and its actions: Jugar (activate + back to the team), Crear
// (activate an empty one — the team screen builds the new save)
// and Borrar (with a confirmation that names the save).
// ============================================================

const SLOT_LETTER: Record<SlotId, string> = { a: 'A', b: 'B', c: 'C' };

export function createSlotsScreen(container: HTMLElement, onPlay: () => void): void {
  container.innerHTML = '';

  const root = document.createElement('div');
  root.className = 'slots-screen';
  root.innerHTML = `
    <header class="slots-header">
      <h1>Partidas</h1>
      <div class="slots-header-actions">
        <button type="button" class="btn theme-btn"></button>
        <button type="button" class="btn slots-back-btn">Mi Equipo</button>
      </div>
    </header>
    <main class="slots-main"></main>`;
  container.appendChild(root);

  const mainEl = root.querySelector<HTMLElement>('.slots-main')!;
  const themeBtn = root.querySelector<HTMLButtonElement>('.theme-btn')!;
  themeBtn.textContent = themeButtonLabel();
  themeBtn.addEventListener('click', () => {
    toggleTheme();
    themeBtn.textContent = themeButtonLabel();
  });
  root.querySelector<HTMLButtonElement>('.slots-back-btn')!.addEventListener('click', onPlay);

  function render(): void {
    mainEl.innerHTML = '';
    const active = getActiveSlot();
    for (const slot of ['a', 'b', 'c'] as SlotId[]) {
      const exists = slotExists(slot);
      const summary = slotSummary(slot);
      const card = document.createElement('section');
      card.className =
        'slot-card' + (exists ? '' : ' empty') + (slot === active ? ' active' : '');

      const head = document.createElement('div');
      head.className = 'slot-head';
      const tag = document.createElement('span');
      tag.className = 'slot-tag';
      tag.textContent = SLOT_LETTER[slot];
      const nameInput = document.createElement('input');
      nameInput.className = 'slot-name-input';
      nameInput.type = 'text';
      nameInput.maxLength = 24;
      nameInput.value = slotName(slot);
      nameInput.setAttribute('aria-label', `Nombre de la partida ${SLOT_LETTER[slot]}`);
      nameInput.disabled = !exists && slot !== active;
      nameInput.addEventListener('change', () => {
        setSlotName(slot, nameInput.value);
        scheduleCloudSync();
        render();
      });
      head.append(tag, nameInput);
      if (slot === active) {
        const activeTag = document.createElement('span');
        activeTag.className = 'slot-active-tag';
        activeTag.textContent = 'Jugando';
        head.appendChild(activeTag);
      }
      card.appendChild(head);

      const meta = document.createElement('div');
      meta.className = 'slot-meta';
      meta.textContent = summary
        ? `Temporada ${summary.season} · Ronda ${summary.round}/${summary.rounds} · ${summary.budget} M€ · ${DIFFICULTY_PRESETS[summary.difficulty].label}`
        : 'Vacía';
      card.appendChild(meta);

      // Spec 016: the difficulty an empty slot will be created with.
      // Kept in localStorage (slot-diff) and baked into the career by
      // the team screen when "Crear" is pressed.
      if (!exists) {
        const picker = document.createElement('div');
        picker.className = 'slot-diff';
        const label = document.createElement('span');
        label.className = 'slot-diff-label';
        label.textContent = 'Dificultad';
        const btns = document.createElement('div');
        btns.className = 'slot-diff-btns';
        let selected = getSlotDifficulty(slot);
        const hint = document.createElement('div');
        hint.className = 'slot-diff-hint';
        hint.textContent = DIFFICULTY_PRESETS[selected].hint;
        for (const id of DIFFICULTY_ORDER) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'btn slot-diff-btn' + (id === selected ? ' active' : '');
          btn.textContent = DIFFICULTY_PRESETS[id].label;
          btn.addEventListener('click', () => {
            selected = id;
            setSlotDifficulty(slot, id);
            hint.textContent = DIFFICULTY_PRESETS[id].hint;
            btns
              .querySelectorAll('.slot-diff-btn')
              .forEach((b) => b.classList.toggle('active', b === btn));
          });
          btns.appendChild(btn);
        }
        picker.append(label, btns, hint);
        card.appendChild(picker);
      }

      const actions = document.createElement('div');
      actions.className = 'slot-actions';
      if (exists) {
        const playBtn = document.createElement('button');
        playBtn.type = 'button';
        playBtn.className = 'btn primary slot-play-btn';
        playBtn.textContent = 'Jugar';
        playBtn.addEventListener('click', () => {
          setActiveSlot(slot);
          scheduleCloudSync();
          onPlay();
        });
        actions.appendChild(playBtn);
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn slot-delete-btn';
        deleteBtn.textContent = 'Borrar';
        deleteBtn.addEventListener('click', () => {
          const name = slotName(slot);
          const sure = window.confirm(
            `¿Borrar la partida "${name}"? Se pierde para siempre.`
          );
          if (!sure) return;
          deleteSlot(slot);
          scheduleCloudSync();
          render();
        });
        actions.appendChild(deleteBtn);
      } else {
        const createBtn = document.createElement('button');
        createBtn.type = 'button';
        createBtn.className = 'btn primary slot-create-btn';
        createBtn.textContent = 'Crear';
        createBtn.addEventListener('click', () => {
          // Empty slot: keep whatever name was typed (the change
          // event fired on blur, before this click).
          setActiveSlot(slot);
          scheduleCloudSync();
          onPlay(); // the team screen builds the fresh save
        });
        actions.appendChild(createBtn);
      }
      card.appendChild(actions);
      mainEl.appendChild(card);
    }
  }

  render();
}
