# Spec 017 — Avisos en el HUD (componente genérico) y retiradas por avería visibles

## Contexto

Las averías mecánicas ya existen (`simulation.ts`: `MECH_FAILURE_PER_SEC` → DNF silencioso) y desde 012 sueltan un texto flotante "¡Avería! P#" y una línea en el feed, pero nada destacado nombra al piloto: a velocidad 20x el retiro pasa desapercibido (y el bug de `drawCars` corregido en 015 hacía que además los coches desaparecieran). Rafa quiere un AVISO breve en el HUD de carrera cuando un coche se retira por avería — nombre y posición — y que sea un componente GENÉRICO de aviso, porque los próximos specs (patrocinadores, fichajes, moral del piloto) reutilizarán el mismo tipo de aviso.

## Historias de usuario

- **HU1 (P1)** — Cuando un coche se retira por avería mecánica, veo al instante un aviso sobre el circuito con el nombre del piloto y la posición en la que iba; se va solo a los pocos segundos.
- **HU2 (P1)** — Como desarrollador del juego, necesito un componente de avisos reutilizable (montable en cualquier pantalla) para patrocinadores, fichajes y moral sin reescribir UI.

## Requisitos funcionales

- **FR-001**: módulo `src/notices.ts` — `createNoticeHub(montaje)` devuelve `{ notify({title, body?, kind?, ttlMs?}), clear(), destroy() }`; apila tarjetas (máx. 4 visibles, la más nueva arriba, la más vieja se cae), autodesaparece a los `ttlMs` (7 s por defecto) con fundido, y no bloquea clics.
- **FR-002**: tres clases visuales: `alert` (rojo), `success` (verde), `info` (azul) — solo cambia el filo izquierdo de la tarjeta.
- **FR-003**: en la carrera, la retirada por avería mecánica (`incidentKind === 'mechanical'`) lanza `notify({ kind:'alert', title:'Retirada por avería', body:'<piloto> · P<posición>' })`. Trompos y accidentes NO lanzan aviso (ya tienen su feedback de 012).
- **FR-004**: el texto flotante "¡Avería! P#" y la línea del feed se conservan; el aviso es la capa que nombra al piloto.

## Requisitos no funcionales

- El hub es DOM puro + CSS compartido (`ui.css`), sin dependencias del motor ni de la carrera: montable en la pantalla de equipo u otras.
- Motor intacto (ninguna constante de simulación cambia).
- Legible en móvil (ancho acotado, arriba a la derecha del circuito, sin tapar el semáforo).

## Escenarios

- **SC-001**: a 20x, un motor dice basta → tarjeta roja "Retirada por avería / Nombre Piloto · P7" arriba a la derecha del trazado; a los 7 s se desvanece sola.
- **SC-002**: dos averías seguidas → dos tarjetas apiladas, la nueva arriba; más de 4 → la más vieja desaparece.
- **SC-003**: el aviso no tapa la clasificación ni los controles, y no intercepta el dedo (pointer-events none).

## Casos límite

- Avería del propio jugador: mismo aviso (con su nombre).
- Avería con la carrera en pausa: el aviso aparece igual (es DOM; el ttl es tiempo real).
- Pantalla estrecha: la tarjeta se acota al ancho del circuito.
