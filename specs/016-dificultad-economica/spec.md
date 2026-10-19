# Spec 016 — Dificultad económica al crear la partida

## Contexto

El spec 009 fijó UNA sintonía dura para todo el mundo (presupuesto inicial 200 M€, 150 patrocinadores que pagan 0,3–3,0 M€, premios de la tabla tal cual). Con las 3 partidas del spec 013 tiene sentido que la dificultad se elija AL CREAR cada una, en vez de que todas compartan la misma curva. Es exponer lo ya construido (`prize-table.ts`, `finance.ts`, `sponsors.ts`, `roster.ts`) como 2-3 presets, no un sistema nuevo.

## Historias de usuario

- **HU1 (P1)** — Al crear una partida en una ranura vacía, elijo la dificultad económica (Fácil / Normal / Difícil) y veo en una línea qué cambia (dinero inicial, patrocinios y premios).
- **HU2 (P1)** — Como jugador con partidas ya empezadas, mis guardados existentes NO cambian: se quedan en la sintonía actual (Difícil) sin perder progreso.
- **HU3 (P2)** — En la tarjeta de cada partida veo su dificultad, para saber a qué juego me vuelvo.

## Requisitos funcionales

- **FR-001**: tres presets — Fácil (350 M€, patrocinios 0,5–5,0 M€, premios ×1,5), Normal (280 M€, 0,4–4,5 M€, ×1,25), Difícil (200 M€, 0,3–3,0 M€, ×1 — exactamente los números vigentes de 009).
- **FR-002**: la elección se hace en la tarjeta de la ranura vacía (selector de 3 botones, Normal por defecto) y se aplica al PULSAR Crear: presupuesto del roster y del career, y dificultad guardada en `CareerState.difficulty`.
- **FR-003**: la dificultad vive en el career (por ranura) y viaja con él: patrocinios mostrados y cobrados, e ingresos por premio, usan el preset de ESA partida.
- **FR-004**: migración — careers guardados sin `difficulty` se leen como `hard`; nada más cambia (presupuesto, temporada, patrocinadores intactos).
- **FR-005**: "Reiniciar" reconstruye la partida con el presupuesto de SU dificultad y mantiene la dificultad elegida.
- **FR-006**: la tarjeta de cada ranura muestra la dificultad (guardada o heredada); la ranura vacía muestra el selector.

## Requisitos no funcionales

- Módulo `difficulty.ts` puro (sin localStorage ni DOM) para que el harness lo compruebe.
- El cloud sync no cambia: la dificultad va dentro del JSON del career.

## Escenarios

- **SC-001**: ranura B vacía → elijo "Fácil" → Crear → Mi Equipo arranca con 350 M€ y el carrito de patrocinadores llega a 5,0 M€/carrera.
- **SC-002**: ranura A con guardado pre-016 → sigue con su presupuesto y la tarjeta dice "Difícil"; patrocinios tope a 3,0 M€.
- **SC-003**: en una partida Normal, el P5 paga 45 × 1,25 = 56 M€ (redondeado), en Difícil 45.
- **SC-004**: dos ranuras con dificultades distintas muestran sus etiquetas en "Partidas".

## Casos límite

- Borrar una ranura borra también su elección pendiente de dificultad.
- `difficulty` con valor corrupto/nuevo en el JSON → se lee como `hard` (defensivo, igual que el resto del career).
- Crear sin tocar el selector → Normal.
