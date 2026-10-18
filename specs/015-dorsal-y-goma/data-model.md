# Data model 015

## Sin cambios persistentes

Nada nuevo en localStorage ni en Firestore: la goma que se muestra ya vive en `RaceCarState.tyre` (motor) y el dorsal en `Driver.number` (roster). Toda la feature es render + HUD.

## Constantes de render (race-screen.ts)

| Constante | Antes | Ahora |
|---|---|---|
| radio mínimo del coche | 4 px | **7 px** (para que quepa el dorsal en móvil) |
| factor de radio | 0,013 | 0,013 (sin cambios) |
| fuente del dorsal | `max(11, r·1,5)` a `y − 2,1r` | `max(9, rr·1,05)` centrada (rr = radio efectivo) |

## Contratos internos

- `StandingRow`: sin cambios de forma; las filas de rivales añaden clase `no-tyre` y sus celdas `.tyre`/`.wear` quedan vacías.
- `PBox` (`PitBox`): + `tyreEl: HTMLElement`, `wearFill: HTMLElement`, `pctEl: HTMLElement` — refs de la línea `.pit-tyre` del box.
