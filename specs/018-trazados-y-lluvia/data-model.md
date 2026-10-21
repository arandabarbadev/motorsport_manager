# Data model 018

## `types.ts`

```ts
type TyreCompound = 'soft' | 'medium' | 'hard' | 'inter' | 'wet';
```

`Weather`, `RaceState`, `RaceCarState` sin cambios. Ningún save persiste compuestos, así
que no hay migración de gomas.

## `simulation.ts` (constantes nuevas, motor intacto)

```ts
// escala del penalty de tiempo según acierto de goma (0.15 = goma del tiempo)
const RUBBER_SCALE: number /* compound × weather */
// penalty extra por goma inadecuada
const RUBBER_EXTRA: number /* compound × weather */
// desgaste relativo por tiempo (dry ×1)
const WEAR_SCALE: number /* compound × weather */
```

Tablas exactas en `research.md` §4. `computePace` y `computeWearRate` las consultan;
`runPitStopAI` pasa a conjuntos adecuados + goma preferida por tiempo.

## `tracks-generator.ts`

```ts
const ROAD_DECLASH_TARGET = 0.078;        // separación mínima de paralelos (>10% de arco)
const ROAD_DECLASH_NEAR_TARGET = 0.058;   // plegamientos (6-10% de arco) abren menos
const ROAD_DECLASH_ITERS = 300;           // iteraciones de relajación (determinista)
function declash(path: Point[]): Point[]  // repulsión por pares con arco > 6 %,
                                          // empuje COTADO (max(d, 0.25·T)) para que
                                          // los cruces reales no exploten,
                                          // desplazamiento suavizado ±3 muestras
```

`TRACK_PROFILES`/`REAL_LAYOUTS`/`convert-layouts.js` CALENDAR: 20 rondas (fuera kyalami,
lemans, nurburgring, estoril; Jerez se queda con geojson nuevo ensamblado de OSM).

## `career.ts` (migración)

`loadCareer`: tras migrar ids, `seasonResults` se filtra a los `trackId` presentes en el
nuevo calendario (igual que Barcelona en 010; presupuesto y `currentRaceIndex` intactos,
el índice se recorta al rango).

## `race-screen.ts` (render + lluvia)

- `drawTrackLayer`: 3 trazos — halo (`--track-halo`), línea blanca (`#ffffff`,
  `road + 2·edge`), asfalto (`--track-asphalt`, `road = 0.06 · min(w,h)`).
- `COMPOUND_LABEL.inter = 'I'`; botones Mis boxes con `title` español (Intermedios…).
- Aviso de cambio de tiempo: `lastWeather` en el estado de pantalla; tras cada
  `simulationTick`, si `state.weather` cambia → `notices.notify` (ligera info / fuerte
  alert / escampa success) con la goma recomendada en el cuerpo.

## `ui.css`

```css
--track-halo: rgba(0,0,0,0.45)   (oscuro) / rgba(31,35,40,0.35) (claro)
```

`race-screen.css`: `.tyre.inter { background: #43b02a }` (verde intermedio F1).
