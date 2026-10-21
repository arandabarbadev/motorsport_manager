# Spec 018 — Trazados reales legibles y lluvia jugable

## Contexto

Tres cosas que se ven mal o se juegan a ciegas hoy:

1. **Jerez se ve roto.** El geojson `es-1986` venía del way 831985059 de OSM, que es el
   PERÍMETRO del recinto (`leisure=sports_centre`, 64 nodos dispersos), no la pista. El
   Catmull-Rom "inventa" curvas para unir puntos sueltos: zigzags arriba y trazos fundidos
   abajo. La pista real está en OSM como ways `highway=raceway` con nombre de curva
   (Dry Sac, Sito Pons, Ferrari, Lorenzo…) y se puede ensamblar (hecho: 4,426 km vs 4,428
   reales — 2 m de diferencia).
2. **Circuitos que se funden.** Con carretera del 7,5 % del lado corto, los tramos paralelos
   se pegan (métrica mínima en unidades normalizadas: Suzuka 0,007 por el puente, Bakú 0,007,
   Yeda 0,010, **Singapur 0,019**, Mónaco 0,025…). En Singapur las "eses" del casco antiguo
   se ven como un mancha. Además el borde actual apenas se distingue: no se ve dónde acaba
   la pista.
3. **La lluvia es muda.** El tiempo cambia (dry↔lightRain↔heavyRain) y las gomas son
   slick o wet, nada en medio: en lluvia ligera la elección correcta no existe y el jugador
   solo descubre la lluvia cuando los rivales entran a boxes.

Además, el calendario 010 mezcló 5 clásicos no-F1 (Kyalami, Le Mans, Nürburgring, Estoril,
Jerez); Rafa quiere solo F1… menos Jerez, que se queda.

## Historias de usuario

- **HU1 (P1)** — Como jugador, el circuito de Jerez se ve como el de verdad (mismas curvas,
  misma silueta), no una mancha con zigzags.
- **HU2 (P1)** — El calendario son las 20 rondas F1 + Jerez fuera de copa… es decir, 20
  rondas: los 19 circuitos F1 actuales del juego + Jerez. Fuera Kyalami, Le Mans,
  Nürburgring y Estoril.
- **HU3 (P1)** — En circuitos urbanos (Singapur, Mónaco, Yeda) los tramos paralelos se
  DISTINGUEN: no se funden, y una línea blanca marca dónde acaba el asfalto en todos los
  circuitos y temas.
- **HU4 (P1)** — Existe la goma INTERMEDIA para lluvia ligera: mejor que slicks con llivia
  y mejor que wet en ligera; en seco o lluvia fuerte rinde menos.
- **HU5 (P1)** — Cuando empieza a llover (o escampa) salta un aviso en el HUD (el hub del
  spec 017): no tengo que enterarme porque los rivales cambian gomas.

## Requisitos funcionales

- **FR-001**: Jerez real — el geojson `data/f1-circuits/es-1986.geojson` se sustituye por la
  vuelta ensamblada de los ways `highway=raceway`+`sport=motor` del mapa OSM del circuito
  (sin Pit Lane ni karts). El pipeline del tool (`tools/convert-layouts.js`) no cambia:
  se regenera y sale el Jerez bueno.
- **FR-002**: calendario de 20 rondas — fuera Kyalami, Le Mans, Nürburgring y Estoril de
  `TRACK_PROFILES`, `REAL_LAYOUTS` y el CALENDAR del tool (Jerez se queda).
- **FR-003**: migración — `loadCareer` ya reconstruye el calendario desde `ALL_TRACKS`;
  los resultados de rondas retiradas se descartan (como Barcelona en 010), presupuesto y
  `currentRaceIndex` (recortado al nuevo rango) intactos.
- **FR-004**: línea blanca de borde — el asfalto se pinta sobre una línea blanca un poco más
  ancha y un halo oscuro exterior, en los dos temas: se ve dónde termina la pista.
- **FR-005**: sin fusiones — carretera al 6 % del lado corto (antes 7,5 %) + descolisión
  determinista del trazado (relajación por pares, separación mínima entre tramos no
  vecinos ≥ 0,078) para que Singapur/Mónaco/Yeda/Bakú se lean como cintas separadas.
- **FR-006**: goma `inter` en `TyreCompound` — ritmo y desgaste dependen del binomio
  compuesto×tiempo: en lightRain la inter es la mejor (por delante de wet y de slicks); en
  dry y heavyRain penaliza. Botón "I" en Mis boxes (verde F1), chip en tabla y boxes.
- **FR-007**: IA de boxes — lluvia ligera monta `inter`, fuerte monta `wet`, y al secar
  vuelve a slicks; los conjuntos "adecuados" son dry={S,M,H}, lightRain={I,W},
  heavyRain={I,W}.
- **FR-008**: aviso de cambio de tiempo con el hub genérico 017 — "Lluvia ligera/goma
  intermedia recomendada" (info), "Lluvia fuerte/goma de lluvia recomendada" (alert),
  "Escampa/la pista se seca" (success).

## Requisitos no funcionales

- Descolisión determinista (sin aleatoriedad): mismos trazados siempre, harness portable.
- El harness amplía sus checks: 20 circuitos, Jerez presente, separación mínima post-fix
  y (nuevo) simulación con lluvia ligera donde la IA para a `inter`.
- El motor no cambia su reloj ni sus eventos; solo pace/wear gana el eje compuesto×tiempo.
- Legible en móvil (el borde blanco también se ve en canvas pequeños).

## Escenarios

- **SC-001**: carrera en Jerez → silueta reconocible (recta+horquillas), sin zigzags.
- **SC-002**: carrera en Singapur → las eses cercanas del casco se ven como tramos
  separados con su línea blanca entre medias.
- **SC-003**: carrera con riesgo de lluvia → al primer cambio a lightRain salta el aviso
  "Lluvia ligera"; en Mis boxes está el botón I; los rivales entran y salen con I.
- **SC-004**: save con una carrera hecha en Kyalami → tras cargar, la temporada tiene 20
  rondas, ese resultado ya no está, el presupuesto no cambia.

## Casos límite

- El cruce del puente de Suzuka no se "resuelve": la descolisión lo abre lo justo para que
  se vea el cruce, sin romper la figura de 8.
- Un DNF/avería bajo lluvia no duplica avisos (017) ni cambia el feed.
- `inter` guardada en un save en curso no existía: los estados solo usaban S/M/H/W, así que
  no hay migración de gomas pendientes que hacer.
- Carrera entera en seco: nada de esto altera el ritmo (tablas idénticas a hoy en dry).
