# Plan 017 — Avisos en el HUD

## Cambios

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `src/notices.ts` (NUEVO) | `createNoticeHub(mount)`: pila `.notice-stack` (máx 4, prepend), tarjetas `.notice.{kind}` con `.notice-title`/`.notice-body`, autodesaparición con fundido a `ttlMs` (7 s), `clear()`/`destroy()`. `NOTICE_MAX_VISIBLE` y `NOTICE_DEFAULT_TTL_MS` exportados. |
| 2 | `src/ui.css` | estilos compartidos del stack y las tarjetas (kind = filo izquierdo), animación de entrada y fundido de salida, `pointer-events: none`, ancho acotado. |
| 3 | `src/race-screen.ts` | hub montado en `.track-wrap`; en `consumeRaceEvents`, rama `incidentKind === 'mechanical'` → `notify({ kind:'alert', title:'Retirada por avería', body: piloto · P# })`. Nada más. |

## Constitution Check — PASA

- Docs antes que código ✔ · regla VIII sin secretos ✔ · regla IX: build + harness sin regresión + `mm-v017.js` en vivo (fiabilidad del roster sembrada a 0 por localStorage → carrera a 20x → esperar aviso real; se comprueba contenido, tope de 4 y autodesaparición) ✔ · regla X carpeta abierta ✔.

## Riesgos y mitigación

- **Forzar una avería en la verificación sin tocar el motor**: se siembra el roster del save (localStorage, camino real) con `reliability: 0` en los 20 coches → tasa mecánica máxima del juego real; a 20x el primer DNF por avería llega en minutos, con reintentos de carrera si no sale.
- **Avisos que tapan el juego**: ancho acotado, esquina superior derecha del circuito (el semáforo va centrado y la bandera arriba a la izquierda), sin captura de puntero.
- **Fugas de timers**: `destroy()` limpia todo; la pantalla de carrera se reconstruye por `container.innerHTML=''` y el hub muere con el DOM (los timers pendientes solo harían `remove()` sobre nodos ya huérfanos — inofensivo).
