# Research 016 — De dónde salen los números

## Puntos de anclaje actuales (spec 009)

- `roster.ts`: `INITIAL_BUDGET = 200` (era 350) → `createDefaultRoster` lo mete en `team.budget` del jugador, y team-screen siembra con eso el career: `getOrCreateCareer(playerEntry().team.budget)`.
- `sponsors.ts`: `SPONSOR_COUNT = 150`, `payPerRace = round10(0.3 + frac·2,7)` (0,3…3,0), `MAX_ACTIVE_SPONSORS = 8`.
- `prize-table.ts`: `PRIZE_TABLE` 100…1 M€, sin escala.
- `finance.ts`: sueldos (4+4), alquiler (6), personal (2/nivel) — NO se tocan.

Los tres presets reutilizan exactamente esos tres puntos: presupuesto inicial, min/max del pago de patrocinio (sustituyendo las constantes 0,3/2,7 por el par del preset) y multiplicador de premios. Nada de sistemas nuevos.

## Dónde se decide la dificultad de una partida nueva

Flujo real (spec 013): "Partidas" → tarjeta vacía → (nombre) → **Crear** → `setActiveSlot(slot)` → `onPlay()` → team-screen, que hace `loadRoster() ?? createDefaultRoster()` + `getOrCreateCareer(...)`. Es decir, la creación material ocurre en team-screen al ENTRAR; la pantalla de partidas solo activa la ranura. Por eso la elección viaja en una clave local por ranura (`f1manager:slot-diff`) que team-screen lee al crear y queda horneada en `CareerState.difficulty` (que sí viaja al cloud dentro del career).

## Consumidores del pago de patrocinio

Solo dos: `finance.sponsorIncome` (cobra) y el listado de team-screen (muestra). `Sponsor.payPerRace` desaparece como campo fijo y pasa a calcularse `sponsorPayPerRace(sponsor, difficulty) = round10(min + payFrac·(max−min))`; `payFrac = id/(SPONSOR_COUNT−1)` conserva el ranking 0=peor…149=mejor y las exigencias P20…P1 intactas.

## Migración

`loadCareer` ya hace merge defensivo con defaults por campo (patrón de 010/011/013): añadir `difficulty: difficultyOrHard(parsed.difficulty)` sigue el mismo molde. Un valor desconocido o corrupto cae en `hard` = números vigentes = cero cambio para guardados existentes.

## Verificación

- Harness: el módulo `difficulty.ts` es puro (sin localStorage) y los extremos son deterministas → `difficultySelfCheck` (monotonía de presets, extremos del pago en las 3 dificultades, P1 fácil=150 / duro=100, default `hard`).
- En vivo (`mm-v016.js`, DOM por CDP): crear B en Fácil → presupuesto 350, patrocinio tope "5 M€" en la pestaña; sembrar un career A sin `difficulty` → recarga → etiqueta "Difícil" y tope "3 M€"; localStorage de B con `"difficulty":"easy"`; tarjetas con su etiqueta.
