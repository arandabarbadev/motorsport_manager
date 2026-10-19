# Data model 017

## Sin cambios persistentes

Nada nuevo en localStorage ni Firestore: los avisos son efímeros (DOM + timers) y se alimentan de eventos que el motor ya emite (`RaceEvent.incidentKind === 'mechanical'`).

## Nuevo módulo: `src/notices.ts`

```ts
type NoticeKind = 'info' | 'success' | 'alert';
interface NoticeInput { title: string; body?: string; kind?: NoticeKind; ttlMs?: number; }
interface NoticeHub { notify(input: NoticeInput): void; clear(): void; destroy(): void; }
const NOTICE_MAX_VISIBLE = 4;
const NOTICE_DEFAULT_TTL_MS = 7000;
function createNoticeHub(mount: HTMLElement): NoticeHub;
```

- El montaje debe estar posicionado (relative/absolute): el stack se pone `absolute` arriba a la derecha.
- Contracto de reuse: las pantallas futuras (patrocinadores, fichajes, moral) llaman `notify()` con su propio texto/kind; nada específico de carrera vive en el módulo.

## CSS compartido (ui.css)

`.notice-stack` (columna, esquina, pointer-events none) · `.notice[.alert|.success|.info]` (filo izquierdo) · `.notice-title`/`.notice-body` · `.notice.leaving` (fundido 300 ms).
