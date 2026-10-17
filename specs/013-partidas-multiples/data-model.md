# Modelo de datos: Partidas múltiples

**Fecha**: 2026-10-17 · **Spec**: [spec.md](spec.md)

## Cambios por entidad

### Ranura de partida — NUEVA (`src/slots.ts`)

```ts
export type SlotId = 'a' | 'b' | 'c';
export const SLOT_IDS: readonly SlotId[];

getActiveSlot(): SlotId            // 'f1manager:active-slot' (default 'a')
setActiveSlot(slot: SlotId): void
rosterKeyFor(slot): string         // 'f1manager:roster:a' …
careerKeyFor(slot): string         // 'f1manager:career:a' …
slotName(slot): string             // meta o 'Partida 1/2/3' (máx 24 car.)
setSlotName(slot, name): void      // vacío -> nombre por defecto
slotExists(slot): boolean          // existe career del slot
deleteSlot(slot): void             // borra roster+career+nombre del slot
migrateLegacySaves(): void         // v1 -> ranura A (una vez, MOViendo claves)
slotSummary(slot): { season, round, budget } | null  // para la tarjeta
```

- Estado: claves de localStorage `f1manager:active-slot` y `f1manager:slots-meta` (`{"a":"Nombre",…}`).
- `Roster` y `CareerState` (contenido): **SIN CAMBIOS**; solo cambian sus claves de guardado a por-ranura.

### Guardados v1 (storage-keys.ts) — ORIGEN DE MIGRACIÓN

- `f1manager:roster:v1` y `f1manager:career:v1` dejan de usarse para leer/escribir; si existen al arrancar y no hay `career:a`, se mueven a la ranura A y se eliminan.

### Documento de nube (cloud.ts) — CAMBIA EL SOBRE

```ts
// Antes: { career: string | null, roster: string | null }
// Ahora:
interface CloudSlotsDoc {
  slots: Record<'a' | 'b' | 'c', { career: string | null; roster: string | null; name: string | null }>;
  active: SlotId;
}
```

- Mismo documento: `f1manager/{uid}` (colección `f1manager`).
- Pull: si el documento no tiene `slots` pero sí `career`/`roster` (formato viejo), se interpreta como ranura A. Si el sobre difiere del local, se aplica el de la nube (ranuras + nombres + activa) y se recarga una vez.
- Push: siempre formato nuevo, con las 3 ranuras leídas de localStorage.

### Pantalla de partidas — NUEVA (solo vista)

- `slots-screen.ts`: 3 tarjetas (`.slot-card`), nombre editable (`.slot-name-input`), resumen, botones `.slot-play-btn` / `.slot-create-btn` / `.slot-delete-btn`; confirmación de borrado con `window.confirm`. Nada persistente propio (todo va por slots.ts).

## Entidades SIN cambios

- `Roster`, `CareerState`, `SeasonResult`, motor de carrera, campeonato, economía, PWA: intactos.

## Migraciones

1. **Local v1 → ranura A** (al arrancar, una vez): mover claves, activar A. Solo si `career:a` no existe (nunca se machaca una ranura ya jugada).
2. **Nube vieja → ranura A** (en el pull): documento sin `slots` con `career`/`roster` → ranura A.
